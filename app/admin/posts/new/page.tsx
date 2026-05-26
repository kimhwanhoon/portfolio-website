import { getAllImagesForAdmin } from "@/lib/queries/portfolio";
import { PostForm } from "../../_components/post-form";

export default async function NewPostPage() {
  const allImages = await getAllImagesForAdmin();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">New Post</h1>
        <p className="text-sm text-zinc-500">Create a new blog post.</p>
      </div>
      <PostForm
        availableImages={allImages.map((img) => ({
          id: img.id,
          url: img.url,
          alt: img.alt,
        }))}
      />
    </div>
  );
}
