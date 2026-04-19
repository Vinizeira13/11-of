"use client";

import { useRef, type ReactNode } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { cn } from "@/lib/utils";

gsap.registerPlugin(useGSAP);

type Props = {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: "left" | "right" | "up" | "down";
  duration?: number;
};

export function MaskReveal({
  children,
  className,
  delay = 0,
  direction = "left",
  duration = 1.1,
}: Props) {
  const ref = useRef<HTMLDivElement | null>(null);

  useGSAP(
    () => {
      if (!ref.current) return;
      const inset = {
        left: "inset(0 0 0 100%)",
        right: "inset(0 100% 0 0)",
        up: "inset(100% 0 0 0)",
        down: "inset(0 0 100% 0)",
      }[direction];

      gsap.fromTo(
        ref.current,
        { clipPath: inset },
        {
          clipPath: "inset(0 0 0 0)",
          duration,
          delay,
          ease: "power4.out",
        },
      );
    },
    { scope: ref, dependencies: [direction, delay, duration] },
  );

  return (
    <div ref={ref} className={cn("will-change-[clip-path]", className)}>
      {children}
    </div>
  );
}
