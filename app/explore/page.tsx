"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { MatchResult, SkillRequest } from "../types/explore";
import UserCard from "../components/UserCard";

export default function ExplorePage() {
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [loading, setLoading] = useState(true);

  // ⭐ Yeni: Distance Filter
  const [distanceFilter, setDistanceFilter] = useState<number | null>(null);

  // ⭐ Kullanıcının kendi konumu
  const [myCoords, setMyCoords] = useState<{ lat: number | null; lng: number | null }>({
    lat: null,
    lng: null,
  });

  // ⭐ Mesafe hesaplama fonksiyonu (Haversine)
  const calcDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) ** 2;

    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  useEffect(() => {
    const load = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      // 1) My request
      const { data: myReq } = await supabase
        .from("skill_requests")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!myReq) {
        setMatches([]);
        setLoading(false);
        return;
      }

      const myTeach = myReq.skills_offered.trim().toLowerCase();
      const myLearn = myReq.skills_wanted.trim().toLowerCase();

      // ⭐ Fetch my profile to get my coordinates
      const { data: myProfile } = await supabase
        .from("users")
        .select("lat, lng")
        .eq("id", user.id)
        .maybeSingle();

      setMyCoords({
        lat: myProfile?.lat || null,
        lng: myProfile?.lng || null,
      });

      // 2) Other users' requests
      const { data: others } = await supabase
        .from("skill_requests")
        .select("*")
        .neq("user_id", user.id);

      if (!others || others.length === 0) {
        setMatches([]);
        setLoading(false);
        return;
      }

      const finalMatches: MatchResult[] = [];

      for (const req of others as SkillRequest[]) {
        const theirTeach = req.skills_offered.trim().toLowerCase();
        const theirLearn = req.skills_wanted.trim().toLowerCase();

        const isMatch = myTeach === theirLearn && myLearn === theirTeach;
        if (!isMatch) continue;

        // 3) Fetch profile
        const { data: profile } = await supabase
          .from("users")
          .select("*")
          .eq("id", req.user_id)
          .maybeSingle();

        if (!profile) continue;

        // ⭐ Distance filtering
        if (
          distanceFilter &&
          myCoords.lat &&
          myCoords.lng &&
          profile.lat &&
          profile.lng
        ) {
          const km = calcDistance(myCoords.lat, myCoords.lng, profile.lat, profile.lng);
          if (km > distanceFilter) continue;
        }

        finalMatches.push({
          ...req,
          full_name: profile.full_name || "Unnamed User",
          bio: profile.bio || "No bio yet.",
          avatar_url:
            profile.avatar_url ||
            `https://api.dicebear.com/7.x/thumbs/svg?seed=${req.user_id}`,
        });
      }

      setMatches(finalMatches);
      setLoading(false);
    };

    load();
  }, [distanceFilter]); // ⭐ Filter değişince yeniden yükle

  if (loading) return <div className="p-10">Loading...</div>;

  return (
    <div className="p-10">
      {/* ⭐ Dropdown Filter */}
      <div className="mb-6">
        <label className="font-semibold mr-3">Filter by distance:</label>
        <select
          className="border p-2 rounded"
          value={distanceFilter ?? ""}
          onChange={(e) =>
            setDistanceFilter(e.target.value ? Number(e.target.value) : null)
          }
        >
          <option value="">No filter</option>
          <option value="5">Within 5 km</option>
          <option value="10">Within 10 km</option>
          <option value="20">Within 20 km</option>
          <option value="50">Within 50 km</option>
          <option value="100">Within 100 km</option>
        </select>
      </div>

      {/* Results */}
      {matches.length === 0 ? (
        <div>No matching users found.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {matches.map((match) => (
            <UserCard key={match.id} match={match} />
          ))}
        </div>
      )}
    </div>
  );
}
