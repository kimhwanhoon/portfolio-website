import { notFound } from "next/navigation";
import { getAllImagesForAdmin } from "@/lib/queries/portfolio";
import { getPostForEdit } from "@/lib/queries/post";
import { PostForm } from "../../_components/post-form";

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [post, allImages] = await Promise.all([
    getPostForEdit(id),
    getAllImagesForAdmin(),
  ]);

  if (!post) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Edit Post</h1>
        <p className="text-sm text-zinc-500">{post.title}</p>
      </div>
      <PostForm
        initialData={post}
        availableImages={allImages.map((img) => ({
          id: img.id,
          url: img.url,
          alt: img.alt,
        }))}
      />
    </div>
  );
}
