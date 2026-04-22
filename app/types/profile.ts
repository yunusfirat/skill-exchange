export interface UserProfile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  bio?: string | null;
  skills_offered: string[] | null;
  skills_wanted: string[] | null;
  languages: string[] | null;
  experience_level?: string | null;
  availability?: string | null;
  created_at?: string;
}
