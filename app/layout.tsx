"use client"

import "./globals.css"
import Link from "next/link"
import { ReactNode } from "react"
import { usePathname } from "next/navigation"
import { supabase } from "../lib/supabaseClient"
import "mapbox-gl/dist/mapbox-gl.css"
import ProfileBootstrap from "./ProfileBootstrap"


export default function RootLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = "/"
  }
  // Hide navbar on these routes (e.g. login/signup)
  const hideNavbarOn = ["/", "/login", "/signup"]

  const shouldShowNavbar = !hideNavbarOn.includes(pathname)

  return (
    <html lang="en">
      <body className="bg-gray-50">

        {shouldShowNavbar && (
          <nav className="flex items-center justify-between p-4 border-b bg-white">
            <Link href="/" className="font-bold text-xl">
              Skill Exchange
            </Link>

            <div className="flex gap-6 items-center text-sm font-medium">

              <Link href="/explore" className="hover:text-blue-600">
                Explore
              </Link>
              <Link href="/dashboard" className="hover:text-blue-600">
                Dashboard
              </Link>

              <Link href="/skill-request" className="hover:text-blue-600">
                Request
              </Link>

              <Link href="/chat" className="hover:text-blue-600">
                Messages
              </Link>

              <Link href="/profile" className="hover:text-blue-600">
                Profile
              </Link>
               <Link href="/appointments" className="hover:text-blue-600">
                Appointments
              </Link>

              <button
                onClick={handleLogout}
                className="text-red-600 hover:underline"
              >
                Logout
              </button>
            </div>
          </nav>
        )}

        <main className="p-4">
              <ProfileBootstrap />
          {children}
        </main>

      </body>
    </html>
  )
}
