import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter, Montserrat } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import { cn } from "@/lib/utils";

const montserratHeading = Montserrat({
  subsets: ["latin"],
  variable: "--font-heading",
});
const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://kimhwanhoon.com";

export const metadata: Metadata = {
  title: {
    default: "Kim Hwanhoon | Frontend Developer",
    template: "%s | Kim Hwanhoon",
  },
  description:
    "Frontend developer portfolio — I craft web experiences that just work.",
  authors: [{ name: "Kim Hwanhoon" }],
  creator: "Kim Hwanhoon",
  metadataBase: new URL(BASE_URL),
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Kim Hwanhoon",
    title: "Kim Hwanhoon | Frontend Developer",
    description:
      "Frontend developer portfolio — I craft web experiences that just work.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kim Hwanhoon | Frontend Developer",
    description:
      "Frontend developer portfolio — I craft web experiences that just work.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html
        lang="en"
        className={cn(
          "h-full",
          "antialiased",
          geistSans.variable,
          geistMono.variable,
          "font-sans",
          inter.variable,
          montserratHeading.variable,
        )}
      >
        <body className="min-h-full flex flex-col">
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:text-primary-foreground"
          >
            Skip to content
          </a>
          {children}
          <Analytics />
        </body>
      </html>
    </ClerkProvider>
  );
}
