// app/api/create-video-room/route.ts
import { NextResponse } from "next/server"

export async function POST() {
  try {
    const apiKey = process.env.DAILY_API_KEY
    const apiUrl = process.env.DAILY_API_URL || "https://api.daily.co/v1/rooms"

    if (!apiKey) {
      return NextResponse.json(
        { error: "Missing DAILY_API_KEY" },
        { status: 500 }
      )
    }

const res = await fetch(apiUrl, {
  method: "POST",
  headers: {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    privacy: "public", 
    properties: {
      enable_chat: true,
      enable_screenshare: true,
      exp: Math.round(Date.now() / 1000) + 60 * 60,
    },
  }),
})


    if (!res.ok) {
      const text = await res.text()
      console.error("Daily error:", text)
      return NextResponse.json(
        { error: "Failed to create room" },
        { status: 500 }
      )
    }

    const room = await res.json()

    return NextResponse.json({ url: room.url })
  } catch (e) {
    console.error(e)
    return NextResponse.json(
      { error: "Unexpected error" },
      { status: 500 }
    )
  }
}
