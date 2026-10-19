import { ImageResponse } from "next/og";

export const alt = "Shamflare — software development";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Language-neutral social card: brand name and domain only, so every locale can share it.
export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 80,
          background: "linear-gradient(135deg, #070c16 0%, #0b1220 55%, #111b2d 100%)",
          color: "#f8fafc",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 18,
              border: "2px solid rgba(103,232,249,0.55)",
              background: "#111b2d",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 44,
              fontWeight: 700,
              color: "#67e8f9",
            }}
          >
            S
          </div>
          <div style={{ display: "flex", fontSize: 56, fontWeight: 700, letterSpacing: -2 }}>
            sham<span style={{ color: "#67e8f9" }}>flare</span>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ display: "flex", fontSize: 64, fontWeight: 700, letterSpacing: -2, lineHeight: 1.1, maxWidth: 900 }}>
            Software development &amp; digital solutions.
          </div>
          <div style={{ display: "flex", fontSize: 28, color: "#a7b5cc" }}>
            Web · Mobile · Desktop · Support — shamflare.com
          </div>
        </div>
        <div
          style={{
            position: "absolute",
            right: -120,
            top: -120,
            width: 520,
            height: 520,
            borderRadius: 9999,
            background: "radial-gradient(circle, rgba(56,189,248,0.28), rgba(56,189,248,0) 70%)",
          }}
        />
      </div>
    ),
    size,
  );
}
