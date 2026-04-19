"use client";

import { useEffect, useState } from "react";

/**
 * Thin scroll progress bar at the very top of the viewport. Uses scroll
 * events; accessible and reduces motion friendly (doesn't animate, just
 * updates on scroll).
 */
export function ScrollProgress() {
  const [pct, setPct] = useState(0);

  useEffect(() => {
    function onScroll() {
      const h =
        document.documentElement.scrollHeight -
        document.documentElement.clientHeight;
      const p = h > 0 ? (window.scrollY / h) * 100 : 0;
      setPct(Math.max(0, Math.min(100, p)));
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-0.5 bg-transparent"
    >
      <div
        className="h-full bg-turf transition-[width] duration-100"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
