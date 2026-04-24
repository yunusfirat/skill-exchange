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
  const [username, setUsername] = useState("")
  const [location, setLocation] = useState("")
  const [timezone, setTimezone] = useState("")
  const [experienceLevel, setExperienceLevel] = useState("")
  const [availability, setAvailability] = useState("")
  const [languages, setLanguages] = useState("")
  const [city, setCity] = useState("")
  const [country, setCountry] = useState("")
  const [lat, setLat] = useState(null)
  const [lng, setLng] = useState(null)

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      const { data: profile } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single()

      // If no profile → create one with ALL columns
      if (!profile) {
        await supabase.from("users").insert({
          id: user.id,
          full_name: "",
          bio: "",
          skills_offered: "",
          skills_wanted: "",
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
        })
        setLoading(false)
        return
      }

      // Fill form
      setFullName(profile.full_name || "")
      setBio(profile.bio || "")
      setSkillsOffered(profile.skills_offered || "")
      setSkillsWanted(profile.skills_wanted || "")
      setUsername(profile.username || "")
      setLocation(profile.location || "")
      setTimezone(profile.timezone || "")
      setExperienceLevel(profile.experience_level || "")
      setAvailability(profile.availability || "")
      setLanguages(profile.languages || "")
      setCity(profile.city || "")
      setCountry(profile.country || "")
      setLat(profile.lat)
      setLng(profile.lng)

      setLoading(false)
    }

    loadProfile()
  }, [])

  const handleSave = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    await supabase
      .from("users")
      .update({
        full_name: fullName,
        bio,
        skills_offered: skillsOffered,
        skills_wanted: skillsWanted,
        username,
        location,
        timezone,
        experience_level: experienceLevel,
        availability,
        languages,
        city,
        country,
        lat,
        lng,
      })
      .eq("id", user.id)

    router.push("/dashboard")
  }

  if (loading) return <div className="p-10">Loading...</div>

  return (
    <div className="p-10 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Edit Profile</h1>

      <div className="flex flex-col gap-4">
        <input className="border p-2 rounded" placeholder="Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
        <textarea className="border p-2 rounded" placeholder="Bio" value={bio} onChange={(e) => setBio(e.target.value)} />
        <input className="border p-2 rounded" placeholder="Skills You Can Teach" value={skillsOffered} onChange={(e) => setSkillsOffered(e.target.value)} />
        <input className="border p-2 rounded" placeholder="Skills You Want to Learn" value={skillsWanted} onChange={(e) => setSkillsWanted(e.target.value)} />

        <input className="border p-2 rounded" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
        <input className="border p-2 rounded" placeholder="Location" value={location} onChange={(e) => setLocation(e.target.value)} />
        <input className="border p-2 rounded" placeholder="Timezone" value={timezone} onChange={(e) => setTimezone(e.target.value)} />
        <input className="border p-2 rounded" placeholder="Experience Level" value={experienceLevel} onChange={(e) => setExperienceLevel(e.target.value)} />
        <input className="border p-2 rounded" placeholder="Availability" value={availability} onChange={(e) => setAvailability(e.target.value)} />
        <input className="border p-2 rounded" placeholder="Languages" value={languages} onChange={(e) => setLanguages(e.target.value)} />
        <input className="border p-2 rounded" placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} />
        <input className="border p-2 rounded" placeholder="Country" value={country} onChange={(e) => setCountry(e.target.value)} />

        <button onClick={handleSave} className="bg-blue-600 text-white p-2 rounded">
          Save
        </button>
      </div>
    </div>
  )
}
