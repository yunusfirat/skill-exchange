"use client"

import { useRouter } from "next/navigation"

export default function LandingPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen flex flex-col">

      {/* NAVBAR */}
      <nav className="w-full flex justify-between items-center py-4 px-6 border-b">
        <div className="text-xl font-bold">SkillExchange</div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/login")}
            className="text-gray-700 hover:text-black"
          >
            Login
          </button>

          <button
            onClick={() => router.push("/signup")}
            className="bg-black text-white px-4 py-2 rounded-lg"
          >
            Sign Up
          </button>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="text-center py-20 px-6">
        <h1 className="text-4xl font-bold mb-4">
          Exchange Skills. Learn Faster. Teach Better.
        </h1>

        <p className="text-lg text-gray-600 max-w-xl mx-auto mb-6">
          SkillExchange is a global platform where people teach what they know and learn what they don’t.
          No payments, no barriers — just pure knowledge exchange.
        </p>

        <button
          onClick={() => router.push("/signup")}
          className="bg-black text-white px-6 py-3 rounded-lg text-lg"
        >
          Get Started Free
        </button>
      </section>

      {/* FEATURES */}
      <section className="py-16 px-6 grid md:grid-cols-3 gap-10 max-w-5xl mx-auto">
        <div>
          <h3 className="text-xl font-semibold mb-2">Learn & Teach</h3>
          <p className="text-gray-600">
            Share your skills with others and learn new ones in return. Everyone grows together.
          </p>
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-2">Smart Matching</h3>
          <p className="text-gray-600">
            We match you with people who want to learn what you teach — and teach what you want to learn.
          </p>
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-2">Built-in Chat</h3>
          <p className="text-gray-600">
            Connect instantly, plan sessions, and exchange ideas through our integrated chat system.
          </p>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-16 px-6 bg-gray-50">
        <h2 className="text-3xl font-bold text-center mb-10">What Our Users Say</h2>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">

          <div className="p-6 bg-white rounded-xl shadow">
            <p className="text-gray-700 italic">
              “I traded guitar lessons for frontend mentoring. Best learning experience I’ve ever had.”
            </p>
            <p className="mt-4 font-semibold">— Alex M.</p>
          </div>

          <div className="p-6 bg-white rounded-xl shadow">
            <p className="text-gray-700 italic">
              “I practice English with native speakers and teach Turkish in return. Amazing platform.”
            </p>
            <p className="mt-4 font-semibold">— Sara K.</p>
          </div>

          <div className="p-6 bg-white rounded-xl shadow">
            <p className="text-gray-700 italic">
              “Learning new skills without paying a penny feels unreal. Clean UI and super easy to use.”
            </p>
            <p className="mt-4 font-semibold">— Daniel R.</p>
          </div>

        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-10 text-center text-gray-600">
        <p>© 2026 SkillExchange. All rights reserved.</p>
      </footer>

    </div>
  )
}
