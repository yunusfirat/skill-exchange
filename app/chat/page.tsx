"use client"

import { useEffect, useState } from "react"
import { supabase } from "../../lib/supabaseClient"
import Image from "next/image"

type ConversationListItem = {
    id: string
    otherUser: {
        full_name: string
        avatar_url: string | null
    } | null
    lastMessage: {
        id: string
        sender_id: string
        receiver_id: string
        content: string
        created_at: string
    } | null
    hasUnread: boolean
}

export default function ChatListPage() {
    const [conversations, setConversations] = useState<ConversationListItem[]>([])

    const loadConversations = async () => {
        const {
            data: { user },
        } = await supabase.auth.getUser()

        if (!user) return

        const { data: convs } = await supabase
            .from("conversations")
            .select("id, user1_id, user2_id")
            .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)

        if (!convs) return

        const enriched: ConversationListItem[] = await Promise.all(
            convs.map(async (c) => {
                const other =
                    c.user1_id === user.id ? c.user2_id : c.user1_id

                const { data: profile } = await supabase
                    .from("users")
                    .select("full_name, avatar_url")
                    .eq("id", other)
                    .single()

                const { data: lastMsg } = await supabase
                    .from("messages")
                    .select("id, sender_id, receiver_id, content, created_at")
                    .eq("conversation_id", c.id)
                    .order("created_at", { ascending: false })
                    .limit(1)
                    .maybeSingle()

                const hasUnread =
                    !!lastMsg &&
                    lastMsg.sender_id !== user.id &&
                    lastMsg.receiver_id === user.id

                return {
                    id: c.id,
                    otherUser: profile,
                    lastMessage: lastMsg ?? null,
                    hasUnread,
                }
            })
        )

        setConversations(enriched)
    }

    // İlk yükleme — React 18 uyumlu
    useEffect(() => {
        const run = async () => {
            await loadConversations()
        }
        run()
    }, [])

    useEffect(() => {
        const channel = supabase
            .channel("messages_changes")
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "messages",
                },
                () => {
                    loadConversations()
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [])

    return (
        <div className="p-5 space-y-4">
            <h1 className="text-xl font-bold mb-4">Chats</h1>

            {conversations.map((c) => (
                <div
                    key={c.id}
                    onClick={() => (window.location.href = `/chat/${c.id}`)}
                    className="p-4 border rounded-xl flex items-center gap-4 cursor-pointer hover:bg-gray-100"
                >
                    <Image
                        src={c.otherUser?.avatar_url || "/default.png"}
                        alt="avatar"
                        width={48}
                        height={48}
                        sizes="64px"
                        className="w-12 h-12 rounded-full border object-cover"
                    />

                    <div className="flex-1">
                        <div className="font-semibold">
                            {c.otherUser?.full_name}
                        </div>
                        <div className="text-gray-600 text-sm">
                            {c.lastMessage?.content || "No messages yet"}
                        </div>
                    </div>

                    {c.hasUnread && (
                        <div className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                            New
                        </div>
                    )}
                    
                </div>
            ))}
        </div>
    )
}
