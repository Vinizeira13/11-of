"use client";

import { useCallback, useEffect, useState } from "react";

const KEY = "11of:wishlist";

function read(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

function write(ids: string[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(ids));
  window.dispatchEvent(new CustomEvent("11of:wishlist-change"));
}

export function useWishlist() {
  const [ids, setIds] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setIds(read());
    setMounted(true);
    const handler = () => setIds(read());
    window.addEventListener("11of:wishlist-change", handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener("11of:wishlist-change", handler);
      window.removeEventListener("storage", handler);
    };
  }, []);

  const has = useCallback((id: string) => ids.includes(id), [ids]);

  const toggle = useCallback(
    (id: string) => {
      const current = read();
      const next = current.includes(id)
        ? current.filter((x) => x !== id)
        : [...current, id];
      write(next);
      setIds(next);
      return next.includes(id);
    },
    [],
  );

  const clear = useCallback(() => {
    write([]);
    setIds([]);
  }, []);

  return { ids, has, toggle, clear, mounted, count: ids.length };
}
