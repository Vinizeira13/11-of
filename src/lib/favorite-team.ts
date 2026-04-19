"use client";

import { useCallback, useEffect, useState } from "react";

const KEY = "11of:favorite-team";
const DISMISSED_KEY = "11of:team-picker-seen";

function read(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(KEY);
}

function write(code: string | null) {
  if (typeof window === "undefined") return;
  if (code) {
    window.localStorage.setItem(KEY, code);
    window.localStorage.setItem(DISMISSED_KEY, "1");
  } else {
    window.localStorage.removeItem(KEY);
  }
  window.dispatchEvent(new CustomEvent("11of:favorite-team-change"));
}

export function useFavoriteTeam() {
  const [code, setCode] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setCode(read());
    setMounted(true);
    const handler = () => setCode(read());
    window.addEventListener("11of:favorite-team-change", handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener("11of:favorite-team-change", handler);
      window.removeEventListener("storage", handler);
    };
  }, []);

  const set = useCallback((next: string | null) => {
    write(next);
    setCode(next);
  }, []);

  return { code, set, mounted };
}

export function hasSeenTeamPicker(): boolean {
  if (typeof window === "undefined") return true;
  return window.localStorage.getItem(DISMISSED_KEY) === "1";
}

export function markTeamPickerSeen() {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(DISMISSED_KEY, "1");
}
