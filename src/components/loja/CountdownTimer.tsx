"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

type Parts = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

function diff(to: Date): Parts {
  const ms = Math.max(0, to.getTime() - Date.now());
  const seconds = Math.floor(ms / 1000) % 60;
  const minutes = Math.floor(ms / (1000 * 60)) % 60;
  const hours = Math.floor(ms / (1000 * 60 * 60)) % 24;
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));
  return { days, hours, minutes, seconds };
}

const pad = (n: number) => n.toString().padStart(2, "0");

function FlipDigit({ value }: { value: string }) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const prev = useRef(value);

  useGSAP(
    () => {
      if (!ref.current || prev.current === value) return;
      prev.current = value;
      gsap.fromTo(
        ref.current,
        { rotateX: -90, opacity: 0, y: -6 },
        {
          rotateX: 0,
          opacity: 1,
          y: 0,
          duration: 0.45,
          ease: "power3.out",
        },
      );
    },
    { dependencies: [value] },
  );

  return (
    <span
      ref={ref}
      className="inline-block"
      style={{ transformStyle: "preserve-3d" }}
    >
      {value}
    </span>
  );
}

export function CountdownTimer({ to, label }: { to: Date; label?: string }) {
  // Start with zeros so server+client first paint match (avoids hydration
  // mismatch). Real values pop in on the first tick below.
  const [parts, setParts] = useState<Parts>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    setParts(diff(to));
    const t = setInterval(() => setParts(diff(to)), 1000);
    return () => clearInterval(t);
  }, [to]);

  const units: Array<[number, string]> = [
    [parts.days, "dias"],
    [parts.hours, "h"],
    [parts.minutes, "min"],
    [parts.seconds, "s"],
  ];

  return (
    <div style={{ perspective: "600px" }}>
      {label && (
        <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
          {label}
        </p>
      )}
      <div className="flex items-baseline gap-3 font-mono tabular-nums sm:gap-4">
        {units.map(([value, unit], i) => (
          <div key={unit} className="flex items-baseline gap-3 sm:gap-4">
            <div className="flex flex-col items-start">
              <span className="text-4xl font-semibold leading-none tracking-tight sm:text-5xl">
                <FlipDigit value={pad(value)} />
              </span>
              <span className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground">
                {unit}
              </span>
            </div>
            {i < units.length - 1 && (
              <span
                aria-hidden
                className="text-3xl font-light text-muted-foreground/50 sm:text-4xl"
              >
                :
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
