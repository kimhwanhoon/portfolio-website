import { ImageResponse } from "next/og";
import type { Locale } from "@/i18n/routing";
import { getPortfolioBySlug } from "@/lib/queries/portfolio";

export const alt = "Portfolio project";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const item = await getPortfolioBySlug(slug, locale as Locale);

  const title = item?.title ?? "Portfolio";
  const description = item?.shortDescription ?? "";
  const thumbnail = item?.thumbnailUrl ?? null;

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        position: "relative",
        background: "#0a0a0a",
        color: "#fafafa",
      }}
    >
      {thumbnail && (
        // biome-ignore lint/performance/noImgElement: ImageResponse (Satori) only supports raw <img>, not next/image
        <img
          src={thumbnail}
          alt=""
          width={1200}
          height={630}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            opacity: 0.35,
          }}
        />
      )}

      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 80,
          background:
            "linear-gradient(180deg, rgba(10,10,10,0.5) 0%, rgba(10,10,10,0.85) 100%)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            fontSize: 22,
            color: "#a1a1aa",
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            fontWeight: 500,
          }}
        >
          Selected Work
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div
            style={{
              fontSize: 84,
              fontWeight: 700,
              lineHeight: 1.05,
              letterSpacing: "-0.03em",
              maxWidth: 1040,
            }}
          >
            {title}
          </div>
          {description && (
            <div
              style={{
                fontSize: 28,
                color: "#d4d4d8",
                lineHeight: 1.4,
                maxWidth: 1040,
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {description}
            </div>
          )}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: 22,
            color: "#a1a1aa",
          }}
        >
          <span>Kim Hwanhoon — Frontend Developer</span>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 56,
              height: 56,
              background: "#fafafa",
              color: "#0a0a0a",
              fontWeight: 700,
              letterSpacing: "-0.04em",
              borderRadius: 12,
            }}
          >
            KH
          </div>
        </div>
      </div>
    </div>,
    { ...size },
  );
}
