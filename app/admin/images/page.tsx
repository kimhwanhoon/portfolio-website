import { db } from "@/lib/db";
import { images } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import { ImageUpload } from "../_components/image-upload";
import { ImageGrid } from "../_components/image-grid";

export default async function ImagesPage() {
  const allImages = await db
    .select()
    .from(images)
    .orderBy(desc(images.createdAt));

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
