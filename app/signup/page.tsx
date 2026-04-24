"use client"
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react"
import { supabase } from "../../lib/supabaseClient"

import { useRouter } from "next/navigation"

export default function SignupPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  const handleSignup = async (e: any) => {
    e.preventDefault()

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      return
    }

    const user = data.user

    if (user) {
      await supabase.from("users").insert({
        id: user.id,
        full_name: "",
        bio: "",
        avatar_url: "",
        username: "",
        location: "",
        timezone: "",
        experience_level: [],
        availability: [],
        languages: [],
        city: "",
        country: "",
        lat: null,
        lng: null,
      })
    }

    // ✔ Signup başarılı → login sayfasına yönlendir
    router.push("/login")
  }

  return (
    <div className="p-10 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Sign Up</h1>

      <form onSubmit={handleSignup} className="flex flex-col gap-4">
        <input
          type="email"
          placeholder="Email"
          className="border p-2 rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="border p-2 rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && <p className="text-red-500">{error}</p>}

        <button className="bg-black text-white p-2 rounded">
          Create Account
        </button>
      </form>

      {/* 🔥 Login link */}
      <p className="text-sm text-gray-600 mt-4">
        Already have an account{" "}
        <span
          onClick={() => (window.location.href = "/login")}
          className="text-blue-600 cursor-pointer hover:underline"
        >
          Login
        </span>
      </p>
    </div>
  )

}
