import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { ModalShell } from "@/components/portfolio/modal-shell";
import { PortfolioDetail } from "@/components/portfolio/portfolio-detail";
import type { Locale } from "@/i18n/routing";
import { getPortfolioBySlug } from "@/lib/queries/portfolio";

export default async function PortfolioModal({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const item = await getPortfolioBySlug(slug, locale as Locale);
  if (!item) notFound();

  return (
    <ModalShell>
      <PortfolioDetail item={item} />
    </ModalShell>
  );
}
