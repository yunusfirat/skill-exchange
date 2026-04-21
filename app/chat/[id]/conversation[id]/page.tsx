"use client"

import { useEffect, useState, useRef } from "react"
import { supabase } from "../../../../lib/supabaseClient"
import { useParams } from "next/navigation"

type Message = {
    id: string
    sender_id: string
    content: string
    created_at: string
}

type MessageBubbleProps = {
    msg: Message
    currentUserId: string | null
}


export function MessageBubble({ msg, currentUserId }: MessageBubbleProps) {
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



export default function ChatPage() {
    const { conversationId } = useParams()
    const [messages, setMessages] = useState<Message[]>([])
    const [newMessage, setNewMessage] = useState("")
    const bottomRef = useRef<HTMLDivElement | null>(null)
    const [currentUserId, setCurrentUserId] = useState<string | null>(null)
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

    // Scroll to bottom when messages change
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages])

    const sendMessage = async () => {
        const {
            data: { user },
        } = await supabase.auth.getUser()
        setCurrentUserId(user?.id || null)
        if (!user || !newMessage.trim()) return

        // send message
        const { data, error } = await supabase
            .from("messages")
            .insert({
                conversation_id: conversationId,
                sender_id: user.id,
                content: newMessage,
            })
            .select()
            .single()

        if (!error && data) {
            setMessages((prev) => [...prev, data])
        }

        setNewMessage("")
    }
    return (
        <div className="flex justify-center items-center min-h-[80vh]">

            {/* CHAT BOX */}
            <div className="w-full max-w-md h-[60vh] bg-white rounded-xl shadow-md flex flex-col border">

                {/* MESSAGES */}
                <div className="flex-1 overflow-y-auto p-3 space-y-2">
                    {messages.map((msg) => (
                        <MessageBubble key={msg.id} msg={msg} currentUserId={currentUserId} />
                    ))}
                    <div ref={bottomRef} />
                </div>

                {/* INPUT */}
                <div className="flex gap-2 p-3 border-t">
                    <input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        className="flex-1 border rounded-lg p-2 text-sm"
                        placeholder="Type a message..."
                    />
                    <button
                        onClick={sendMessage}
                        className="bg-blue-600 text-white px-4 rounded-lg text-sm"
                    >
                        Send
                    </button>
                </div>

            </div>
        </div>
    )



}

