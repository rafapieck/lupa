import { ImageResponse } from "next/og";
import { cardFonts } from "@/lib/card-fonts";
import { OG_FOOTER, OG_LABEL, parseShare, shareSources } from "@/lib/share";

// 1200×630 link preview for a shared card (PACKET §3b layout, §5 mockup):
// navy band + amber label → verdict badge → up to 3 signals → sources → footer.
// Inter from the repo, drawn into the PNG (no web fonts), and no emoji (they'd be fetched).

export const alt = "Aviso de Lupa con las señales de alerta encontradas";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const NAVY = "#1B2A41";
const AMBER = "#F2A900";

export default async function Image({ params }: { params: Promise<{ verdict: string; patterns: string }> }) {
  const { verdict, patterns } = await params;
  const card = parseShare(verdict, patterns);
  if (!card) return new Response("Not found", { status: 404 });

  const fonts = await cardFonts();
  const shown = card.patterns.slice(0, 3);
  const badge =
    card.verdict === "red" ? { bg: "#B91C1C", fg: "#FFFFFF" } : { bg: "#FCD34D", fg: NAVY };
  const signalSize = shown.length === 1 ? 64 : shown.length === 2 ? 52 : 38;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "#FFFFFF",
          fontFamily: "Inter",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: 96,
            background: NAVY,
            color: AMBER,
            fontSize: 38,
            fontWeight: 700,
            letterSpacing: 2,
          }}
        >
          {OG_LABEL}
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            flex: 1,
            padding: "28px 64px 0",
            background: "#F3F4F6",
          }}
        >
          <div
            style={{
              display: "flex",
              background: badge.bg,
              color: badge.fg,
              fontSize: 36,
              fontWeight: 700,
              padding: "8px 36px",
              borderRadius: 999,
            }}
          >
            {card.verdictLabel}
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: 20, gap: 10 }}>
            {shown.map((p) => (
              <div
                key={p.id}
                style={{
                  display: "flex",
                  textAlign: "center",
                  color: NAVY,
                  fontSize: signalSize,
                  fontWeight: 700,
                  lineHeight: 1.1,
                }}
              >
                {p.label_es}
              </div>
            ))}
          </div>
          <div
            style={{
              display: "flex",
              marginTop: "auto",
              marginBottom: 18,
              paddingTop: 14,
              borderTop: "2px solid #D1D5DB",
              color: "#4B5563",
              fontSize: 28,
            }}
          >
            {`Fuente: ${shareSources({ ...card, patterns: shown }).join(" · ")}`}
          </div>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: 78,
            background: "#FFFFFF",
            color: NAVY,
            fontSize: 32,
            fontWeight: 700,
          }}
        >
          {OG_FOOTER}
        </div>
      </div>
    ),
    { ...size, fonts, headers: { "Cache-Control": "public, max-age=86400, immutable" } },
  );
}
