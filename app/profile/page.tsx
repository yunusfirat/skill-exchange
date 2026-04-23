"use client"

import { useEffect, useState, ChangeEvent } from "react"
import { supabase } from "../../lib/supabaseClient"
import LocationMap from "../components/LocationMap"

// ---------------------------------------------
// PREDEFINED SKILL LISTS (GLOBAL STANDARD)
// ---------------------------------------------

const skillCategories = {
  "Software & Tech": [
    "JavaScript",
    "TypeScript",
    "React",
    "Node.js",
    "Python",
    "SQL",
    "HTML/CSS",
    "UI/UX",
    "Git & GitHub",
  ],
  Languages: [
    "English",
    "Turkish",
    "Spanish",
    "German",
    "French",
    "Arabic",
    "Japanese",
    "Chinese",
  ],
  Music: ["Guitar", "Piano", "Singing", "Music Theory"],
  "Creative Arts": ["Drawing", "Painting", "Photography", "Video Editing"],
  "Business & Career": [
    "Public Speaking",
    "Marketing",
    "Sales",
    "Project Management",
    "Resume Review",
  ],
  "Life Skills": ["Cooking", "Fitness", "Meditation", "Time Management"],
}

const languageList = [
  "English",
  "Turkish",
  "German",
  "French",
  "Spanish",
  "Arabic",
  "Japanese",
  "Chinese",
]

const experienceLevels = ["Beginner", "Intermediate", "Advanced", "Expert"]

const availabilityOptions = [
  "Weekdays",
  "Weekends",
  "Mornings",
  "Evenings",
  "Flexible",
]

// ---------------------------------------------
// PROFILE TYPE
// ---------------------------------------------

type Profile = {
  id: string
  full_name: string | null
  bio: string | null
  avatar_url: string | null
  username: string | null
  location: string | null
  timezone: string | null
  skills_offered: string[] | null
  skills_wanted: string[] | null
  experience_level: string | null
  availability: string | null
  languages: string[] | null
  city: string | null
  country: string | null
  lat: number | null
  lng: number | null
}

// ---------------------------------------------
// COMPONENT
// ---------------------------------------------

