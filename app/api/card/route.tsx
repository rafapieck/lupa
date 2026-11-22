import { ImageResponse } from "next/og";
import { cardFonts } from "@/lib/card-fonts";
import { CARD_FOOTER, SERIES_A, SERIES_C, headlineSize, parseCardQuery } from "@/lib/cards";

// GET /api/card?series=a&pattern=<id>  → 1080×1080 "SEÑAL DE LA SEMANA"
// GET /api/card?series=c               → 1080×1920 "ANTES DE DEPOSITAR"
// Same five slots as every Lupa card (PACKET §3b): band → headline → body →
// source chip → footer. Inter from the repo, drawn into the PNG (no web fonts), no emoji.

const NAVY = "#1B2A41";
const AMBER = "#F2A900";
const GRAY_BG = "#F3F4F6";
const CACHE = "public, max-age=86400";

function Card({
  label,
  headline,
  body,
  source,
  tall,
}: {
  label: string;
  headline: string;
  body: React.ReactNode;
  source: string;
  tall: boolean;
}) {
  return (
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
          height: tall ? 200 : 130,
          background: NAVY,
          color: AMBER,
          fontSize: 34,
          fontWeight: 700,
          letterSpacing: 3,
        }}
      >
        {label}
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          padding: tall ? "160px 80px 80px" : "64px 80px 40px",
          background: GRAY_BG,
        }}
      >
        <div
          style={{
            display: "flex",
            color: NAVY,
            fontSize: tall ? 96 : headlineSize(headline),
            fontWeight: 700,
            lineHeight: 1.1,
          }}
        >
          {headline}
        </div>
        <div style={{ display: "flex", flexDirection: "column", marginTop: tall ? 120 : 40, color: NAVY, fontSize: 40, lineHeight: 1.3 }}>
          {body}
        </div>
        <div style={{ display: "flex", marginTop: "auto" }}>
          <div
            style={{
              display: "flex",
              background: "#FFFFFF",
              border: "2px solid #D1D5DB",
              borderRadius: 999,
              padding: "10px 28px",
              color: "#4B5563",
              fontSize: 30,
            }}
          >
            {`Fuente: ${source}`}
          </div>
        </div>
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: tall ? 180 : 120,
          background: "#FFFFFF",
          borderTop: `8px solid ${AMBER}`,
          color: NAVY,
          fontSize: 30,
          fontWeight: 700,
        }}
      >
        {CARD_FOOTER}
      </div>
    </div>
  );
}

export async function GET(request: Request) {
  const card = parseCardQuery(new URL(request.url).searchParams);
  if (!card) {
    return Response.json({ error: "series must be a (with a known pattern) or c" }, { status: 400 });
  }

  const fonts = await cardFonts();
  if (card.series === "a") {
    const p = card.pattern;
    return new ImageResponse(
      <Card label={SERIES_A.label} headline={p.label_es} body={p.next_step_es} source={p.source} tall={false} />,
      { ...SERIES_A.size, fonts, headers: { "Cache-Control": CACHE } },
    );
  }

  return new ImageResponse(
    (
      <Card
        label={SERIES_C.label}
        headline={SERIES_C.headline}
        source={card.source}
        tall
        body={SERIES_C.lines.map((line, i) => (
          <div key={line} style={{ display: "flex", alignItems: "flex-start", marginBottom: 88 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 72,
                height: 72,
                borderRadius: 999,
                background: AMBER,
                color: NAVY,
                fontSize: 40,
                fontWeight: 700,
                marginRight: 32,
                flexShrink: 0,
              }}
            >
              {String(i + 1)}
            </div>
            <div style={{ display: "flex", flex: 1, fontSize: 56, fontWeight: 700, lineHeight: 1.2, paddingTop: 2 }}>
              {line}
            </div>
          </div>
        ))}
      />
    ),
    { ...SERIES_C.size, fonts, headers: { "Cache-Control": CACHE } },
  );
}
