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
import type { Locale } from "@/i18n/routing";
import type { TiptapJSON } from "@/lib/db/schema";
import { isTranslationEmpty } from "@/lib/i18n/translation-utils";
import type { PostEditTranslations } from "@/lib/queries/post";
import {
  type PostFormData,
  type PostFormInput,
  postFormSchema,
  postSchema,
} from "@/lib/validators/post";
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
  const [editorKeys, setEditorKeys] = useState<Partial<Record<Locale, number>>>(
    { en: 0, fr: 0 },
  );
  const [editorContent, setEditorContent] = useState<
    Partial<Record<Locale, TiptapJSON>>
  >({
    en:
      (initialData?.translations.en.contentJson as TiptapJSON) ??
      EMPTY_TIPTAP_DOC,
    fr:
      (initialData?.translations.fr?.contentJson as TiptapJSON) ??
      EMPTY_TIPTAP_DOC,
  });
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
      translations: {
        en: {
          title: initialData?.translations.en.title ?? "",
          excerpt: initialData?.translations.en.excerpt ?? "",
        },
        fr: {
          title: initialData?.translations.fr?.title ?? "",
          excerpt: initialData?.translations.fr?.excerpt ?? "",
        },
      },
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

      const snapshotTranslations: PostAutosaveSnapshot["translations"] = {
        en: {
          title: translations.en.title,
          excerpt: translations.en.excerpt,
          contentJson:
            editorRefs.current.en?.getContent().json ?? EMPTY_TIPTAP_DOC,
        },
      };

      const frFields = translations.fr;
      const frContent = editorRefs.current.fr?.getContent().json;
      if (
        frFields &&
        !isTranslationEmpty({
          title: frFields.title,
          excerpt: frFields.excerpt,
          contentJson: frContent,
        })
      ) {
        snapshotTranslations.fr = {
          title: frFields.title,
          excerpt: frFields.excerpt,
          contentJson: frContent ?? EMPTY_TIPTAP_DOC,
        };
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
      translations: {
        en: {
          title: pendingDraft.translations.en.title,
          excerpt: pendingDraft.translations.en.excerpt,
        },
        fr: pendingDraft.translations.fr
          ? {
              title: pendingDraft.translations.fr.title,
              excerpt: pendingDraft.translations.fr.excerpt,
            }
          : { title: "", excerpt: "" },
      },
    });
    const tagInput = document.getElementById("tagSlugs") as HTMLInputElement;
    if (tagInput) {
      tagInput.value = pendingDraft.tagSlugs.join(", ");
    }
    setEditorContent({
      en: pendingDraft.translations.en.contentJson as TiptapJSON,
      fr:
        (pendingDraft.translations.fr?.contentJson as TiptapJSON) ??
        EMPTY_TIPTAP_DOC,
    });
    setEditorDirty(true);
    setEditorKeys((prev) => ({
      en: (prev.en ?? 0) + 1,
      fr: (prev.fr ?? 0) + 1,
    }));
    setPendingDraft(null);
  }

  function discardDraft() {
    clear();
    setPendingDraft(null);
  }

  function onTitleBlur(locale: Locale, e: React.FocusEvent<HTMLInputElement>) {
    if (locale !== "en") return;
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
    const enContent = getEditorContent("en");
    const payload: PostFormData["translations"] = {
      en: {
        ...data.translations.en,
        contentJson:
          enContent.json as PostFormData["translations"]["en"]["contentJson"],
        contentHtml: enContent.html,
      },
    };

    const frFields = data.translations.fr;
    const frContent = getEditorContent("fr");
    if (
      frFields &&
      !isTranslationEmpty({
        title: frFields.title,
        excerpt: frFields.excerpt,
        contentJson: frContent.json,
      })
    ) {
      payload.fr = {
        ...frFields,
        contentJson: frContent.json as NonNullable<
          PostFormData["translations"]["fr"]
        >["contentJson"],
        contentHtml: frContent.html,
      };
    }

    return payload;
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
            {availableImages.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {availableImages.slice(0, 8).map((img) => (
                  <button
                    key={img.id}
                    type="button"
                    onClick={() => setValue("coverImageUrl", img.url)}
                    className="relative size-16 overflow-hidden rounded-md border hover:ring-2 hover:ring-primary"
                  >
                    <Image
                      src={img.url}
                      alt={img.alt ?? ""}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  </button>
                ))}
              </div>
            )}
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
