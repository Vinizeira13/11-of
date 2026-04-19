"use client";

import { Fragment, useEffect, useState } from "react";
import { X } from "lucide-react";
import { ANNOUNCEMENTS } from "@/data/announcements";
import { Marquee } from "./Marquee";

const STORAGE_KEY = "11of:announcement:dismissed";

export function AnnouncementBar() {
  const [dismissed, setDismissed] = useState<boolean | null>(null);

  useEffect(() => {
    try {
      const v = window.sessionStorage.getItem(STORAGE_KEY);
      setDismissed(v === "1");
    } catch {
      setDismissed(false);
    }
  }, []);

  if (dismissed || ANNOUNCEMENTS.length === 0) return null;

  const items = [...ANNOUNCEMENTS, ...ANNOUNCEMENTS];

  function handleDismiss() {
    try {
      window.sessionStorage.setItem(STORAGE_KEY, "1");
    } catch {}
    setDismissed(true);
  }

  return (
    <div className="relative border-b border-border/60 bg-turf text-turf-foreground">
      <div className="flex items-center gap-4 px-4">
        <Marquee duration={45} className="flex-1 py-2.5">
          {items.map((a, i) => (
            <Fragment key={`${a.message}-${i}`}>
              <span className="mx-6 inline-flex items-center gap-2 text-[11px] sm:text-xs font-medium uppercase tracking-[0.16em]">
                <span aria-hidden>{a.emoji}</span>
                {a.message}
              </span>
              <span aria-hidden className="text-turf-foreground/40">
                ·
              </span>
            </Fragment>
          ))}
        </Marquee>
        <button
          type="button"
          onClick={handleDismiss}
          className="shrink-0 rounded-full p-1 text-turf-foreground/70 hover:text-turf-foreground transition"
          aria-label="Fechar aviso"
        >
          <X className="size-3.5" />
        </button>
      </div>
    </div>
  );
}
