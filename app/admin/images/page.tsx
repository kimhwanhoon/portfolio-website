import { getAllImagesForAdmin } from "@/lib/queries/portfolio";
import { ImageGrid } from "../_components/image-grid";
import { ImageUpload } from "../_components/image-upload";

export default async function ImagesPage() {
  const allImages = await getAllImagesForAdmin();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Images</h1>
        <p className="text-sm text-zinc-500">
          Upload and manage images for your portfolio.
        </p>
      </div>
      <ImageUpload />
      <ImageGrid images={allImages} />
    </div>
  );
}
