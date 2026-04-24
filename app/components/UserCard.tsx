import Image from "next/image";
import { MatchResult } from "../types/explore";
import { supabase } from "@/lib/supabaseClient";
import { getOrCreateConversation } from "@/lib/getOrCreateConversation";

interface UserCardProps {
  match: MatchResult;
}

export default function UserCard({ match }: UserCardProps) {
  console.log(match.distance);
return (
  <div
    onClick={() => window.location.href = `/profile/${match.user_id}`}
    className="
      relative
      bg-white 
      rounded-2xl 
      border border-gray-200 
      shadow-sm 
      hover:shadow-md 
      transition-all 
      p-6 
      flex 
      flex-col 
      gap-4 
      hover:-translate-y-1
      cursor-pointer
    "
  >


      {/* TOP SECTION — LEFT + RIGHT */}
      <div className="flex flex-col md:flex-row gap-4">

        {/* LEFT SECTION */}
        <div className="flex flex-col items-start gap-4 w-full md:w-1/3">
          <div className="w-16 h-16 rounded-full overflow-hidden relative bg-gray-100 border">
            <Image
              src={match.avatar_url}
              alt={match.full_name}
              fill
              sizes="64px"
              className="object-cover"
            />
          </div>

          <h2 className="text-lg font-semibold text-gray-900">
            {match.full_name}
          </h2>

          {/* Skills Offered */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-1">Can Teach</p>
            <div className="flex flex-wrap gap-2">
              {match.skills_offered.split(",").map((skill) => (
                <span
                  key={skill}
                  className="
                  px-3 
                  py-1 
                  text-xs 
                  bg-blue-50 
                  text-blue-700 
                  rounded-full 
                  border 
                  border-blue-100
                "
                >
                  {skill.trim()}
                </span>
              ))}
            </div>
          </div>

          {/* Skills Wanted */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-1">Wants to Learn</p>
            <div className="flex flex-wrap gap-2">
              {match.skills_wanted.split(",").map((skill) => (
                <span
                  key={skill}
                  className="
                  px-3 
                  py-1 
                  text-xs 
                  bg-green-50 
                  text-green-700 
                  rounded-full 
                  border 
                  border-green-100
                "
                >
                  {skill.trim()}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* MODE */}
        {match.mode && (
          <div>
            <p className="text-sm font-medium text-gray-700 mb-1">Mode</p>

            <span
              className="
        inline-flex 
        items-center 
        gap-2
        px-3 
        py-1 
        text-xs 
        rounded-full 
        font-medium 
        bg-purple-50 
        text-purple-700 
        border 
        border-purple-100
      "
            >
              {/* ICON */}
              {match.mode === "online" && <span>🌐</span>}
              {match.mode === "inperson" && <span>🏠</span>}
              {match.mode === "both" && <span>🔄</span>}

              {/* LABEL */}
              {match.mode === "online" && "Online"}
              {match.mode === "inperson" && "In‑person"}
              {match.mode === "both" && "Online + In‑person"}
            </span>
          </div>
        )}


        {/* EXPERIENCE LEVEL */}
        {Array.isArray(match.experience_level) && match.experience_level.length > 0 && (
          <div>
            <p className="text-sm font-medium text-gray-700 mb-1">Experience Level</p>
            <div className="flex flex-wrap gap-2">
              {match.experience_level.map((lvl) => (
                <span
                  key={lvl}
                  className="
            px-3 
            py-1 
            text-xs 
            bg-blue-50 
            text-blue-700 
            rounded-full 
            border 
            border-blue-100
          "
                >
                  {lvl}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* AVAILABILITY */}
        {Array.isArray(match.availability) && match.availability.length > 0 && (
          <div>
            <p className="text-sm font-medium text-gray-700 mb-1">Availability</p>
            <div className="flex flex-wrap gap-2">
              {match.availability.map((slot) => (
                <span
                  key={slot}
                  className="
            px-3 
            py-1 
            text-xs 
            bg-green-50 
            text-green-700 
            rounded-full 
            border 
            border-green-100
          "
                >
                  {slot}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* LANGUAGES */}
        {Array.isArray(match.languages) && match.languages.length > 0 && (
          <div>
            <p className="text-sm font-medium text-gray-700 mb-1">Languages</p>
            <div className="flex flex-wrap gap-2">
              {match.languages.map((lang) => (
                <span
                  key={lang}
                  className="
            px-3 
            py-1 
            text-xs 
            bg-yellow-50 
            text-yellow-700 
            rounded-full 
            border 
            border-yellow-100
          "
                >
                  {lang}
                </span>
              ))}
            </div>
          </div>
        )}


        {/* RIGHT SECTION — BIO */}
        <div className="flex flex-col w-full md:flex-1">
          <p className="text-sm font-medium text-gray-700 mb-2">About</p>

          <div
            className="
            bg-gray-50 
            border 
            border-gray-200 
            rounded-xl 
            p-4 
            text-sm 
            text-gray-700 
            leading-relaxed 
          "
          >
            {match.bio}
          </div>
        </div>

    {/* BOTTOM‑RIGHT DISTANCE BADGE — DOĞRU YER */}
    {typeof match.distance === "number" && (
      <div
        className="
          absolute
          bottom-3
          right-3
          bg-white/80
          backdrop-blur-md
          text-gray-900
          text-xs
          px-3
          py-1.5
          rounded-full
          border
          border-gray-300
          shadow-sm
        "
      >
        📍 {match.distance} km away
      </div>
    )}
      </div>

      {/* BUTTON — ALWAYS AT BOTTOM */}
      <button
        onClick={async (e) => {
          e.stopPropagation();

          const {
            data: { user },
          } = await supabase.auth.getUser();

          if (!user) return;

          const conversationId = await getOrCreateConversation(
            user.id,
            match.user_id
          );

          window.location.href = `/chat/${conversationId}`;
        }}
        className="
        w-full 
        py-2.5 
        bg-indigo-600 
        text-white 
        rounded-xl 
        font-medium 
        hover:bg-indigo-700 
        transition
      "
      >
        Start Chat
      </button>
    </div>
  );



}
