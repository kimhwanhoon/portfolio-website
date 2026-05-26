import { notFound } from "next/navigation";
import { PortfolioForm } from "@/app/admin/_components/portfolio-form";
import {
  getAllImagesForAdmin,
  getPortfolioItemForEdit,
} from "@/lib/queries/portfolio";

export default async function EditPortfolioPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const item = await getPortfolioItemForEdit(id);
  if (!item) notFound();

  const allImages = await getAllImagesForAdmin();

  const assignedImageIds = allImages
    .filter((img) => img.portfolioId === id)
    .map((img) => img.id);

  const formImages = allImages.map((img) => ({
    id: img.id,
    url: img.url,
    alt: img.alt,
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
          Update &ldquo;{item.translations.en.title}&rdquo;.
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
