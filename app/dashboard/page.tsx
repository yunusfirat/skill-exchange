/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useEffect, useState } from "react"
import { supabase } from "../../lib/supabaseClient"
import { useRouter } from "next/navigation"
import Image from "next/image"

export default function DashboardPage() {
  const router = useRouter()
  const [profile, setProfile] = useState<any>(null)
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/login")
        return
      }

      setEmail(user.email ?? "")

      // Load profile data to check completion status
      const { data: existingProfile } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .maybeSingle()

      // ProfileBootstrap already creates profile
      if (!existingProfile) {
        setLoading(false)
        return
      }

      setProfile(existingProfile)
      setLoading(false)
    }

    load()
  }, [])

  if (loading) return <div className="p-10">Loading...</div>

  const completion =
    (profile?.full_name ? 25 : 0) +
    (profile?.bio ? 25 : 0) +
    (profile?.skills_offered?.length ? 25 : 0) +
    (profile?.skills_wanted?.length ? 25 : 0)

  return (
    <div className="p-10 max-w-3xl mx-auto space-y-10">

      {/* Welcome Card */}
      <div className="bg-white shadow rounded-xl p-6 flex items-center gap-6">
        <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200 border border-gray-300 shadow-sm relative">
          {profile?.avatar_url ? (
            <Image
              src={profile.avatar_url}
              alt="Avatar"
              fill
              sizes="64px"
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
              No Photo
            </div>
          )}
        </div>

        <div>
          <h1 className="text-2xl font-bold">
            Welcome, {profile?.full_name || "New User"} 👋
          </h1>
          <p className="text-gray-600">{email}</p>
        </div>
      </div>

      {/* Profile Completion */}
      <div className="bg-white shadow rounded-xl p-6">
        <h2 className="text-xl font-semibold mb-2">Profile Completion</h2>
        <div className="w-full bg-gray-200 h-3 rounded-full mb-3">
          <div
            className="bg-green-500 h-3 rounded-full"
            style={{ width: `${completion}%` }}
          />
        </div>
        <p className="text-gray-600 mb-4">{completion}% completed</p>

        <button
          onClick={() => router.push("/profile")}
          className="bg-black text-white px-4 py-2 rounded-lg"
        >
          Edit Profile
        </button>
      </div>

      {/* Skills Summary */}
      <div className="bg-white shadow rounded-xl p-6">
        <h2 className="text-xl font-semibold mb-4">Your Skills</h2>

        <div className="mb-4">
          <h3 className="font-medium">Skills Offered</h3>
          <p className="text-gray-600">
            {profile?.skills_offered?.length
              ? profile.skills_offered.join(", ")
              : "Not set"}
          </p>
        </div>

        <div>
          <h3 className="font-medium">Skills Wanted</h3>
          <p className="text-gray-600">
            {profile?.skills_wanted?.length
              ? profile.skills_wanted.join(", ")
              : "Not set"}
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button
          onClick={() => router.push("/explore")}
          className="bg-white shadow p-4 rounded-xl hover:bg-gray-100"
        >
          Explore People
        </button>

        <button
          onClick={() => router.push("/skill-request")}
          className="bg-white shadow p-4 rounded-xl hover:bg-gray-100"
        >
          Create Request
        </button>

        <button
          onClick={() => router.push("/chat")}
          className="bg-white shadow p-4 rounded-xl hover:bg-gray-100"
        >
          Messages
        </button>

        <button
          onClick={() => router.push("/profile")}
          className="bg-white shadow p-4 rounded-xl hover:bg-gray-100"
        >
          Profile
        </button>
      </div>

    </div>
  )
}
