import { notFound } from "next/navigation";
import { getPortfolioBySlug } from "@/lib/queries/portfolio";
import { ModalShell } from "@/components/portfolio/modal-shell";
import { PortfolioDetail } from "@/components/portfolio/portfolio-detail";

export default async function PortfolioModal({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const item = await getPortfolioBySlug(slug);
  if (!item) notFound();

  return (
    <ModalShell>
      <PortfolioDetail item={item} />
    </ModalShell>
  );
}
