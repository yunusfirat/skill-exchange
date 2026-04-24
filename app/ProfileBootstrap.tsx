"use client";

import { useEffect } from "react";
import { supabase } from "../lib/supabaseClient";

export default function ProfileBootstrap() {
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const createProfileIfMissing = async (user: any) => {
      const { data: profile } = await supabase
        .from("users")
        .select("id")
        .eq("id", user.id)
        .maybeSingle();

      if (!profile) {
        await supabase
          .from("users")
          .insert({
            id: user.id,
            full_name: "",
            bio: "",
            avatar_url: "",
            username: "",
            location: "",
            timezone: "",
            experience_level: [],
            availability: [],
            languages: [],
            city: "",
            country: "",
            lat: null,
            lng: null,
            skills_offered: [],
            skills_wanted: [],
          });
      }
    };

    const init = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const session = sessionData?.session;

      if (session?.user) {
        await createProfileIfMissing(session.user);
      }

      supabase.auth.onAuthStateChange(async (_, session) => {
        if (session?.user) {
          await createProfileIfMissing(session.user);
        }
      });
    };

    init();
  }, []);

  return null;
}
