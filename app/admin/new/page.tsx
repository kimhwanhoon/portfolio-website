import { PortfolioForm } from "@/app/admin/_components/portfolio-form";
import { getAllImagesForAdmin } from "@/lib/queries/portfolio";

export default async function NewPortfolioPage() {
  const allImages = await getAllImagesForAdmin();

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
          New Portfolio Item
        </h1>
        <p className="text-sm text-zinc-500">Create a new portfolio item.</p>
      </div>
      <PortfolioForm allImages={formImages} />
    </div>
  );
}
