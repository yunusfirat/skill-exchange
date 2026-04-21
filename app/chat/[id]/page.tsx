"use client"

import { useEffect, useState, useRef } from "react"
import { supabase } from "../../../lib/supabaseClient"
import { useParams } from "next/navigation"

type Message = {
    id: string
    sender_id: string
    receiver_id: string
    content: string
    created_at: string
}


export default function ChatPage() {
    const { id } = useParams()
    const conversationId = id as string
    const [messages, setMessages] = useState<Message[]>([])
    const [newMessage, setNewMessage] = useState("")
    const bottomRef = useRef<HTMLDivElement | null>(null)
    const [isOtherTyping, setIsOtherTyping] = useState(false)
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
    const [currentUserId, setCurrentUserId] = useState<string | null>(null)
    const [otherUserId, setOtherUserId] = useState<string | null>(null)
    const messageChannelRef = useRef<any>(null)
    const typingChannelRef = useRef<any>(null)


    useEffect(() => {
        const channel = supabase.channel(`typing_${conversationId}`)

        typingChannelRef.current = channel

        channel
            .on("broadcast", { event: "typing" }, (payload) => {
                setIsOtherTyping(payload.payload.typing)
            })
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [conversationId])
    // Load other user ID
    useEffect(() => {
        const loadOtherUser = async () => {
            const {
                data: { user },
            } = await supabase.auth.getUser()

            if (!user) return

            const { data: conv } = await supabase
                .from("conversations")
                .select("user1_id, user2_id")
                .eq("id", conversationId)
                .single()

            if (!conv) return

            const other =
                conv.user1_id === user.id ? conv.user2_id : conv.user1_id

            // 💥 Bunu state'e kaydediyoruz
            setOtherUserId(other)
        }

        loadOtherUser()
    }, [conversationId])

    // Load current user
    useEffect(() => {
        const loadUser = async () => {
            const {
                data: { user },
            } = await supabase.auth.getUser()
            setCurrentUserId(user?.id || null)
        }
        loadUser()
    }, [])

    // Load messages
    useEffect(() => {
        const loadMessages = async () => {
            const { data } = await supabase
                .from("messages")
                .select("*")
                .eq("conversation_id", conversationId)
                .order("created_at", { ascending: true })

            setMessages(data || [])
        }

        loadMessages()
    }, [conversationId])

    // 🔥 REALTIME LISTENER
    useEffect(() => {
        if (messageChannelRef.current) return  // ❗ ikinci kez açmayı engeller

        console.log("🟦 Listener created for:", conversationId)

        const channel = supabase
            .channel(`conversation_${conversationId}`)
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "messages",
                    filter: `conversation_id=eq.${conversationId}`,
                },
                (payload) => {
                    console.log("🔥 REALTIME EVENT:", payload)
                    const newMsg = payload.new as Message
                    setMessages((prev) => [...prev, newMsg])
                }
            )
            .subscribe()

        messageChannelRef.current = channel

        return () => {
            supabase.removeChannel(channel)
            messageChannelRef.current = null
        }
    }, [conversationId])

    // Scroll to bottom
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages])


    // Send message
    const sendMessage = async () => {
        const {
            data: { user },
        } = await supabase.auth.getUser()

        if (!user || !newMessage.trim() || !otherUserId) return

        const { error } = await supabase
            .from("messages")
            .insert({
                conversation_id: conversationId,
                sender_id: user.id,
                receiver_id: otherUserId,
                content: newMessage,
            })

        setNewMessage("")
    }

    const sendTypingEvent = (typing: boolean) => {
        typingChannelRef.current?.send({
            type: "broadcast",
            event: "typing",
            payload: { typing }
        })
    }

   return (
    <div className="fixed bottom-4 right-4 w-full max-w-sm">

        <div className="flex flex-col p-4 bg-white rounded-xl shadow-lg border h-[60vh]">

            {/* MESSAGES */}
            <div className="flex-1 overflow-y-auto space-y-2">
                {messages.map((msg) => (
                    <MessageBubble
                        key={msg.id}
                        msg={msg}
                        currentUserId={currentUserId}
                    />
                ))}

                <div ref={bottomRef} />
            </div>

            {/* 🔥 TYPING INDICATOR */}
            {isOtherTyping && (
                <div className="text-gray-500 text-sm italic mb-1">
                    Typing…
                </div>
            )}

            {/* INPUT */}
            <div className="flex gap-2 mt-2">
                <input
                    value={newMessage}
                    onChange={(e) => {
                        setNewMessage(e.target.value)

                        sendTypingEvent(true)

                        if (typingTimeoutRef.current) {
                            clearTimeout(typingTimeoutRef.current)
                        }

                        typingTimeoutRef.current = setTimeout(() => {
                            sendTypingEvent(false)
                        }, 1000)
                    }}
                      onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                e.preventDefault()
                                sendMessage()
                            }
                        }}
                    className="flex-1 border rounded-lg p-2 text-sm"
                    placeholder="Type a message..."
                />

                <button
                    onClick={sendMessage}
                    className="bg-blue-600 text-white px-3 rounded-lg text-sm"
                >
                    Send
                </button>
            </div>
        </div>
    </div>
)

}

function MessageBubble({
    msg,
    currentUserId,
}: {
    msg: Message
    currentUserId: string | null
}) {
    const isMine = msg.sender_id === currentUserId

    return (
        <div
            className={`
                px-3 py-2 
                rounded-lg 
                text-sm 
                max-w-[55%] 
                leading-snug
                ${isMine 
                    ? "bg-blue-600 text-white ml-auto" 
                    : "bg-gray-200 text-black"
                }
            `}
        >
            {msg.content}
        </div>
    )
}
