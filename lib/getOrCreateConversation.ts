import { supabase } from "./supabaseClient"

export async function getOrCreateConversation(userId1: string, userId2: string) {
  // 1) Var mı kontrol et
  const { data: existing } = await supabase
    .from("conversations")
    .select("id")
    .or(`user1_id.eq.${userId1},user2_id.eq.${userId1}`)
    .or(`user1_id.eq.${userId2},user2_id.eq.${userId2}`)
    .limit(1)
    .single()

  if (existing) return existing.id

  // 2) Yoksa oluştur
  const { data: created } = await supabase
    .from("conversations")
    .insert({
      user1_id: userId1,
      user2_id: userId2,
    })
    .select()
    .single()

  return created.id
}
