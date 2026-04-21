/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { supabase } from "../../../lib/supabaseClient"
import Link from "next/link"


export default function ProfileDetail() {
    const params = useParams()
    const id = params.id as string
    const [user, setUser] = useState<any>(null)
    const [loading, setLoading] = useState(true)

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
        <div className="p-10">
            <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-2xl">
                    {user.full_name ? user.full_name.charAt(0).toUpperCase() : "U"}
                </div>

                <div>
                    <h1 className="text-3xl font-bold">{user.full_name}</h1>
                    <p className="text-gray-600">{user.bio || "No bio provided"}</p>
                    <div className="mt-6">
                        <Link
                            href={`/chat/${user.id}`}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                        >
                            Message
                        </Link>
                    </div>
                </div>
            </div>

            <div className="mt-6">
                <h2 className="text-xl font-semibold mb-2">Skills Offered</h2>
                <div className="flex flex-wrap gap-2">
                    {(user.skills_offered || "—")
                        .split(",")
                        .map((skill: string, i: number) => (
                            <span
                                key={i}
                                className="px-3 py-1 bg-green-100 text-green-700 rounded-md"
                            >
                                {skill.trim()}
                            </span>
                        ))}
                </div>
            </div>

            <div className="mt-6">
                <h2 className="text-xl font-semibold mb-2">Skills Wanted</h2>
                <div className="flex flex-wrap gap-2">
                    {(user.skills_wanted || "—")
                        .split(",")
                        .map((skill: string, i: number) => (
                            <span
                                key={i}
                                className="px-3 py-1 bg-purple-100 text-purple-700 rounded-md"
                            >
                                {skill.trim()}
                            </span>
                        ))}
                </div>
            </div>
        </div>

        
    )
}
