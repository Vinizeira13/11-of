"use client";

import { useCallback, useEffect, useState } from "react";

const KEY = "11of:recently-viewed";
const MAX = 8;

export type RecentRef = { slug: string; viewedAt: number };

function read(): RecentRef[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (x) =>
          x &&
          typeof x.slug === "string" &&
          typeof x.viewedAt === "number",
      )
      .slice(0, MAX);
  } catch {
    return [];
  }
}

function write(items: RecentRef[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(items.slice(0, MAX)));
  window.dispatchEvent(new CustomEvent("11of:recent-change"));
}

export function recordView(slug: string) {
  const current = read();
  const filtered = current.filter((r) => r.slug !== slug);
  const next: RecentRef[] = [{ slug, viewedAt: Date.now() }, ...filtered].slice(
    0,
    MAX,
  );
  write(next);
}

export function useRecentlyViewed(excludeSlug?: string) {
  const [items, setItems] = useState<RecentRef[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const initial = read().filter((r) => r.slug !== excludeSlug);
    setItems(initial);
    setMounted(true);
    const handler = () => {
      setItems(read().filter((r) => r.slug !== excludeSlug));
    };
    window.addEventListener("11of:recent-change", handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener("11of:recent-change", handler);
      window.removeEventListener("storage", handler);
    };
  }, [excludeSlug]);

  const clear = useCallback(() => {
    write([]);
    setItems([]);
  }, []);

  return { items, mounted, clear };
}
