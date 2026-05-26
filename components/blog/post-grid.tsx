import type { PostListItem } from "@/lib/queries/post";
import { PostCard } from "./post-card";

interface PostGridProps {
  posts: PostListItem[];
  locale: string;
}

export function PostGrid({ posts, locale }: PostGridProps) {
  if (posts.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} locale={locale} />
      ))}
    </div>
  );
}
