import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Inter, Montserrat } from "next/font/google";
import { getLocale } from "next-intl/server";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { SITE_AUTHOR, SITE_URL, SITE_VERIFICATION } from "@/lib/site-config";
import { cn } from "@/lib/utils";

const montserratHeading = Montserrat({
  subsets: ["latin"],
  variable: "--font-heading",
});

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_AUTHOR} | Frontend Developer`,
    template: `%s | ${SITE_AUTHOR}`,
  },
  description:
    "Frontend developer portfolio — I craft web experiences that just work.",
  authors: [{ name: SITE_AUTHOR }],
  creator: SITE_AUTHOR,
  openGraph: {
    type: "website",
    siteName: SITE_AUTHOR,
  },
  twitter: {
    card: "summary_large_image",
  },
  robots: {
    index: true,
    follow: true,
  },
  ...(Object.keys(SITE_VERIFICATION).length > 0
    ? { verification: SITE_VERIFICATION }
    : {}),
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();

  return (
    <ClerkProvider>
      <html
        lang={locale}
        suppressHydrationWarning
        className={cn(
          "h-full",
          "antialiased",
          "font-sans",
          inter.variable,
          montserratHeading.variable,
        )}
      >
        <body className="min-h-full flex flex-col">
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <a
              href="#main"
              className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:text-primary-foreground"
            >
              Skip to content
            </a>
            {children}
            <Analytics />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
