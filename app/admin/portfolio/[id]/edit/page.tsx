import { desc } from "drizzle-orm";
import { notFound } from "next/navigation";
import { PortfolioForm } from "@/app/admin/_components/portfolio-form";
import { db } from "@/lib/db";
import { images } from "@/lib/db/schema";
import { getPortfolioItemForEdit } from "@/lib/queries/portfolio";

export default async function EditPortfolioPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const item = await getPortfolioItemForEdit(id);
  if (!item) notFound();

  const allImages = await db
    .select({
      id: images.id,
      url: images.url,
      alt: images.id, // placeholder — alt is in translations now
      width: images.width,
      height: images.height,
      portfolioId: images.portfolioId,
    })
    .from(images)
    .orderBy(desc(images.createdAt));

  const assignedImageIds = allImages
    .filter((img) => img.portfolioId === id)
    .map((img) => img.id);

  // Map to the shape the form expects
  const formImages = allImages.map((img) => ({
    id: img.id,
    url: img.url,
    alt: null as string | null,
    width: img.width,
    height: img.height,
  }));

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Edit Portfolio Item
        </h1>
        <p className="text-sm text-zinc-500">
          Update &ldquo;{item.title}&rdquo;.
        </p>
      </div>
      <PortfolioForm
        initialData={item}
        allImages={formImages}
        initialImageIds={assignedImageIds}
      />
    </div>
  );
}
