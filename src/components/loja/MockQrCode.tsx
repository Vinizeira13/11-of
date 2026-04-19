"use client";

import { useMemo } from "react";

const SIZE = 25;

function hashPayload(payload: string): Uint8Array {
  const out = new Uint8Array(SIZE * SIZE);
  let h = 2166136261;
  for (let i = 0; i < payload.length; i++) {
    h ^= payload.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  for (let i = 0; i < out.length; i++) {
    h ^= h << 13;
    h ^= h >>> 17;
    h ^= h << 5;
    out[i] = h & 1;
  }
  return out;
}

function isFinderCell(row: number, col: number): boolean {
  const inBlock = (r: number, c: number) =>
    row >= r &&
    row < r + 7 &&
    col >= c &&
    col < c + 7 &&
    (row === r ||
      row === r + 6 ||
      col === c ||
      col === c + 6 ||
      (row >= r + 2 && row <= r + 4 && col >= c + 2 && col <= c + 4));
  return (
    inBlock(0, 0) || inBlock(0, SIZE - 7) || inBlock(SIZE - 7, 0)
  );
}

function isFinderMask(row: number, col: number): boolean {
  return (
    (row < 8 && col < 8) ||
    (row < 8 && col >= SIZE - 8) ||
    (row >= SIZE - 8 && col < 8)
  );
}

export function MockQrCode({ payload }: { payload: string }) {
  const cells = useMemo(() => hashPayload(payload), [payload]);

  return (
    <div
      role="img"
      aria-label="QR Code PIX (mock)"
      className="relative grid aspect-square w-full rounded-lg border border-border/60 bg-white p-3"
      style={{
        gridTemplateColumns: `repeat(${SIZE}, 1fr)`,
        gridTemplateRows: `repeat(${SIZE}, 1fr)`,
      }}
    >
      {Array.from({ length: SIZE * SIZE }, (_, i) => {
        const row = Math.floor(i / SIZE);
        const col = i % SIZE;
        const isFinder = isFinderCell(row, col);
        const masked = isFinderMask(row, col);
        const on = isFinder || (!masked && cells[i] === 1);
        return (
          <div
            key={i}
            className={on ? "bg-neutral-900" : "bg-transparent"}
          />
        );
      })}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
      >
        <div className="rounded bg-white px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
          mock
        </div>
      </div>
    </div>
  );
}
