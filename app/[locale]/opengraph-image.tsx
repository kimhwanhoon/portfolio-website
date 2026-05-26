import { ImageResponse } from "next/og";

export const alt = "Kim Hwanhoon — Frontend Developer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 80,
        background:
          "linear-gradient(135deg, #fafafa 0%, #f4f4f5 50%, #e4e4e7 100%)",
        color: "#0a0a0a",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          fontSize: 22,
          color: "#52525b",
          letterSpacing: "0.3em",
          textTransform: "uppercase",
          fontWeight: 500,
        }}
      >
        Frontend Developer
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <div
          style={{
            fontSize: 120,
            fontWeight: 700,
            lineHeight: 1,
            letterSpacing: "-0.04em",
          }}
        >
          Kim Hwanhoon
        </div>
        <div
          style={{
            fontSize: 36,
            color: "#3f3f46",
            lineHeight: 1.3,
            maxWidth: 900,
          }}
        >
          I craft web experiences that just work.
        </div>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontSize: 22,
          color: "#71717a",
        }}
      >
        <span>kimhwanhoon.com</span>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 56,
            height: 56,
            background: "#0a0a0a",
            color: "#fafafa",
            fontWeight: 700,
            letterSpacing: "-0.04em",
            borderRadius: 12,
          }}
        >
          KH
        </div>
      </div>
    </div>,
    { ...size },
  );
}
