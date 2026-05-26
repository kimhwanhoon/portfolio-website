import { IconPlus } from "@tabler/icons-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { getAllPostsForAdmin } from "@/lib/queries/post";
import { PostList } from "../_components/post-list";

export default async function AdminPostsPage() {
  const items = await getAllPostsForAdmin();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Posts</h1>
          <p className="text-sm text-zinc-500">Manage your blog posts.</p>
        </div>
        <Link href="/admin/posts/new" className={buttonVariants()}>
          <IconPlus className="size-4" />
          New Post
        </Link>
      </div>
      <PostList items={items} />
    </div>
  );
}
