export interface SkillRequest {
  id: string;
  user_id: string;
  skills_offered: string;
  skills_wanted: string;
  created_at: string;
}

export interface UserProfile {
  full_name: string | null;
  bio: string | null;
  avatar_url: string | null;
}

export interface MatchResult extends SkillRequest {
  full_name: string;
  bio: string;
  avatar_url: string;
  description?: string;
}
