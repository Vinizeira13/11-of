const REGION_DAYS: Record<string, [number, number]> = {
  SP: [2, 4],
  RJ: [2, 4],
  MG: [2, 4],
  ES: [2, 4],
  PR: [3, 5],
  SC: [3, 5],
  RS: [3, 5],
  DF: [3, 5],
  GO: [3, 5],
  BA: [4, 7],
  PE: [4, 7],
  CE: [4, 7],
  RN: [4, 7],
  PB: [4, 7],
  SE: [4, 7],
  AL: [4, 7],
  MT: [4, 7],
  MS: [4, 7],
  MA: [5, 8],
  PI: [5, 8],
  TO: [5, 8],
  PA: [5, 8],
  AM: [6, 10],
  AP: [7, 11],
  AC: [7, 11],
  RR: [8, 12],
  RO: [6, 10],
};

const DEFAULT_RANGE: [number, number] = [5, 9];
const CUT_OFF_HOUR = 15;
const PROCESSING_DAYS_BEFORE_CUT_OFF = 0;
const PROCESSING_DAYS_AFTER_CUT_OFF = 1;

export type DeliveryEstimate = {
  earliest: Date;
  latest: Date;
  cityLabel: string;
  cutOff: { hoursLeft: number; minutesLeft: number } | null;
};

function addDays(base: Date, days: number): Date {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d;
}

export function estimateDelivery(
  uf: string,
  cityLabel: string,
  now: Date = new Date(),
): DeliveryEstimate {
  const [minDays, maxDays] = REGION_DAYS[uf.toUpperCase()] ?? DEFAULT_RANGE;

  const beforeCutOff = now.getHours() < CUT_OFF_HOUR;
  const processing = beforeCutOff
    ? PROCESSING_DAYS_BEFORE_CUT_OFF
    : PROCESSING_DAYS_AFTER_CUT_OFF;

  const earliest = addDays(now, processing + minDays);
  const latest = addDays(now, processing + maxDays);

  let cutOff: DeliveryEstimate["cutOff"] = null;
  if (beforeCutOff) {
    const ms =
      new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        CUT_OFF_HOUR,
        0,
        0,
      ).getTime() - now.getTime();
    cutOff = {
      hoursLeft: Math.floor(ms / (1000 * 60 * 60)),
      minutesLeft: Math.floor((ms / (1000 * 60)) % 60),
    };
  }

  return { earliest, latest, cityLabel, cutOff };
}

const fmtDate = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "short",
});

export function formatDeliveryRange(e: DeliveryEstimate): string {
  const earliestDay = e.earliest.getDate();
  const latestDay = e.latest.getDate();
  const sameMonth = e.earliest.getMonth() === e.latest.getMonth();

  if (sameMonth) {
    const month = fmtDate.format(e.earliest).split(" ").slice(1).join(" ");
    return `${earliestDay}–${latestDay} de ${month}`;
  }
  return `${fmtDate.format(e.earliest)} – ${fmtDate.format(e.latest)}`;
}
