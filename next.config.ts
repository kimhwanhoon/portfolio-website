import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

/**
 * Parse the R2 public URL (e.g. https://pub-xxx.r2.dev) into a hostname for
 * next/image's remotePatterns and a full origin for a preconnect link header.
 * Falls back to a permissive *.r2.dev pattern when the env var is missing
 * (e.g. local dev without R2 configured).
 */
function getR2Origin(): { hostname: string; origin: string | null } {
  const raw = process.env.R2_PUBLIC_URL;
  if (!raw) return { hostname: "*.r2.dev", origin: null };
  try {
    const url = new URL(raw);
    return { hostname: url.hostname, origin: url.origin };
  } catch {
    return { hostname: "*.r2.dev", origin: null };
  }
}

const r2 = getR2Origin();

const nextConfig: NextConfig = {
  poweredByHeader: false,
  experimental: {
    // Must be >= MAX_SIZE in app/api/images/upload/route.ts.
    proxyClientMaxBodySize: "20mb",
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: r2.hostname,
      },
    ],
  },
  headers: async () => {
    const securityHeaders = [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    ];
    const baseHeaders = r2.origin
      ? [
          { key: "Link", value: `<${r2.origin}>; rel=preconnect` },
          ...securityHeaders,
        ]
      : securityHeaders;

    return [
      {
        source: "/(.*)",
        headers: baseHeaders,
      },
    ];
  },
};

export default withNextIntl(nextConfig);
