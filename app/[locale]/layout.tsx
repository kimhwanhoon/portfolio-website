import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { type Locale, routing } from "@/i18n/routing";
import { buildOpenGraphLocaleFields } from "@/lib/seo/og";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};

  const messages = (await import(`../../messages/${locale}.json`)).default;
  const meta = messages.meta as {
    title: string;
    titleTemplate: string;
    description: string;
  };

  return {
    title: {
      default: meta.title,
      template: meta.titleTemplate.replace("{title}", "%s"),
    },
    description: meta.description,
    openGraph: {
      description: meta.description,
      ...buildOpenGraphLocaleFields(locale as Locale),
    },
    twitter: {
      description: meta.description,
    },
  };
}

export default async function LocaleLayout({
  children,
  modal,
  params,
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  setRequestLocale(locale);

  return (
    <NextIntlClientProvider>
      {children}
      {modal}
    </NextIntlClientProvider>
  );
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}
