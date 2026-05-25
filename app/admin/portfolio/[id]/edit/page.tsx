import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { portfolioItems, images } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { PortfolioForm } from "../../../_components/portfolio-form";

export default async function EditPortfolioPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const item = await db.query.portfolioItems.findFirst({
    where: eq(portfolioItems.id, id),
  });

  if (!item) notFound();

  // Fetch all images and the ones assigned to this portfolio item
  const allImages = await db
    .select({
      id: images.id,
      url: images.url,
      alt: images.alt,
      width: images.width,
      height: images.height,
      portfolioId: images.portfolioId,
    })
    .from(images)
    .orderBy(desc(images.createdAt));

  const assignedImageIds = allImages
    .filter((img) => img.portfolioId === id)
    .map((img) => img.id);

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
        allImages={allImages}
        initialImageIds={assignedImageIds}
      />
    </div>
  );
}
