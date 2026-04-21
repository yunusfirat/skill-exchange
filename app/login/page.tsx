/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  const handleLogin = async (e: any) => {
    e.preventDefault()

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
    } else {
      router.push("/dashboard")
    }
  }

return (
  <div className="p-10 max-w-md mx-auto">
    <h1 className="text-2xl font-bold mb-4">Login</h1>

    <form onSubmit={handleLogin} className="flex flex-col gap-4">
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
        Login
      </button>
    </form>

    {/* 🔥 Signup link */}
    <p className="text-sm text-gray-600 mt-4">
      Don’t have an account?{" "}
      <span
        onClick={() => (window.location.href = "/signup")}
        className="text-blue-600 cursor-pointer hover:underline"
      >
        Sign up
      </span>
    </p>
  </div>
)


}
