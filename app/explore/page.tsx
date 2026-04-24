/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { MatchResult, SkillRequest } from "../types/explore";
import UserCard from "../components/UserCard";

type FilterKey = "skillOffered" | "skillWanted" | "language" | "mode" | "distance";

export default function ExplorePage() {
  const [allMatches, setAllMatches] = useState<MatchResult[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [skillOfferedFilter, setSkillOfferedFilter] = useState("");
  const [skillWantedFilter, setSkillWantedFilter] = useState("");
  const [languageFilter, setLanguageFilter] = useState("");
  const [modeFilter, setModeFilter] = useState<"" | "online" | "inperson" | "both">("");
  const [distanceFilter, setDistanceFilter] = useState<number | null>(null);

  // Filter options
  const [skillOfferedOptions, setSkillOfferedOptions] = useState<string[]>([]);
  const [skillWantedOptions, setSkillWantedOptions] = useState<string[]>([]);
  const [languageOptions, setLanguageOptions] = useState<string[]>([]);

  // Popover state
  const [openFilter, setOpenFilter] = useState<FilterKey | null>(null);

  const [myCoords, setMyCoords] = useState<{ lat: number | null; lng: number | null }>({
    lat: null,
    lng: null,
  });

  const calcDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);

    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) ** 2;

    return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
  };

  useEffect(() => {
    const load = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: myProfile } = await supabase
        .from("users")
        .select("lat, lng")
        .eq("id", user.id)
        .maybeSingle();

      setMyCoords({
        lat: myProfile?.lat || null,
        lng: myProfile?.lng || null,
      });

      const { data: others } = await supabase
        .from("skill_requests")
        .select("*")
        .neq("user_id", user.id);

      if (!others || others.length === 0) {
        setAllMatches([]);
        setLoading(false);
        return;
      }

      const finalMatches: MatchResult[] = [];
      const offeredSet = new Set<string>();
      const wantedSet = new Set<string>();
      const langSet = new Set<string>();

      for (const req of others as SkillRequest[]) {
        const { data: profile } = await supabase
          .from("users")
          .select("*")
          .eq("id", req.user_id)
          .maybeSingle();

        if (!profile) continue;

        const offered = (req.skills_offered || "").trim();
        const wanted = (req.skills_wanted || "").trim();
        const langs: string[] = profile.languages || [];

        if (offered) offeredSet.add(offered);
        if (wanted) wantedSet.add(wanted);
        langs.forEach((l) => langSet.add(l));

        let distance: number | undefined = undefined;
        console.log("PROFILE COORDS:", profile.lat, profile.lng);

     if (
  myCoords.lat != null &&
  myCoords.lng != null &&
  profile.lat != null &&
  profile.lng != null
) {
  distance = calcDistance(myCoords.lat, myCoords.lng, profile.lat, profile.lng);
}console.log("DIST:", distance);

        finalMatches.push({
          ...req,
          full_name: profile.full_name || "Unnamed User",
          bio: profile.bio || "No bio yet.",
          avatar_url:
            profile.avatar_url ||
            `https://api.dicebear.com/7.x/thumbs/svg?seed=${req.user_id}`,
          lat: profile.lat,
          lng: profile.lng,
          languages: profile.languages || [],
          experience_level: profile.experience_level || [],
          availability: profile.availability || [],
          mode: req.mode || "online",
          distance,
        });
      }
      
console.log(finalMatches[0].distance,'distance');
      setSkillOfferedOptions(Array.from(offeredSet).sort());
      setSkillWantedOptions(Array.from(wantedSet).sort());
      setLanguageOptions(Array.from(langSet).sort());
      setAllMatches(finalMatches);
      setLoading(false);
    };

    load();
  }, []);

 const filteredMatches = useMemo(() => {
  const filtered = allMatches.filter((match) => {
    const offered = (match.skills_offered || "").toLowerCase();
    const wanted = (match.skills_wanted || "").toLowerCase();
    const langs = (match.languages || []).map((l: string) => l.toLowerCase());
    const mode = (match.mode || "online").toLowerCase();
    const lat = match.lat ?? null;
    const lng = match.lng ?? null;

    if (skillOfferedFilter && !offered.includes(skillOfferedFilter.toLowerCase())) {
      return false;
    }

    if (skillWantedFilter && !wanted.includes(skillWantedFilter.toLowerCase())) {
      return false;
    }

    if (languageFilter && !langs.includes(languageFilter.toLowerCase())) {
      return false;
    }

    if (modeFilter) {
      if (modeFilter === "online" && !(mode === "online" || mode === "both")) return false;
      if (modeFilter === "inperson" && !(mode === "inperson" || mode === "both")) return false;
      if (modeFilter === "both" && mode !== "both") return false;
    }

    if (
      distanceFilter &&
      myCoords.lat != null &&
      myCoords.lng != null &&
      lat != null &&
      lng != null
    ) {
      const km = calcDistance(myCoords.lat, myCoords.lng, lat, lng);
      if (km > distanceFilter) return false;
    }

    return true;
  });

  return filtered.map((match) => {
    let distance: number | undefined = undefined;

    if (
      myCoords.lat != null &&
      myCoords.lng != null &&
      match.lat != null &&
      match.lng != null
    ) {
      distance = calcDistance(myCoords.lat, myCoords.lng, match.lat, match.lng);
    }

    return {
      ...match,
      distance,
    };
  });
}, [
  allMatches,
  skillOfferedFilter,
  skillWantedFilter,
  languageFilter,
  modeFilter,
  distanceFilter,
  myCoords.lat,
  myCoords.lng,
]);


  const isAnyFilterActive =
    !!skillOfferedFilter ||
    !!skillWantedFilter ||
    !!languageFilter ||
    !!modeFilter ||
    !!distanceFilter;

  if (loading) return <div className="p-10">Loading...</div>;


  return (
    <div className="p-10 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Explore Skill Exchange</h1>
          <p className="text-sm text-gray-500">
            Filter by skills, language, mode and distance to find the right match.
          </p>
        </div>
        {isAnyFilterActive && (
          <button
            onClick={() => {
              setSkillOfferedFilter("");
              setSkillWantedFilter("");
              setLanguageFilter("");
              setModeFilter("");
              setDistanceFilter(null);
            }}
            className="text-sm text-gray-500 hover:text-gray-700 underline"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Airbnb-style filter bar */}
      <div className="flex flex-wrap gap-3 relative z-10">
        <FilterPill
          label={skillOfferedFilter || "Skill Offered"}
          active={!!skillOfferedFilter}
          isOpen={openFilter === "skillOffered"}
          onClick={() =>
            setOpenFilter(openFilter === "skillOffered" ? null : "skillOffered")
          }
        >
          <FilterList
            options={skillOfferedOptions}
            selected={skillOfferedFilter}
            onSelect={(val) => {
              setSkillOfferedFilter(val);
              setOpenFilter(null);
            }}
            placeholder="Any skill"
          />
        </FilterPill>

        <FilterPill
          label={skillWantedFilter || "Skill Wanted"}
          active={!!skillWantedFilter}
          isOpen={openFilter === "skillWanted"}
          onClick={() =>
            setOpenFilter(openFilter === "skillWanted" ? null : "skillWanted")
          }
        >
          <FilterList
            options={skillWantedOptions}
            selected={skillWantedFilter}
            onSelect={(val) => {
              setSkillWantedFilter(val);
              setOpenFilter(null);
            }}
            placeholder="Any skill"
          />
        </FilterPill>

        <FilterPill
          label={languageFilter || "Language"}
          active={!!languageFilter}
          isOpen={openFilter === "language"}
          onClick={() =>
            setOpenFilter(openFilter === "language" ? null : "language")
          }
        >
          <FilterList
            options={languageOptions}
            selected={languageFilter}
            onSelect={(val) => {
              setLanguageFilter(val);
              setOpenFilter(null);
            }}
            placeholder="Any language"
          />
        </FilterPill>

        <FilterPill
          label={modeFilter || "Mode"}
          active={!!modeFilter}
          isOpen={openFilter === "mode"}
          onClick={() => setOpenFilter(openFilter === "mode" ? null : "mode")}
        >
          <div className="p-3 space-y-2">
            {["online", "inperson", "both"].map((m) => (
              <button
                key={m}
                onClick={() => {
                  setModeFilter(m as any);
                  setOpenFilter(null);
                }}
                className={`w-full text-left px-3 py-2 rounded-md text-sm ${modeFilter === m
                  ? "bg-black text-white"
                  : "hover:bg-gray-100 text-gray-700"
                  }`}
              >
                {m === "online" && "Online"}
                {m === "inperson" && "In‑person"}
                {m === "both" && "Online + In‑person"}
              </button>
            ))}
            {modeFilter && (
              <button
                onClick={() => {
                  setModeFilter("");
                  setOpenFilter(null);
                }}
                className="w-full text-left px-3 py-2 rounded-md text-xs text-gray-500 hover:bg-gray-50"
              >
                Clear mode
              </button>
            )}
          </div>
        </FilterPill>

        <FilterPill
          label={distanceFilter ? `${distanceFilter} km` : "Distance"}
          active={!!distanceFilter}
          isOpen={openFilter === "distance"}
          onClick={() =>
            setOpenFilter(openFilter === "distance" ? null : "distance")
          }
        >
          <div className="p-3 space-y-2">
            {[5, 10, 20, 50, 100].map((d) => (
              <button
                key={d}
                onClick={() => {
                  setDistanceFilter(d);
                  setOpenFilter(null);
                }}
                className={`w-full text-left px-3 py-2 rounded-md text-sm ${distanceFilter === d
                  ? "bg-black text-white"
                  : "hover:bg-gray-100 text-gray-700"
                  }`}
              >
                Within {d} km
              </button>
            ))}
            {distanceFilter && (
              <button
                onClick={() => {
                  setDistanceFilter(null);
                  setOpenFilter(null);
                }}
                className="w-full text-left px-3 py-2 rounded-md text-xs text-gray-500 hover:bg-gray-50"
              >
                Clear distance
              </button>
            )}
          </div>
        </FilterPill>
      </div>

      {/* Results */}
      {filteredMatches.length === 0 ? (
        <div className="text-gray-500 text-sm">No matching users found.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredMatches.map((match) => (
            <UserCard key={match.id} match={match} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------- Small UI components ---------- */

function FilterPill({
  label,
  active,
  isOpen,
  onClick,
  children,
}: {
  label: string;
  active: boolean;
  isOpen: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="relative">
      <button
        type="button"
        onClick={onClick}
        className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm bg-white transition shadow-sm hover:shadow ${active ? "border-black text-black" : "border-gray-200 text-gray-700"
          }`}
      >
        <span>{label}</span>
        <span className="text-xs text-gray-400">{isOpen ? "▲" : "▼"}</span>
      </button>

      {isOpen && (
        <div className="absolute mt-2 w-56 rounded-2xl border bg-white shadow-lg z-20">
          {children}
        </div>
      )}
    </div>
  );
}

function FilterList({
  options,
  selected,
  onSelect,
  placeholder,
}: {
  options: string[];
  selected: string;
  onSelect: (val: string) => void;
  placeholder: string;
}) {
  return (
    <div className="p-3 space-y-1 max-h-64 overflow-auto">
      {options.length === 0 && (
        <div className="text-xs text-gray-400 px-2 py-1">{placeholder}</div>
      )}
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => onSelect(opt)}
          className={`w-full text-left px-3 py-2 rounded-md text-sm capitalize ${selected === opt
            ? "bg-black text-white"
            : "hover:bg-gray-100 text-gray-700"
            }`}
        >
          {opt}
        </button>
      ))}
      {selected && (
        <button
          onClick={() => onSelect("")}
          className="w-full text-left px-3 py-2 rounded-md text-xs text-gray-500 hover:bg-gray-50"
        >
          Clear
        </button>
      )}
    </div>
  );
}
