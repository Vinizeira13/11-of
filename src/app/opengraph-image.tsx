import { ImageResponse } from "next/og";
import { BRAND_NAME, BRAND_TAGLINE } from "@/lib/brand";

export const runtime = "edge";
export const alt = `${BRAND_NAME} — ${BRAND_TAGLINE}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px",
          background:
            "radial-gradient(ellipse at 20% 0%, rgba(138, 226, 52, 0.22), transparent 60%), #0a0d12",
          color: "#f5f7f9",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span
            style={{
              fontSize: 68,
              fontWeight: 800,
              letterSpacing: "-0.04em",
              color: "#f5f7f9",
              display: "flex",
              alignItems: "baseline",
              gap: 14,
            }}
          >
            11
            <span
              style={{
                width: 8,
                height: 8,
                background: "#8ae234",
                borderRadius: 999,
                marginBottom: 6,
              }}
            />
            <span
              style={{
                fontSize: 48,
                fontStyle: "italic",
                fontWeight: 500,
                fontFamily: "serif",
                color: "#f5f7f9",
              }}
            >
              Of
            </span>
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          <span
            style={{
              fontSize: 18,
              textTransform: "uppercase",
              letterSpacing: "0.25em",
              color: "#8ae234",
              fontWeight: 600,
            }}
          >
            Coleção Copa 2026 · Oficial Nike
          </span>
          <span
            style={{
              fontSize: 112,
              fontWeight: 700,
              letterSpacing: "-0.035em",
              lineHeight: 0.95,
              maxWidth: 900,
            }}
          >
            Veste a tua{" "}
            <span
              style={{
                fontStyle: "italic",
                fontWeight: 400,
                fontFamily: "serif",
                color: "#8ae234",
              }}
            >
              seleção.
            </span>
          </span>
          <span
            style={{
              fontSize: 28,
              color: "rgba(245,247,249,0.7)",
              maxWidth: 880,
            }}
          >
            {BRAND_TAGLINE} PIX 15% OFF · Despacho em 24h.
          </span>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span style={{ fontSize: 22, color: "rgba(245,247,249,0.5)" }}>
            11of.com.br
          </span>
          <span
            style={{
              fontSize: 22,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "rgba(245,247,249,0.5)",
            }}
          >
            🇧🇷 🇫🇷 🇬🇧 🇳🇱 🇭🇷 🇺🇾 🇳🇴 🇨🇦
          </span>
        </div>
      </div>
    ),
    { ...size },
  );
}
