export interface SkillRequest {
  id: string
  user_id: string
  skills_offered: string
  skills_wanted: string
  created_at: string
  mode: "online" | "inperson" | "both" | null
}

export interface MatchResult extends SkillRequest {
  full_name: string
  bio: string
  avatar_url: string

  lat?: number | null
  lng?: number | null
  city?: string | null
  country?: string | null
  distance?: number
  description?: string

  experience_level?: string[] | null
  availability?: string[] | null
  languages?: string[] | null
}
