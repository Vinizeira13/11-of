"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

export function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > 1200);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function handleClick() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label="Voltar ao topo"
      aria-hidden={!visible}
      tabIndex={visible ? 0 : -1}
      className={[
        "fixed bottom-24 right-5 z-30 inline-flex size-11 items-center justify-center rounded-full border border-border/80 bg-card/90 text-foreground/80 shadow-lg backdrop-blur-xl transition",
        "hover:text-foreground hover:border-foreground",
        visible
          ? "opacity-100 translate-y-0 pointer-events-auto"
          : "pointer-events-none opacity-0 translate-y-3",
      ].join(" ")}
    >
      <ArrowUp className="size-4" />
    </button>
  );
}
