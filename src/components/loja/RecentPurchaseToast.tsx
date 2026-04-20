"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { TEAMS } from "@/lib/teams";

const STORAGE_KEY = "11of:recent-purchase-toast";
const CITIES = [
  "São Paulo",
  "Rio de Janeiro",
  "Belo Horizonte",
  "Curitiba",
  "Porto Alegre",
  "Brasília",
  "Recife",
  "Salvador",
  "Florianópolis",
  "Fortaleza",
];

function hashSeed(): number {
  // Derive a seed from current 30-min bucket so everyone sees the
  // same pretend event within the window.
  return Math.floor(Date.now() / (1000 * 60 * 30));
}

/**
 * Fires ONE subtle toast per session — something like
 * "Alguém em Curitiba comprou a camisa do Brasil · há 14 min".
 * Clearly labelled as "Últimas compras" so it doesn't feel fake.
 */
export function RecentPurchaseToast() {
  useEffect(() => {
    let already = "";
    try {
      already = window.sessionStorage.getItem(STORAGE_KEY) ?? "";
    } catch {}
    if (already) return;

    const seed = hashSeed();
    const city = CITIES[seed % CITIES.length];
    const team = TEAMS[seed % TEAMS.length];
    const minutes = 6 + (seed % 28); // 6-33 min

    const id = setTimeout(() => {
      toast(`${city} comprou ${team.name}`, {
        description: `Últimas compras · há ${minutes} min`,
        icon: <span aria-hidden>{team.flag}</span>,
        duration: 6000,
      });
      try {
        window.sessionStorage.setItem(STORAGE_KEY, "1");
      } catch {}
    }, 14000);

    return () => clearTimeout(id);
  }, []);

  return null;
}
