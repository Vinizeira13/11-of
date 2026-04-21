"use client";

import { useEffect } from "react";

/**
 * Strips one-shot flash query params (?ok, ?err) from the URL after mount
 * so a refresh doesn't re-show the same banner.
 *
 * Uses history.replaceState directly so Next.js doesn't re-render the page
 * — the server-rendered banner stays in the DOM, the URL just gets clean.
 */
export function FlashClear({ keys }: { keys: string[] }) {
  useEffect(() => {
    const url = new URL(window.location.href);
    let mutated = false;
    for (const k of keys) {
      if (url.searchParams.has(k)) {
        url.searchParams.delete(k);
        mutated = true;
      }
    }
    if (mutated) {
      const q = url.searchParams.toString();
      window.history.replaceState(
        null,
        "",
        url.pathname + (q ? `?${q}` : "") + url.hash,
      );
    }
  }, [keys]);

  return null;
}
