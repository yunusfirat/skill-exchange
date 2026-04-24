"use client"

import { useEffect, useState } from "react"
import { supabase } from "../../lib/supabaseClient"

export default function SkillRequestPage() {
    const [skillsOffered, setSkillsOffered] = useState("")
    const [skillsWanted, setSkillsWanted] = useState("")
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [requests, setRequests] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    // Load previous requests
    useEffect(() => {
        const loadRequests = async () => {
            const {
                data: { user },
            } = await supabase.auth.getUser()

            if (!user) return

            const { data } = await supabase
                .from("skill_requests")
                .select("*")
                .eq("user_id", user.id)
                .order("created_at", { ascending: false })

            setRequests(data || [])
            setLoading(false)
        }

        loadRequests()
    }, [])

    // Send request
    const sendRequest = async () => {
        const {
            data: { user },
        } = await supabase.auth.getUser()

        if (!user) return
        if (!skillsOffered.trim() || !skillsWanted.trim()) {
            alert("Please fill both fields")
            return
        }

        const { data, error } = await supabase
            .from("skill_requests")
            .insert({
                user_id: user.id,
                skills_offered: skillsOffered,
                skills_wanted: skillsWanted,
            })
            .select()
            .maybeSingle();

        if (error) {
            console.error(error)
            alert("Error sending request")
            return
        }

        // Add to UI log
        setRequests((prev) => [data, ...prev])

        // Clear form
        setSkillsOffered("")
        setSkillsWanted("")

        alert("Request sent!")
    }

    return (
        <div className="max-w-xl mx-auto p-10 space-y-8">
            <h1 className="text-2xl font-bold">Skill Exchange Request</h1>

            {/* FORM */}
            <div className="space-y-4 p-5 border rounded-xl shadow-sm bg-white">
                <div className="space-y-2">
                    <label className="font-medium">Skills You Can Teach</label>
                    <input
                        className="border p-2 rounded w-full"
                        placeholder="e.g. JavaScript, Guitar, Cooking"
                        value={skillsOffered}
                        onChange={(e) => setSkillsOffered(e.target.value)}
                    />
                </div>

                <div className="space-y-2">
                    <label className="font-medium">Skills You Want to Learn</label>
                    <input
                        className="border p-2 rounded w-full"
                        placeholder="e.g. Python, Piano, Photography"
                        value={skillsWanted}
                        onChange={(e) => setSkillsWanted(e.target.value)}
                    />
                </div>

                <button
                    onClick={sendRequest}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg w-full"
                >
                    Send Request
                </button>
            </div>

            {/* LOG */}
            <div className="space-y-4">
                <h2 className="text-xl font-semibold">Your Previous Requests</h2>

                {loading && <div>Loading...</div>}

                {requests.length === 0 && !loading && (
                    <div className="text-gray-500">You have no previous requests.</div>
                )}

                {requests.map((req) => (
                    <div
                        key={req.id}
                        className="border p-4 rounded-lg bg-gray-50 shadow-sm"
                    >
                        <p>
                            <strong>Offered:</strong> {req.skills_offered}
                        </p>
                        <p>
                            <strong>Wanted:</strong> {req.skills_wanted}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                            {new Date(req.created_at).toLocaleString()}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    )
}
