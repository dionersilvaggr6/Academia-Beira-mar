import { ImageResponse } from "next/og";

export const alt =
  "Academia Beira Mar — Aqui evoluímos. Musculação, Pilates e Funcional em Capão da Canoa.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Cores do design system (`app/globals.css`) — duplicadas aqui porque
// `ImageResponse` (Satori) não lê `@theme`/CSS custom properties, só estilos
// inline resolvidos em build/request time.
const INK = "#0A0A0B";
const FG = "#F3F3F5";
const FG_DIM = "#AEB3BD";
const FLAME = "#FF6A2B";

export default function Image() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: INK,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 8,
          backgroundColor: FLAME,
          display: "flex",
        }}
      />

      {/* Ícone: barra + anilhas, mesma composição de public/brand/mark.svg */}
      <div style={{ display: "flex", alignItems: "center", marginBottom: 40 }}>
        <div
          style={{
            width: 16,
            height: 84,
            borderRadius: 8,
            backgroundColor: FLAME,
          }}
        />
        <div
          style={{
            width: 22,
            height: 132,
            borderRadius: 10,
            backgroundColor: FG,
            marginLeft: 8,
          }}
        />
        <div
          style={{
            width: 176,
            height: 32,
            borderRadius: 16,
            backgroundColor: FLAME,
            marginLeft: 8,
          }}
        />
        <div
          style={{
            width: 22,
            height: 132,
            borderRadius: 10,
            backgroundColor: FG,
            marginLeft: 8,
          }}
        />
        <div
          style={{
            width: 16,
            height: 84,
            borderRadius: 8,
            backgroundColor: FLAME,
            marginLeft: 8,
          }}
        />
      </div>

      <div
        style={{
          display: "flex",
          fontSize: 92,
          fontWeight: 700,
          color: FG,
          letterSpacing: 6,
        }}
      >
        BEIRA MAR
      </div>

      <div
        style={{
          display: "flex",
          fontSize: 42,
          fontWeight: 700,
          color: FLAME,
          marginTop: 28,
        }}
      >
        Aqui evoluímos.
      </div>

      <div
        style={{
          display: "flex",
          fontSize: 28,
          color: FG_DIM,
          marginTop: 18,
        }}
      >
        Musculação · Pilates · Funcional — Capão da Canoa
      </div>
    </div>,
    { ...size },
  );
}
