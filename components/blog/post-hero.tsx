import Image from "next/image";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Badge } from "@/components/ui/badge";
import type { PostListItem } from "@/lib/queries/post";

function formatDate(date: Date | null, fallback: Date) {
  const d = date ?? fallback;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

interface PostHeroProps {
  post: PostListItem;
  locale: string;
}

export async function PostHero({ post, locale }: PostHeroProps) {
  const t = await getTranslations("blog");

  return (
    <Link
      href={`/${locale}/blog/${post.slug}`}
      className="group grid overflow-hidden rounded-2xl border bg-card transition-shadow hover:shadow-lg md:grid-cols-2"
    >
      <div className="relative aspect-[4/3] bg-muted md:aspect-auto md:min-h-[320px]">
        {post.coverImageUrl ? (
          <Image
            src={post.coverImageUrl}
            alt={post.title}
            fill
            priority
            className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        ) : (
          <div className="flex h-full min-h-[240px] items-center justify-center text-muted-foreground">
            {t("noCover")}
          </div>
        )}
      </div>
      <div className="flex flex-col justify-center gap-4 p-8 md:p-10">
        <span className="text-xs font-medium uppercase tracking-wider text-primary">
          {t("featuredLabel")}
        </span>
        <h2 className="font-heading text-2xl font-semibold tracking-tight transition-colors group-hover:text-primary md:text-3xl">
          {post.title}
        </h2>
        <p className="line-clamp-3 text-muted-foreground leading-relaxed">
          {post.excerpt}
        </p>
        <p className="text-sm text-muted-foreground">
          {formatDate(post.publishedAt, post.updatedAt)} ·{" "}
          {t("readMin", { minutes: post.readingMinutes })}
        </p>
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {post.tags.map((tag) => (
              <Badge key={tag.slug} variant="secondary">
                {tag.name}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
