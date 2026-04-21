"use client"

import { useEffect, useState } from "react"
import { supabase } from "../../lib/supabaseClient"
import { getOrCreateConversation } from "@/lib/getOrCreateConversation"

export default function ExplorePage() {
    const [matches, setMatches] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const load = async () => {
            console.log("🔵 EXPLORE STARTED")

            const {
                data: { user },
            } = await supabase.auth.getUser()

            if (!user) return

            // 1) Benim request'im
            const { data: myReq } = await supabase
                .from("skill_requests")
                .select("*")
                .eq("user_id", user.id)
                .order("created_at", { ascending: false })
                .limit(1)
                .single()

            if (!myReq) {
                setMatches([])
                setLoading(false)
                return
            }

            const myTeach = myReq.skills_offered.trim().toLowerCase()
            const myLearn = myReq.skills_wanted.trim().toLowerCase()

            // 2) Diğer kullanıcıların request'leri
            const { data: others } = await supabase
                .from("skill_requests")
                .select("*")
                .neq("user_id", user.id)

            if (!others || others.length === 0) {
                setMatches([])
                setLoading(false)
                return
            }

            const finalMatches = []

            for (const req of others) {
                const theirTeach = req.skills_offered.trim().toLowerCase()
                const theirLearn = req.skills_wanted.trim().toLowerCase()

                const isMatch =
                    myTeach === theirLearn &&
                    myLearn === theirTeach

                if (!isMatch) continue

                // 3) Profil çek
                let { data: profile } = await supabase
                    .from("users")
                    .select("full_name, bio, avatar_url")
                    .eq("id", req.user_id)
                    .single()

                // 4) Profil yoksa otomatik oluştur
                if (!profile) {
                    const { data: newProfile } = await supabase
                        .from("users")
                        .insert({
                            id: req.user_id,
                            full_name: "",
                            bio: "",
                            avatar_url: "",
                        })
                        .select()
                        .single()

                    profile = newProfile
                }

                finalMatches.push({
                    ...req,
                    full_name: profile?.full_name || "Unnamed User",
                    bio: profile?.bio || "No bio yet.",
                    avatar_url:
                        profile?.avatar_url ||
                        `https://api.dicebear.com/7.x/thumbs/svg?seed=${req.user_id}`,
                })
            }

            setMatches(finalMatches)
            setLoading(false)
        }

        load()
    }, [])

    if (loading) return <div className="p-10">Loading...</div>

    if (matches.length === 0)
        return <div className="p-10">No matching users found.</div>

    return (
        <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-6">
            {matches.map((req) => (
                <div
                    key={req.id}
                    className="border p-4 rounded shadow flex gap-4 items-start"
                >
                    <img
                        src={req.avatar_url}
                        className="w-16 h-16 rounded-full border"
                        alt="avatar"
                    />

                    <div>
                        <h2 className="font-bold text-lg">{req.full_name}</h2>
                        <p className="text-sm text-gray-600 mb-2">{req.bio}</p>

                        <p><strong>Teaches:</strong> {req.skills_offered}</p>
                        <p><strong>Wants to Learn:</strong> {req.skills_wanted}</p>
                    </div>

                    <button
                        onClick={async () => {
                            const {
                                data: { user },
                            } = await supabase.auth.getUser()

                            if (!user) {
                                console.error("No authenticated user found")
                                return
                            }

                            const conversationId = await getOrCreateConversation(
                                user.id,
                                req.user_id
                            )

                            window.location.href = `/chat/${conversationId}`
                        }}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                    >
                        Start Chat
                    </button>
                </div>
            ))}
        </div>
    )
}