export default function ProfilePage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState(false)

  const [profile, setProfile] = useState<Profile | null>(null)
  const [errors, setErrors] = useState<string[]>([])
  const [message, setMessage] = useState<string | null>(null)

  // FORM FIELDS
  const [fullName, setFullName] = useState("")
  const [username, setUsername] = useState("")
  const [location, setLocation] = useState("")
  const [timezone, setTimezone] = useState("")
  const [bio, setBio] = useState("")
  const [experienceLevel, setExperienceLevel] = useState("")
  const [availability, setAvailability] = useState("")

  const [skillsOffered, setSkillsOffered] = useState<string[]>([])
  const [skillsWanted, setSkillsWanted] = useState<string[]>([])
  const [languages, setLanguages] = useState<string[]>([])

  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [avatarUploading, setAvatarUploading] = useState(false)

  const [city, setCity] = useState("")
  const [country, setCountry] = useState("")
  const [coords, setCoords] = useState<{ lat: number | null; lng: number | null }>({
    lat: null,
    lng: null,
  })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [authUser, setAuthUser] = useState<any>(null)



  // ---------------------------------------------
  // LOAD PROFILE
  // ---------------------------------------------

  useEffect(() => {
    const loadProfile = async () => {
      const { data: authData } = await supabase.auth.getUser()
      if (!authData.user) return

      setAuthUser(authData.user)

      const { data } = await supabase
        .from("users")
        .select("*")
        .eq("id", authData.user.id)
        .single()

      if (data) {
        const p = data as Profile
        setProfile(p)

        setFullName(p.full_name || "")
        setUsername(p.username || "")
        setLocation(p.location || "")
        setTimezone(p.timezone || "")
        setBio(p.bio || "")
        setExperienceLevel(p.experience_level || "")
        setAvailability(p.availability || "")
        setSkillsOffered(p.skills_offered || [])
        setSkillsWanted(p.skills_wanted || [])
        setLanguages(p.languages || [])
        setAvatarUrl(p.avatar_url || null)
        setCity(p.city || "")
        setCountry(p.country || "")
        setCoords({
          lat: p.lat || null,
          lng: p.lng || null,
        })
      }
      setLoading(false)
    }

    loadProfile()
  }, [])



  // ---------------------------------------------
  // VALIDATION
  // ---------------------------------------------

  const validate = () => {
    const errs: string[] = []

    if (!fullName.trim()) errs.push("Full name is required.")
    if (!username.trim()) errs.push("Username is required.")
    if (!location.trim()) errs.push("Location is required.")
    if (!timezone.trim()) errs.push("Timezone is required.")
    if (!bio.trim()) errs.push("Bio is required.")
    if (!skillsOffered.length) errs.push("At least one offered skill is required.")
    if (!skillsWanted.length) errs.push("At least one wanted skill is required.")
    if (!languages.length) errs.push("At least one language is required.")
    if (!experienceLevel.trim()) errs.push("Experience level is required.")

    setErrors(errs)
    return errs.length === 0
  }

  // ---------------------------------------------
  // SAVE PROFILE
  // ---------------------------------------------

  const handleSave = async () => {
    if (!profile) return
    if (!validate()) return

    setSaving(true)
    setMessage(null)

    await supabase
      .from("users")
      .update({
        full_name: fullName,
        username,
        location,
        timezone,
        bio,
        experience_level: experienceLevel,
        availability,
        skills_offered: skillsOffered,
        skills_wanted: skillsWanted,
        languages,
      })
      .eq("id", profile.id)

    setSaving(false)
    setEditing(false)
    setMessage("Profile updated successfully.")
  }

  // ---------------------------------------------
  // AVATAR UPLOAD
  // ---------------------------------------------

  const handleAvatarChange = async (e: ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0]
      if (!file || !profile) return

      setAvatarUploading(true)
      const fileExt = file.name.split(".").pop()
      const fileName = `${profile.id}-${Date.now()}.${fileExt}`
      const filePath = `avatars/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: publicUrlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath)

      const publicUrl = publicUrlData.publicUrl

      await supabase
        .from("users")
        .update({ avatar_url: publicUrl })
        .eq("id", profile.id)

      setAvatarUrl(publicUrl)
      setMessage("Avatar updated successfully.")
    } catch (err) {
      console.error(err)
      setMessage("Error uploading avatar.")
    } finally {
      setAvatarUploading(false)
    }
  }

  // ---------------------------------------------
  // VIEW MODE CHECK
  // ---------------------------------------------

  const isComplete =
    fullName &&
    username &&
    location &&
    timezone &&
    bio &&
    skillsOffered.length &&
    skillsWanted.length &&
    experienceLevel &&
    languages.length

  if (loading) return <p className="p-10">Loading...</p>

  // ---------------------------------------------
  // UI STARTS HERE
  // ---------------------------------------------

  return (
    <div className="p-10 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Your Profile</h1>

      {/* ERRORS */}
      {errors.length > 0 && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg text-sm">
          <ul className="list-disc ml-4">
            {errors.map((err) => (
              <li key={err}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      {/* SUCCESS */}
      {message && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 p-4 rounded-lg text-sm">
          {message}
        </div>
      )}

      {/* VIEW MODE */}
      {!editing && (
        <div className="space-y-6">
          {!isComplete && (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 p-4 rounded-lg text-sm">
              Your profile is incomplete. Please update your information.
            </div>
          )}

          {/* HEADER */}
          <div className="bg-white shadow rounded-xl p-6 flex gap-6">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200">
              {avatarUrl && (
                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              )}
            </div>

            <div>
              <h2 className="text-xl font-semibold">{fullName}</h2>
              <p className="text-gray-600">@{username}</p>
              <p className="text-gray-600">{location}</p>
              <p className="text-gray-600">{timezone}</p>
            </div>
          </div>

          {/* DETAILS */}
          <div className="bg-white shadow rounded-xl p-6 space-y-4">
            <p><strong>Bio:</strong> {bio}</p>
            <p><strong>Experience Level:</strong> {experienceLevel}</p>
            <p><strong>Availability:</strong> {availability}</p>

            <p><strong>Skills Offered:</strong></p>
            <div className="flex flex-wrap gap-2">
              {skillsOffered.map((s) => (
                <span key={s} className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs">
                  {s}
                </span>
              ))}
            </div>

            <p><strong>Skills Wanted:</strong></p>
            <div className="flex flex-wrap gap-2">
              {skillsWanted.map((s) => (
                <span key={s} className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs">
                  {s}
                </span>
              ))}
            </div>

            <p><strong>Languages:</strong></p>
            <div className="flex flex-wrap gap-2">
              {languages.map((l) => (
                <span key={l} className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs">
                  {l}
                </span>
              ))}
            </div>

            {coords.lat && coords.lng && (
              <div className="mt-6">
                <h2 className="text-xl font-semibold mb-3">Your Location:</h2>
                {city || country ? `${city}${city && country ? ", " : ""}${country}` : "Not set"}

                <div className="mt-3 w-full max-w-sm h-40 rounded-xl overflow-hidden border shadow-sm">
                  <LocationMap lat={coords.lat} lng={coords.lng} />
                </div>
              </div>
            )}

          </div>

          {/* UPDATE BUTTON */}
          <button
            onClick={() => setEditing(true)}
            className="bg-black text-white px-6 py-2 rounded-lg"
          >
            Update Profile
          </button>
        </div>
      )}

      {/* EDIT MODE */}
      {editing && (
        <div className="space-y-8">

          {/* AVATAR + BASIC INFO */}
          <div className="bg-white shadow rounded-xl p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col items-center gap-4">

              {/* Avatar */}
              <div className="w-28 h-28 rounded-full overflow-hidden shadow-sm border border-gray-200 bg-gray-100">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                    No Photo
                  </div>
                )}
              </div>

              {/* Hidden file input */}
              <input
                id="avatarUpload"
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
                disabled={avatarUploading}
              />

              {/* Apple-style button */}
              <label
                htmlFor="avatarUpload"
                className="
        cursor-pointer 
        px-4 py-2 
        rounded-full 
        text-sm 
        font-medium 
        bg-gray-100 
        text-gray-700 
        hover:bg-gray-200 
        transition 
        shadow-sm
      "
              >
                {avatarUploading ? "Uploading…" : "Change Photo"}
              </label>

            </div>

            {/* BASIC INFO */}
            <div className="md:col-span-2 space-y-4">
              <input
                className="w-full border rounded-lg px-3 py-2 text-sm"
                placeholder="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />

              <input
                className="w-full border rounded-lg px-3 py-2 text-sm"
                placeholder="@username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />

              <input
                className="w-full border rounded-lg px-3 py-2 text-sm"
                placeholder="City, Country"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />

              <input
                className="w-full border rounded-lg px-3 py-2 text-sm"
                placeholder="Timezone (e.g. Europe/Istanbul)"
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
              />
            </div>
          </div>


          {/* SKILLS SECTION */}
          <div className="bg-white shadow rounded-xl p-6 space-y-6">

            {/* OFFERED SKILLS */}
            <div>
              <label className="block text-sm font-medium mb-2">Skills Offered</label>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(skillCategories).map(([category, skills]) => (
                  <div key={category}>
                    <p className="font-medium text-gray-700 mb-1">{category}</p>

                    {skills.map((skill) => (
                      <label key={skill} className="flex items-center gap-2 text-sm mb-1">
                        <input
                          type="checkbox"
                          checked={skillsOffered.includes(skill)}
                          onChange={() => {
                            if (skillsOffered.includes(skill)) {
                              setSkillsOffered(skillsOffered.filter((s) => s !== skill))
                            } else {
                              setSkillsOffered([...skillsOffered, skill])
                            }
                          }}
                        />
                        {skill}
                      </label>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* WANTED SKILLS */}
            <div>
              <label className="block text-sm font-medium mb-2">Skills Wanted</label>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(skillCategories).map(([category, skills]) => (
                  <div key={category}>
                    <p className="font-medium text-gray-700 mb-1">{category}</p>

                    {skills.map((skill) => (
                      <label key={skill} className="flex items-center gap-2 text-sm mb-1">
                        <input
                          type="checkbox"
                          checked={skillsWanted.includes(skill)}
                          onChange={() => {
                            if (skillsWanted.includes(skill)) {
                              setSkillsWanted(skillsWanted.filter((s) => s !== skill))
                            } else {
                              setSkillsWanted([...skillsWanted, skill])
                            }
                          }}
                        />
                        {skill}
                      </label>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* LANGUAGES */}
            <div>
              <label className="block text-sm font-medium mb-2">Languages</label>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {languageList.map((lang) => (
                  <label key={lang} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={languages.includes(lang)}
                      onChange={() => {
                        if (languages.includes(lang)) {
                          setLanguages(languages.filter((l) => l !== lang))
                        } else {
                          setLanguages([...languages, lang])
                        }
                      }}
                    />
                    {lang}
                  </label>
                ))}
              </div>
            </div>

            {/* EXPERIENCE + AVAILABILITY */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Experience Level</label>
                <select
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  value={experienceLevel}
                  onChange={(e) => setExperienceLevel(e.target.value)}
                >
                  <option value="">Select level</option>
                  {experienceLevels.map((lvl) => (
                    <option key={lvl} value={lvl}>
                      {lvl}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Availability</label>
                <select
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  value={availability}
                  onChange={(e) => setAvailability(e.target.value)}
                >
                  <option value="">Select availability</option>
                  {availabilityOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* BIO */}
            <div>
              <label className="block text-sm font-medium mb-1">Bio</label>
              <textarea
                className="w-full border rounded-lg px-3 py-2 text-sm min-h-[80px]"
                placeholder="Tell others about yourself..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
            </div>
          </div>



          <div className="space-y-4 mt-6">
            <h3 className="text-lg font-semibold">Location</h3>

            {/* Use My Location */}
            <button
              onClick={() => {
                navigator.geolocation.getCurrentPosition(async (pos) => {
                  const { latitude, longitude } = pos.coords;

                  await supabase
                    .from("users")
                    .update({
                      lat: latitude,
                      lng: longitude,
                    })
                    .eq("id", authUser.id);

                  alert("Location updated successfully");
                });
              }}
              className="px-4 py-2 bg-black text-white rounded-md"
            >
              Use My Location
            </button>

            {coords.lat && coords.lng && (
              <LocationMap lat={coords.lat} lng={coords.lng} />
            )}
            {/* Manual City Selection */}
            <div className="flex flex-col space-y-2">
              <label className="text-sm font-medium">City</label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="border rounded-md px-3 py-2"
              >
                <option value="">Select a city</option>
                <option value="London">London</option>
                <option value="Manchester">Manchester</option>
                <option value="Berlin">Berlin</option>
                <option value="Istanbul">Istanbul</option>
                <option value="New York">New York</option>
                <option value="Toronto">Toronto</option>
              </select>
            </div>

            <button
              onClick={async () => {
                await supabase
                  .from("users")
                  .update({
                    city,
                    country: "United Kingdom",
                  })
                  .eq("id", authUser.id)

                alert("City updated successfully")
              }}
              className="px-4 py-2 bg-black text-white rounded-md"
            >
              Save City
            </button>
          </div>
          {/* ACTION BUTTONS */}
          <div className="flex justify-end gap-4">
            <button
              onClick={() => setEditing(false)}
              className="px-6 py-2 rounded-lg border"
            >
              Cancel
            </button>

            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-black text-white px-6 py-2 rounded-lg disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save Profile"}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
