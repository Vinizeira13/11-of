"use client";

import { useRef, type ReactNode } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { cn } from "@/lib/utils";

gsap.registerPlugin(useGSAP, ScrollTrigger);

type Props = {
  children: ReactNode;
  className?: string;
  stagger?: number;
  y?: number;
  selector?: string;
};

export function ScrollReveal({
  children,
  className,
  stagger = 0.08,
  y = 24,
  selector = "[data-reveal]",
}: Props) {
  const ref = useRef<HTMLDivElement | null>(null);

  useGSAP(
    () => {
      if (!ref.current) return;
      const targets = ref.current.querySelectorAll<HTMLElement>(selector);
      if (targets.length === 0) return;

      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduced) return;

      // If the element is already in the viewport on mount (e.g. a second
      // grid that's still below the fold but visible after a quick scroll),
      // reveal immediately instead of gating on ScrollTrigger.
      const rect = ref.current.getBoundingClientRect();
      const alreadyVisible = rect.top < window.innerHeight * 1.1;

      gsap.set(targets, { y, opacity: 0 });

      if (alreadyVisible) {
        gsap.to(targets, {
          y: 0,
          opacity: 1,
          duration: 0.7,
          ease: "power2.out",
          stagger,
        });
        return;
      }

      gsap.to(targets, {
        y: 0,
        opacity: 1,
        duration: 0.7,
        ease: "power2.out",
        stagger,
        scrollTrigger: {
          trigger: ref.current,
          start: "top 90%",
          once: true,
        },
      });

      // Safety fallback: if ScrollTrigger doesn't fire within 4s (e.g.,
      // non-scrolling preview environments, headless screenshots), force
      // elements visible so nothing stays at opacity:0 forever.
      const fallback = setTimeout(() => {
        gsap.to(targets, {
          y: 0,
          opacity: 1,
          duration: 0.3,
          stagger: 0,
          overwrite: "auto",
        });
      }, 4000);
      return () => clearTimeout(fallback);
    },
    { scope: ref },
  );

  return (
    <div ref={ref} className={cn(className)}>
      {children}
    </div>
  );
}
