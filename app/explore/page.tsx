"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { MatchResult, SkillRequest } from "../types/explore";
import UserCard from "../components/UserCard";

export default function ExplorePage() {
    const [matches, setMatches] = useState<MatchResult[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            console.log("🔵 EXPLORE STARTED");

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
                let { data: profile } = await supabase
                    .from("users")
                    .select("*")
                    .eq("id", req.user_id)
                    .maybeSingle();

                // 4) Auto-create profile if missing (FULL COLUMN SET)
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

                finalMatches.push({
                    ...req,
                    full_name: profile.full_name || "Unnamed User",
                    bio: profile.bio || "No bio yet.",
                    avatar_url:
                        profile.avatar_url ||
                        `https://api.dicebear.com/7.x/thumbs/svg?seed=${req.user_id}`,
                });
            }

            console.log("myTeach/myLearn:", myTeach, myLearn);
console.log("others count:", others?.length);

console.log(
  "MATCH DEBUG",
  others?.map((req: any) => ({
    id: req.id,
    user_id: req.user_id,
    theirTeach: req.skills_offered.trim().toLowerCase(),
    theirLearn: req.skills_wanted.trim().toLowerCase(),
  }))
);
console.log("finalMatches:", finalMatches.length);

            setMatches(finalMatches);
            setLoading(false);
        };

        load();
    }, []);

    if (loading) return <div className="p-10">Loading...</div>;

    if (matches.length === 0)
        return <div className="p-10">No matching users found.</div>;

    return (
        <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-6">
            {matches.map((match) => (
                <UserCard key={match.id} match={match} />
            ))}
        </div>
    );
}
