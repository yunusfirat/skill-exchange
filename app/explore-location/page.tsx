"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { MatchResult, SkillRequest } from "../types/explore";
import UserCard from "../components/UserCard";

export default function ExploreByLocationPage() {
    const [matches, setMatches] = useState<MatchResult[]>([]);
    const [loading, setLoading] = useState(true);
    const [distance, setDistance] = useState(20);

    const [myLat, setMyLat] = useState<number | null>(null);
    const [myLng, setMyLng] = useState<number | null>(null);

    // Haversine
    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
        const R = 6371;
        const dLat = ((lat2 - lat1) * Math.PI) / 180;
        const dLon = ((lon2 - lon1) * Math.PI) / 180;

        const a =
            Math.sin(dLat / 2) ** 2 +
            Math.cos(lat1 * Math.PI / 180) *
                Math.cos(lat2 * Math.PI / 180) *
                Math.sin(dLon / 2) ** 2;

        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    };

    useEffect(() => {
        const load = async () => {
            const {
                data: { user },
            } = await supabase.auth.getUser();

            if (!user) return;

            // Load my location
            let { data: myProfile } = await supabase
                .from("users")
                .select("*")
                .eq("id", user.id)
                .maybeSingle();

            // ❗ Profil yoksa → oluştur
            if (!myProfile) {
                const { data: newProfile } = await supabase
                    .from("users")
                    .insert({
                        id: user.id,
                        full_name: "",
                        bio: "",
                        avatar_url: "",
                        username: "",
                        location: "",
                        timezone: "",
                        experience_level: "",
                        availability: "",
                        languages: "",
                        city: "",
                        country: "",
                        lat: null,
                        lng: null,
                        skills_offered: "",
                        skills_wanted: "",
                    })
                    .select()
                    .maybeSingle();

                myProfile = newProfile;
            }

            if (myProfile.lat == null || myProfile.lng == null) {
                setMatches([]);
                setLoading(false);
                return;
            }

            setMyLat(myProfile.lat);
            setMyLng(myProfile.lng);

            // Load my request
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

            // Load others
            const { data: others } = await supabase
                .from("skill_requests")
                .select("*")
                .neq("user_id", user.id);

            if (!others) {
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

                // Load profile with location
                let { data: profile } = await supabase
                    .from("users")
                    .select("*")
                    .eq("id", req.user_id)
                    .maybeSingle();

                if (!profile) {
                    const { data: newProfile } = await supabase
                        .from("users")
                        .insert({
                            id: req.user_id,
                            full_name: "",
                            bio: "",
                            avatar_url: "",
                            username: "",
                            location: "",
                            timezone: "",
                            experience_level: "",
                            availability: "",
                            languages: "",
                            city: "",
                            country: "",
                            lat: null,
                            lng: null,
                            skills_offered: "",
                            skills_wanted: "",
                        })
                        .select()
                        .maybeSingle();

                    profile = newProfile;
                }
                if (profile.lat == null || profile.lng == null) continue;

                const dist = calculateDistance(
                    myProfile.lat,
                    myProfile.lng,
                    profile.lat,
                    profile.lng
                );

                if (dist > distance) continue;

                finalMatches.push({
                    ...req,
                    full_name: profile.full_name || "Unnamed User",
                    bio: profile.bio || "No bio yet.",
                    avatar_url:
                        profile.avatar_url ||
                        `https://api.dicebear.com/7.x/thumbs/svg?seed=${req.user_id}`,
                    distance: Math.round(dist),
                });
            }

            setMatches(finalMatches);
            setLoading(false);
        };

        load();
    }, [distance]);

    if (loading) return <div className="p-10">Loading...</div>;

    return (
        <div className="p-10">
            <h1 className="text-2xl font-bold mb-4">Explore by Location</h1>

            {/* Distance Slider */}
            <div className="mb-6">
                <label className="text-sm font-medium">
                    Distance: {distance} km
                </label>
                <input
                    type="range"
                    min={5}
                    max={100}
                    step={5}
                    value={distance}
                    onChange={(e) => setDistance(Number(e.target.value))}
                    className="w-full"
                />
            </div>

            {matches.length === 0 ? (
                <div>No matching users found within {distance} km.</div>
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
