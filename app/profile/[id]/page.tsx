/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { supabase } from "../../../lib/supabaseClient"
import Image from "next/image"
import { getOrCreateConversation } from "@/lib/getOrCreateConversation";
import LocationMap from "../../components/LocationMap" // mini map component

export default function ProfileDetail() {
    const params = useParams()
    const id = params.id as string

    const [user, setUser] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    const parseSkills = (value: any): string[] => {
        if (!value) return [];
        if (Array.isArray(value)) return value;
        if (typeof value === "string") return value.split(",").map(s => s.trim());
        return [];
    };

    useEffect(() => {
        const loadUser = async () => {
            const { data } = await supabase
                .from("users")
                .select("*")
                .eq("id", id)
                .single()

            setUser(data)
            setLoading(false)
        }

        loadUser()
    }, [id])

    if (loading) return <div className="p-10">Loading...</div>
    if (!user) return <div className="p-10">User not found.</div>

    return (
        <div className="p-10 max-w-3xl mx-auto">

            {/* HEADER */}
            <div className="flex items-center gap-6 mb-10">

                {/* Avatar */}
                <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 border relative">
                    {user.avatar_url ? (
                        <Image
                            src={user.avatar_url}
                            alt={user.full_name}
                            fill
                            className="object-cover"
                            sizes="64px"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-gray-500">
                            {user.full_name?.charAt(0).toUpperCase() || "U"}
                        </div>
                    )}
                </div>

                {/* Name + Bio */}
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">{user.full_name}</h1>
                    <p className="text-gray-600 mt-1">{user.bio || "No bio provided"}</p>

                    {/* Message Button */}
                    <button
                        onClick={async () => {
                            const {
                                data: { user: me },
                            } = await supabase.auth.getUser()

                            if (!me) return

                            const conversationId = await getOrCreateConversation(me.id, id)
                            window.location.href = `/chat/${conversationId}`
                        }}
                        className="
              mt-4
              px-4 
              py-2.5 
              bg-indigo-600 
              text-white 
              rounded-xl 
              font-medium 
              hover:bg-indigo-700 
              transition
            "
                    >
                        Start Chat
                    </button>
                </div>
            </div>

            {/* SKILLS OFFERED */}
            <div className="mb-8">
                <h2 className="text-xl font-semibold mb-2">Can Teach</h2>
                <div className="flex flex-wrap gap-2">
                    {parseSkills(user.skills_offered).map((skill: string, i: number) => (
                        <span
                            key={i}
                            className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full border border-blue-100 text-sm"
                        >
                            {skill}
                        </span>
                    ))}
                </div>

            </div>

            {/* SKILLS WANTED */}
            <div className="mb-8">
                <h2 className="text-xl font-semibold mb-2">Wants to Learn</h2>
                <div className="flex flex-wrap gap-2">
                   {parseSkills(user.skills_wanted).map((skill: string, i: number) => (
                            <span
                                key={i}
                                className="
                  px-3 
                  py-1 
                  bg-green-50 
                  text-green-700 
                  rounded-full 
                  border 
                  border-green-100 
                  text-sm
                "
                            >
                                {skill.trim()}
                            </span>
                        ))}
                </div>
            </div>

            {/* LOCATION MAP */}
            {user.lat && user.lng && (
                <div className="mt-10">
                    <h2 className="text-xl font-semibold mb-3">Location</h2>
                    <LocationMap lat={user.lat} lng={user.lng} />
                </div>
            )}
        </div>
    )
}
