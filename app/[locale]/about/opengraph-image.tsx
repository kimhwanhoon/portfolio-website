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
  const t = await getTranslations({ locale, namespace: "aboutPage" });
  const tHero = await getTranslations({ locale, namespace: "hero" });

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
          "linear-gradient(135deg, #fafafa 0%, #f4f4f5 50%, #e4e4e7 100%)",
        color: "#0a0a0a",
      }}
    >
      <div
        style={{
          fontSize: 22,
          letterSpacing: "0.3em",
          textTransform: "uppercase",
          color: "#52525b",
          marginBottom: 24,
        }}
      >
        {tHero("label")}
      </div>
      <div style={{ fontSize: 84, fontWeight: 700, letterSpacing: "-0.03em" }}>
        {t("title")}
      </div>
      <div style={{ fontSize: 32, color: "#3f3f46", marginTop: 16 }}>
        {tHero("name")}
      </div>
    </div>,
    { ...size },
  );
}
