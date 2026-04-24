"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import Image from "next/image"

type AppointmentUser = {
    full_name: string
    avatar_url: string | null
}

type Appointment = {
    id: string
    scheduled_at: string
    user1: AppointmentUser | null
    user2: AppointmentUser | null
    video_url: string | null
}

type ChatUser = {
    id: string
    full_name: string
    avatar_url: string | null
}

export default function AppointmentsPage() {
    const [upcoming, setUpcoming] = useState<Appointment[]>([])
    const [past, setPast] = useState<Appointment[]>([])
    const [chatUsers, setChatUsers] = useState<ChatUser[]>([])
    const [openModal, setOpenModal] = useState(false)
    const [selectedUser, setSelectedUser] = useState<ChatUser | null>(null)
    const [selectedDate, setSelectedDate] = useState("")
    const [selectedTime, setSelectedTime] = useState("")

    // -----------------------------
    // LOAD APPOINTMENTS
    // -----------------------------
    const loadAppointments = async () => {
        const {
            data: { user },
        } = await supabase.auth.getUser()
        if (!user) return

        const { data, error } = await supabase
            .from("appointments")
            .select(`
    id,
    scheduled_at,
    video_url,
    user1:users!appointments_user1_id_fkey(id, full_name, avatar_url),
    user2:users!appointments_user2_id_fkey(id, full_name, avatar_url)
  `)
            .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
            .order("scheduled_at", { ascending: true })
        if (error || !data) {
            setUpcoming([])
            setPast([])
            return
        }

        const now = new Date()

        const typed = data as unknown as Appointment[]

        setUpcoming(typed.filter((a) => new Date(a.scheduled_at) > now))
        setPast(typed.filter((a) => new Date(a.scheduled_at) <= now))
    }

    // -----------------------------
    // LOAD CHAT USERS
    // -----------------------------
    const loadChatUsers = async () => {
        const {
            data: { user },
        } = await supabase.auth.getUser()
        if (!user) return

        const { data: convs, error } = await supabase
            .from("conversations")
            .select("id, user1_id, user2_id")

        if (error || !convs) {
            setChatUsers([])
            return
        }

        const otherIds = convs
            .map((c) => (c.user1_id === user.id ? c.user2_id : c.user1_id))
            .filter(Boolean)

        if (otherIds.length === 0) {
            setChatUsers([])
            return
        }

        const { data: profiles } = await supabase
            .from("users")
            .select("id, full_name, avatar_url")
            .in("id", otherIds)

        setChatUsers((profiles as ChatUser[]) || [])
    }

    // -----------------------------
    // CREATE APPOINTMENT
    // -----------------------------
    const handleCreate = async () => {
        if (!selectedUser || !selectedDate || !selectedTime) {
            alert("Please select date, time and user")
            return
        }

        const {
            data: { user },
        } = await supabase.auth.getUser()
        if (!user) return

        const scheduledAt = `${selectedDate}T${selectedTime}:00`

        // 2) create video room
        const videoRes = await fetch("/api/create-video-room", {
            method: "POST",
        })

        if (!videoRes.ok) {
            alert("Failed to create video room")
            return
        }

        const { url: videoUrl } = await videoRes.json()

        // 3) create appointment in DB
        const { error } = await supabase.from("appointments").insert({
            user1_id: user.id,
            user2_id: selectedUser.id,
            scheduled_at: scheduledAt,
            video_url: videoUrl,
        })

        if (error) {
            console.error(error)
            alert("Failed to create appointment")
            return
        }

        alert("Appointment created!")
        setOpenModal(false)
        setSelectedDate("")
        setSelectedTime("")
        setSelectedUser(null)
        loadAppointments()
    }


    // -----------------------------
    // INITIAL LOAD
    // -----------------------------
    useEffect(() => {
        const run = async () => {
            await loadAppointments()
            await loadChatUsers()
        }
        run()
    }, [])

    return (
        <div className="p-6 space-y-8">
            <h1 className="text-2xl font-bold">My Appointments</h1>

            {/* UPCOMING */}
            <section>
                <h2 className="text-lg font-semibold mb-3">Upcoming</h2>

                {upcoming.length === 0 && (
                    <p className="text-gray-500 text-sm">No upcoming appointments</p>
                )}
                {upcoming.map(a => {
                    const other = a.user1 ?? a.user2
                    if (!other) return null

                    return (
                        <div key={a.id} className="p-4 border rounded-xl flex items-center gap-4">
                            <Image
                                src={other.avatar_url || "/default.png"}
                                width={48}
                                height={48}
                                className="rounded-full"
                                alt="avatar"
                                sizes="64px"
                            />

                            <div className="flex-1">
                                <p className="font-medium">{other.full_name}</p>
                                <p className="text-sm text-gray-600">
                                    {new Date(a.scheduled_at).toLocaleString()}
                                </p>
                            </div>

                            {/* 🔥 4. ADIM: JOIN CALL BUTTON BURAYA */}
                            {a.video_url && (
                                <a
                                    href={a.video_url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-sm text-indigo-600 font-medium hover:underline"
                                >
                                    Join Call
                                </a>
                            )}
                        </div>
                    )
                })}

            </section>

            {/* PAST */}
            <section>
                <h2 className="text-lg font-semibold mb-3">Past</h2>
                {past.length === 0 && (
                    <p className="text-gray-500 text-sm">No past appointments</p>
                )}
                {past.map((a) => {
                    const other = a.user1 ?? a.user2
                    if (!other) return null
                    return (
                        <div
                            key={a.id}
                            className="p-4 border rounded-xl flex items-center gap-4 opacity-60"
                        >
                            <Image
                                src={other.avatar_url || "/default.png"}
                                width={48}
                                height={48}
                                className="rounded-full"
                                alt="avatar"
                                sizes="64px"
                            />
                            <div className="flex-1">
                                <p className="font-medium">{other.full_name}</p>
                                <p className="text-sm text-gray-600">
                                    {new Date(a.scheduled_at).toLocaleString()}
                                </p>
                            </div>
                            <span className="text-xs bg-gray-200 px-2 py-1 rounded">
                                Completed
                            </span>
                        </div>
                    )
                })}
            </section>

            {/* CREATE */}
            <section>
                <h2 className="text-lg font-semibold mb-3">Create Appointment</h2>

                {chatUsers.length === 0 && (
                    <p className="text-gray-500 text-sm">
                        You don&apos;t have any conversations yet.
                    </p>
                )}

                {chatUsers.map((u) => (
                    <div
                        key={u.id}
                        className="p-4 border rounded-xl flex items-center gap-4 cursor-pointer hover:bg-gray-100"
                        onClick={() => {
                            setSelectedUser(u)
                            setOpenModal(true)
                        }}
                    >
                        <Image
                            src={u.avatar_url || "/default.png"}
                            width={48}
                            height={48}
                            className="rounded-full"
                            alt="avatar"
                            sizes="64px"
                        />
                        <p className="font-medium">{u.full_name}</p>
                    </div>
                ))}
            </section>

            {/* MODAL */}
            {openModal && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
                    <div className="bg-white p-6 rounded-xl w-full max-w-md">
                        <h3 className="text-lg font-semibold mb-4">
                            Create Appointment
                            {selectedUser ? ` with ${selectedUser.full_name}` : ""}
                        </h3>

                        <input
                            type="date"
                            className="w-full p-2 border rounded mb-4"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                        />

                        <input
                            type="time"
                            className="w-full p-2 border rounded mb-4"
                            value={selectedTime}
                            onChange={(e) => setSelectedTime(e.target.value)}
                        />

                        <div className="flex gap-3 mt-2">
                            <button
                                onClick={() => {
                                    setOpenModal(false)
                                    setSelectedUser(null)
                                }}
                                className="w-1/2 border border-gray-300 text-gray-700 py-2 rounded-lg"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreate}
                                className="w-1/2 bg-indigo-600 text-white py-2 rounded-lg"
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
