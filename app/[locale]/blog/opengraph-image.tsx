import { ImageResponse } from "next/og";
import { getTranslations } from "next-intl/server";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "blog" });

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: 80,
        background:
          "linear-gradient(135deg, #0a0a0a 0%, #18181b 50%, #27272a 100%)",
        color: "#fafafa",
      }}
    >
      <div
        style={{
          fontSize: 22,
          letterSpacing: "0.3em",
          textTransform: "uppercase",
          color: "#a1a1aa",
          marginBottom: 24,
        }}
      >
        Blog
      </div>
      <div style={{ fontSize: 72, fontWeight: 700, letterSpacing: "-0.03em" }}>
        {t("heading")}
      </div>
      <div
        style={{
          fontSize: 28,
          color: "#d4d4d8",
          marginTop: 24,
          maxWidth: 900,
        }}
      >
        {t("subtitle")}
      </div>
    </div>,
    { ...size },
  );
}
