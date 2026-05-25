import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter, Montserrat } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import { cn } from "@/lib/utils";

const montserratHeading = Montserrat({subsets:['latin'],variable:'--font-heading'});

const inter = Inter({subsets:['latin'],variable:'--font-sans'});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Kim Hwanhoon | Frontend Developer",
    template: "%s | Kim Hwanhoon",
  },
  description:
    "Frontend developer portfolio — I craft web experiences that just work.",
};

export default function RootLayout({
  children,
  modal,
}: Readonly<{
  children: React.ReactNode;
  modal: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html
        lang="en"
        className={cn("h-full", "antialiased", geistSans.variable, geistMono.variable, "font-sans", inter.variable, montserratHeading.variable)}
      >
        <body className="min-h-full flex flex-col">
          {children}
          {modal}
        </body>
      </html>
    </ClerkProvider>
  );
}
