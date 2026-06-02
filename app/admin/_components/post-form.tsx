"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { useEffect, useRef, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { createPost, updatePost } from "@/app/actions/post";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { type Locale, routing } from "@/i18n/routing";
import type { TiptapJSON } from "@/lib/db/schema";
import {
  buildTranslationsRecord,
  isTranslationEmpty,
} from "@/lib/i18n/translation-utils";
import type { PostEditTranslations } from "@/lib/queries/post";
import {
  type PostFormData,
  type PostFormInput,
  postFormSchema,
  postSchema,
} from "@/lib/validators/post";
import { CoverImagePicker } from "./cover-image-picker";
import { LocaleTabs } from "./locale-tabs";
import {
  EMPTY_TIPTAP_DOC,
  TiptapEditor,
  type TiptapEditorRef,
} from "./tiptap-editor";
import {
  type PostAutosaveSnapshot,
  usePostAutosave,
} from "./use-post-autosave";

interface AvailableImage {
  id: string;
  url: string;
  alt: string | null;
}

interface PostFormProps {
  initialData?: {
    id: string;
    slug: string;
    coverImageUrl: string | null;
    status: "draft" | "published";
    featured: boolean;
    publishedAt: Date | null;
    updatedAt: Date;
    translations: PostEditTranslations;
    tags: { slug: string; name: string }[];
  };
  availableImages?: AvailableImage[];
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

function isRedirectError(e: unknown): boolean {
  return (
    e !== null &&
    typeof e === "object" &&
    "digest" in e &&
    String((e as { digest: string }).digest).startsWith("NEXT_REDIRECT")
  );
}

function formatTimeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function PostForm({ initialData, availableImages = [] }: PostFormProps) {
  const [isPending, startTransition] = useTransition();
  const isEditing = !!initialData;
  const editorRefs = useRef<Partial<Record<Locale, TiptapEditorRef | null>>>(
    {},
  );
  const [error, setError] = useState<string | null>(null);
  const [pendingDraft, setPendingDraft] = useState<PostAutosaveSnapshot | null>(
    null,
  );
  const [editorKeys, setEditorKeys] = useState<Record<Locale, number>>(
    () =>
      Object.fromEntries(routing.locales.map((l) => [l, 0])) as Record<
        Locale,
        number
      >,
  );
  const [editorContent, setEditorContent] = useState<
    Record<Locale, TiptapJSON>
  >(() =>
    buildTranslationsRecord<TiptapJSON>(
      Object.fromEntries(
        routing.locales.map((l) => [
          l,
          initialData?.translations[l]?.contentJson as TiptapJSON | undefined,
        ]),
      ) as Partial<Record<Locale, TiptapJSON>>,
      EMPTY_TIPTAP_DOC,
    ),
  );
  const [editorDirty, setEditorDirty] = useState(false);

  const storageKey = `post-draft:${initialData?.id ?? "new"}`;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isDirty },
  } = useForm<PostFormInput>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(postFormSchema) as any,
    defaultValues: {
      slug: initialData?.slug ?? "",
      coverImageUrl: initialData?.coverImageUrl ?? "",
      status: initialData?.status ?? "draft",
      featured: initialData?.featured ?? false,
      publishedAt: initialData?.publishedAt ?? null,
      tagSlugs: initialData?.tags.map((t) => t.name) ?? [],
      translations: buildTranslationsRecord(
        Object.fromEntries(
          routing.locales.map((l) => {
            const t = initialData?.translations[l];
            return [l, t ? { title: t.title, excerpt: t.excerpt } : undefined];
          }),
        ) as Partial<Record<Locale, { title: string; excerpt: string }>>,
        { title: "", excerpt: "" },
      ),
    },
  });

  const featured = watch("featured");
  const status = watch("status");
  const coverImageUrl = watch("coverImageUrl");
  const slug = watch("slug");
  const translations = watch("translations");

  const { restore, clear, lastSavedAt } = usePostAutosave(
    storageKey,
    () => {
      const tagsField = (
        document.getElementById("tagSlugs") as HTMLInputElement | null
      )?.value;

      const snapshotTranslations: PostAutosaveSnapshot["translations"] = {};
      for (const locale of routing.locales) {
        const fields = translations[locale];
        const json =
          editorRefs.current[locale]?.getContent().json ?? EMPTY_TIPTAP_DOC;
        const isDefault = locale === routing.defaultLocale;
        const candidate = {
          title: fields?.title ?? "",
          excerpt: fields?.excerpt ?? "",
          contentJson: json,
        };
        if (isDefault || !isTranslationEmpty(candidate)) {
          snapshotTranslations[locale] = candidate;
        }
      }

      return {
        slug: slug ?? "",
        coverImageUrl: coverImageUrl ?? "",
        translations: snapshotTranslations,
        tagSlugs: (tagsField ?? "")
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        status,
        featured,
      };
    },
    isDirty || editorDirty,
  );

  useEffect(() => {
    const draft = restore();
    if (!draft) return;

    if (
      initialData?.updatedAt &&
      new Date(draft.savedAt) <= new Date(initialData.updatedAt)
    ) {
      clear();
      return;
    }

    setPendingDraft(draft);
  }, [restore, clear, initialData?.updatedAt]);

  function restoreDraft() {
    if (!pendingDraft) return;
    reset({
      slug: pendingDraft.slug,
      coverImageUrl: pendingDraft.coverImageUrl,
      status: pendingDraft.status,
      featured: pendingDraft.featured,
      publishedAt: initialData?.publishedAt ?? null,
      tagSlugs: pendingDraft.tagSlugs,
      translations: buildTranslationsRecord(
        Object.fromEntries(
          routing.locales.map((l) => {
            const t = pendingDraft.translations[l];
            return [l, t ? { title: t.title, excerpt: t.excerpt } : undefined];
          }),
        ) as Partial<Record<Locale, { title: string; excerpt: string }>>,
        { title: "", excerpt: "" },
      ),
    });
    const tagInput = document.getElementById("tagSlugs") as HTMLInputElement;
    if (tagInput) {
      tagInput.value = pendingDraft.tagSlugs.join(", ");
    }
    setEditorContent(
      buildTranslationsRecord<TiptapJSON>(
        Object.fromEntries(
          routing.locales.map((l) => [
            l,
            pendingDraft.translations[l]?.contentJson as TiptapJSON | undefined,
          ]),
        ) as Partial<Record<Locale, TiptapJSON>>,
        EMPTY_TIPTAP_DOC,
      ),
    );
    setEditorDirty(true);
    setEditorKeys(
      (prev) =>
        Object.fromEntries(
          routing.locales.map((l) => [l, (prev[l] ?? 0) + 1]),
        ) as Record<Locale, number>,
    );
    setPendingDraft(null);
  }

  function discardDraft() {
    clear();
    setPendingDraft(null);
  }

  function onTitleBlur(locale: Locale, e: React.FocusEvent<HTMLInputElement>) {
    if (locale !== routing.defaultLocale) return;
    const currentSlug = watch("slug");
    if (!currentSlug?.trim()) {
      setValue("slug", slugify(e.target.value));
    }
  }

  function getEditorContent(locale: Locale) {
    return (
      editorRefs.current[locale]?.getContent() ?? {
        json: EMPTY_TIPTAP_DOC,
        html: "",
      }
    );
  }

  function buildTranslationsPayload(
    data: PostFormInput,
  ): PostFormData["translations"] {
    const payload: Record<string, unknown> = {};

    for (const locale of routing.locales) {
      const fields = data.translations[locale];
      const editor = getEditorContent(locale);
      const isDefault = locale === routing.defaultLocale;

      const candidate = {
        title: fields?.title ?? "",
        excerpt: fields?.excerpt ?? "",
        contentJson: editor.json,
        contentHtml: editor.html,
      };

      if (isDefault || !isTranslationEmpty(candidate)) {
        payload[locale] = candidate;
      }
    }

    return payload as PostFormData["translations"];
  }

  function onSubmit(data: PostFormInput) {
    const tagsField = (
      document.getElementById("tagSlugs") as HTMLInputElement | null
    )?.value;

    const payload: PostFormData = {
      slug: data.slug,
      coverImageUrl: data.coverImageUrl,
      status: data.status,
      featured: data.featured,
      publishedAt: data.publishedAt,
      tagSlugs: (tagsField ?? "")
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      translations: buildTranslationsPayload(data),
    };

    const parsed = postSchema.safeParse(payload);
    if (!parsed.success) {
      const message =
        parsed.error.issues.find((i) => i.path.includes("content"))?.message ??
        parsed.error.issues[0]?.message ??
        "Validation failed";
      setError(message);
      return;
    }

    setError(null);
    startTransition(async () => {
      try {
        if (isEditing) {
          await updatePost(initialData.id, parsed.data);
        } else {
          await createPost(parsed.data);
        }
      } catch (e) {
        if (isRedirectError(e)) {
          clear();
          throw e;
        }
        setError(e instanceof Error ? e.message : "Failed to save post");
      }
    });
  }

  const defaultTags = initialData?.tags.map((t) => t.name).join(", ") ?? "";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {pendingDraft && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm">
          <span>
            Draft from {formatTimeAgo(pendingDraft.savedAt)} available
          </span>
          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={restoreDraft}
            >
              Restore
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={discardDraft}
            >
              Discard
            </Button>
          </div>
        </div>
      )}

      {error && (
        <p className="rounded-md border border-destructive/50 bg-destructive/10 px-4 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Content</CardTitle>
        </CardHeader>
        <CardContent>
          <LocaleTabs>
            {(locale) => (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor={`title-${locale}`}>Title</Label>
                  <Input
                    id={`title-${locale}`}
                    placeholder="Post title"
                    {...register(`translations.${locale}.title`)}
                    onBlur={(e) => onTitleBlur(locale, e)}
                  />
                  {errors.translations?.[locale]?.title && (
                    <p className="text-sm text-red-500">
                      {errors.translations[locale]?.title?.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`excerpt-${locale}`}>Excerpt</Label>
                  <Textarea
                    id={`excerpt-${locale}`}
                    placeholder="Short summary for cards and SEO (max 500 chars)"
                    rows={3}
                    {...register(`translations.${locale}.excerpt`)}
                  />
                  {errors.translations?.[locale]?.excerpt && (
                    <p className="text-sm text-red-500">
                      {errors.translations[locale]?.excerpt?.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Body</Label>
                  <TiptapEditor
                    key={editorKeys[locale] ?? 0}
                    ref={(instance) => {
                      editorRefs.current[locale] = instance;
                    }}
                    initialContent={editorContent[locale] ?? EMPTY_TIPTAP_DOC}
                    availableImages={availableImages}
                    onUpdate={() => setEditorDirty(true)}
                  />
                </div>
              </div>
            )}
          </LocaleTabs>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Post details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="slug">Slug</Label>
            <Input id="slug" placeholder="post-slug" {...register("slug")} />
            {errors.slug && (
              <p className="text-sm text-red-500">{errors.slug.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="coverImageUrl">Cover image URL</Label>
            <Input
              id="coverImageUrl"
              placeholder="https://... or pick below"
              {...register("coverImageUrl")}
            />
            <CoverImagePicker
              images={availableImages}
              selectedUrl={coverImageUrl ?? ""}
              onSelect={(url) =>
                setValue("coverImageUrl", url, { shouldDirty: true })
              }
            />
            {coverImageUrl && (
              <div className="relative mt-2 aspect-[4/3] w-48 overflow-hidden rounded-md border">
                <Image
                  src={coverImageUrl}
                  alt="Cover preview"
                  fill
                  className="object-cover"
                  sizes="200px"
                />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="tagSlugs">Tags (comma-separated)</Label>
            <Input
              id="tagSlugs"
              placeholder="react, nextjs, typescript"
              defaultValue={defaultTags}
              onChange={(e) => {
                const tags = e.target.value
                  .split(",")
                  .map((t) => t.trim())
                  .filter(Boolean);
                setValue("tagSlugs", tags, { shouldDirty: true });
              }}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                value={status}
                onChange={(e) =>
                  setValue("status", e.target.value as "draft" | "published", {
                    shouldDirty: true,
                  })
                }
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="publishedAt">Published date</Label>
              <Input
                id="publishedAt"
                type="date"
                defaultValue={
                  initialData?.publishedAt
                    ? initialData.publishedAt.toISOString().split("T")[0]
                    : ""
                }
                onChange={(e) =>
                  setValue(
                    "publishedAt",
                    e.target.value ? new Date(e.target.value) : null,
                    { shouldDirty: true },
                  )
                }
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Switch
              id="featured"
              checked={featured}
              onCheckedChange={(checked) =>
                setValue("featured", !!checked, { shouldDirty: true })
              }
            />
            <Label htmlFor="featured">Featured post (hero on blog index)</Label>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : isEditing ? "Update Post" : "Create Post"}
        </Button>
        <a
          href="/admin/posts"
          className={buttonVariants({ variant: "outline" })}
        >
          Cancel
        </a>
        {lastSavedAt && isDirty && (
          <span className="text-xs text-muted-foreground">
            Saved {formatTimeAgo(lastSavedAt.toISOString())}
          </span>
        )}
      </div>
    </form>
  );
}
