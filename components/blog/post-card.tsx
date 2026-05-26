import Image from "next/image";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { ScaleOnHover } from "@/components/motion/scale-on-hover";
import { Badge } from "@/components/ui/badge";
import type { PostListItem } from "@/lib/queries/post";

function formatDate(date: Date | null, fallback: Date) {
  const d = date ?? fallback;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

interface PostCardProps {
  post: PostListItem;
  locale: string;
}

export async function PostCard({ post, locale }: PostCardProps) {
  const t = await getTranslations("blog");
  const visibleTags = post.tags.slice(0, 3);
  const extraCount = post.tags.length - visibleTags.length;

  return (
    <ScaleOnHover>
      <Link
        href={`/${locale}/blog/${post.slug}`}
        className="group block overflow-hidden rounded-xl border bg-card transition-shadow hover:shadow-lg"
      >
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          {post.coverImageUrl ? (
            <Image
              src={post.coverImageUrl}
              alt={post.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              {t("noCover")}
            </div>
          )}
        </div>
        <div className="space-y-2 p-5">
          <p className="text-xs text-muted-foreground">
            {formatDate(post.publishedAt, post.updatedAt)} ·{" "}
            {t("readMin", { minutes: post.readingMinutes })}
          </p>
          <h3 className="font-heading text-lg font-semibold tracking-tight transition-colors group-hover:text-primary">
            {post.title}
          </h3>
          <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
            {post.excerpt}
          </p>
          {visibleTags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {visibleTags.map((tag) => (
                <Badge key={tag.slug} variant="secondary" className="text-xs">
                  {tag.name}
                </Badge>
              ))}
              {extraCount > 0 && (
                <Badge variant="secondary" className="text-xs">
                  +{extraCount}
                </Badge>
              )}
            </div>
          )}
        </div>
      </Link>
    </ScaleOnHover>
  );
}
