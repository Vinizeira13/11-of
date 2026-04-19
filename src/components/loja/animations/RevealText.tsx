"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { cn } from "@/lib/utils";

gsap.registerPlugin(useGSAP);

type Props = {
  children: string;
  className?: string;
  delay?: number;
  stagger?: number;
  as?: "h1" | "h2" | "p" | "span" | "div";
};

export function RevealText({
  children,
  className,
  delay = 0,
  stagger = 0.02,
  as: Tag = "span",
}: Props) {
  const ref = useRef<HTMLElement | null>(null);

  useGSAP(
    () => {
      if (!ref.current) return;
      const chars = ref.current.querySelectorAll<HTMLElement>("[data-char]");
      gsap.set(chars, { yPercent: 110, opacity: 0 });
      gsap.to(chars, {
        yPercent: 0,
        opacity: 1,
        duration: 0.9,
        delay,
        stagger,
        ease: "power3.out",
      });
    },
    { scope: ref, dependencies: [children] },
  );

  const words = children.split(" ");

  return (
    <Tag
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ref={ref as React.Ref<any>}
      className={cn("inline-block", className)}
      aria-label={children}
    >
      {words.map((word, wi) => (
        <span
          key={`${word}-${wi}`}
          className="inline-block overflow-hidden"
          aria-hidden
        >
          {Array.from(word).map((char, ci) => (
            <span
              key={`${char}-${ci}`}
              data-char
              className="inline-block will-change-transform"
            >
              {char}
            </span>
          ))}
          {wi < words.length - 1 && <span>&nbsp;</span>}
        </span>
      ))}
    </Tag>
  );
}
