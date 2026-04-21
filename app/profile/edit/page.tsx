"use client"

import { useEffect, useState } from "react"
import { supabase } from "../../../lib/supabaseClient"
import { useRouter } from "next/navigation"

export default function EditProfilePage() {
  const router = useRouter()

  const [fullName, setFullName] = useState("")
  const [bio, setBio] = useState("")
  const [skillsOffered, setSkillsOffered] = useState("")
  const [skillsWanted, setSkillsWanted] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        console.error("No authenticated user found")
        return
      }

      // Check if profile exists
      const { data: profile } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single()

      // If no profile → create one
      if (!profile) {
        await supabase.from("users").insert({
          id: user.id,
          full_name: "",
          bio: "",
          skills_offered: "",
          skills_wanted: "",
        })
        setLoading(false)
        return
      }

      // Fill form with existing data
      setFullName(profile.full_name || "")
      setBio(profile.bio || "")
      setSkillsOffered(profile.skills_offered || "")
      setSkillsWanted(profile.skills_wanted || "")
      setLoading(false)
    }

    loadProfile()
  }, [])

  const handleSave = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      console.error("No authenticated user found")
      return
    }

    await supabase
      .from("users")
      .update({
        full_name: fullName,
        bio,
        skills_offered: skillsOffered,
        skills_wanted: skillsWanted,
      })
      .eq("id", user.id)

    router.push("/dashboard")
  }

  if (loading) return <div className="p-10">Loading...</div>

  return (
    <div className="p-10 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Edit Profile</h1>

      <div className="flex flex-col gap-4">
        <input
          type="text"
          placeholder="Full Name"
          className="border p-2 rounded"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />

        <textarea
          placeholder="Bio"
          className="border p-2 rounded"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
        />

        <input
          type="text"
          placeholder="Skills You Can Teach"
          className="border p-2 rounded"
          value={skillsOffered}
          onChange={(e) => setSkillsOffered(e.target.value)}
        />

        <input
          type="text"
          placeholder="Skills You Want to Learn"
          className="border p-2 rounded"
          value={skillsWanted}
          onChange={(e) => setSkillsWanted(e.target.value)}
        />

        <button
          onClick={handleSave}
          className="bg-blue-600 text-white p-2 rounded"
        >
          Save
        </button>
      </div>
    </div>
  )
}
