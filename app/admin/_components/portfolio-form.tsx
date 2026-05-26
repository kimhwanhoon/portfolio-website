"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { createPortfolio, updatePortfolio } from "@/app/actions/portfolio";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { type Locale, routing } from "@/i18n/routing";
import {
  buildTranslationsRecord,
  translationEntries,
} from "@/lib/i18n/translation-utils";
import type { PortfolioEditTranslations } from "@/lib/queries/portfolio";
import {
  type PortfolioFormData,
  type PortfolioFormInput,
  portfolioFormSchema,
} from "@/lib/validators/portfolio";
import { ImagePicker } from "./image-picker";
import { LocaleTabs } from "./locale-tabs";

interface AvailableImage {
  id: string;
  url: string;
  alt: string | null;
  width: number | null;
  height: number | null;
}

interface PortfolioFormProps {
  initialData?: {
    id: string;
    slug: string;
    thumbnailUrl: string | null;
    techStack: string[] | null;
    liveUrl: string | null;
    githubUrl: string | null;
    featured: boolean;
    sortOrder: number;
    status: "draft" | "published";
    startDate: Date | null;
    endDate: Date | null;
    translations: PortfolioEditTranslations;
  };
  allImages?: AvailableImage[];
  initialImageIds?: string[];
}

const emptyTranslation = {
  title: "",
  shortDescription: "",
  fullDescription: "",
};

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export function PortfolioForm({
  initialData,
  allImages = [],
  initialImageIds = [],
}: PortfolioFormProps) {
  const [isPending, startTransition] = useTransition();
  const isEditing = !!initialData;
  const [selectedImageIds, setSelectedImageIds] =
    useState<string[]>(initialImageIds);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PortfolioFormInput>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(portfolioFormSchema) as any,
    defaultValues: {
      slug: initialData?.slug ?? "",
      thumbnailUrl: initialData?.thumbnailUrl ?? "",
      techStack: initialData?.techStack ?? [],
      liveUrl: initialData?.liveUrl ?? "",
      githubUrl: initialData?.githubUrl ?? "",
      featured: initialData?.featured ?? false,
      sortOrder: initialData?.sortOrder ?? 0,
      status: initialData?.status ?? "draft",
      startDate: initialData?.startDate ?? null,
      endDate: initialData?.endDate ?? null,
      translations: buildTranslationsRecord(
        initialData?.translations,
        emptyTranslation,
      ),
    },
  });

  const featured = watch("featured");
  const status = watch("status");
  const thumbnailUrl = watch("thumbnailUrl");

  function onTitleBlur(locale: Locale, e: React.FocusEvent<HTMLInputElement>) {
    if (locale !== routing.defaultLocale) return;
    const currentSlug = watch("slug");
    if (!currentSlug || !isEditing) {
      setValue("slug", slugify(e.target.value));
    }
  }

  function onSubmit(data: PortfolioFormInput) {
    const translationsPayload = Object.fromEntries(
      translationEntries(data.translations),
    ) as PortfolioFormData["translations"];

    const payload: PortfolioFormData = {
      ...data,
      translations: translationsPayload,
    };

    startTransition(async () => {
      if (isEditing) {
        await updatePortfolio(initialData.id, payload, selectedImageIds);
      } else {
        await createPortfolio(payload, selectedImageIds);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
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
                    placeholder="Project name"
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
                  <Label htmlFor={`shortDescription-${locale}`}>
                    Short Description
                  </Label>
                  <Textarea
                    id={`shortDescription-${locale}`}
                    placeholder="Brief description for the card (max 300 chars)"
                    rows={2}
                    {...register(`translations.${locale}.shortDescription`)}
                  />
                  {errors.translations?.[locale]?.shortDescription && (
                    <p className="text-sm text-red-500">
                      {errors.translations[locale]?.shortDescription?.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`fullDescription-${locale}`}>
                    Full Description (Markdown)
                  </Label>
                  <Textarea
                    id={`fullDescription-${locale}`}
                    placeholder="Detailed project description. Supports Markdown."
                    rows={10}
                    {...register(`translations.${locale}.fullDescription`)}
                  />
                  {errors.translations?.[locale]?.fullDescription && (
                    <p className="text-sm text-red-500">
                      {errors.translations[locale]?.fullDescription?.message}
                    </p>
                  )}
                </div>
              </div>
            )}
          </LocaleTabs>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="slug">Slug</Label>
            <Input id="slug" placeholder="project-name" {...register("slug")} />
            {errors.slug && (
              <p className="text-sm text-red-500">{errors.slug.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="thumbnailUrl">Thumbnail URL</Label>
            <Input
              id="thumbnailUrl"
              placeholder="https://... (or pick from gallery below)"
              {...register("thumbnailUrl")}
            />
            {errors.thumbnailUrl && (
              <p className="text-sm text-red-500">
                {errors.thumbnailUrl.message}
              </p>
            )}
            {thumbnailUrl && (
              <div className="relative mt-2 aspect-video w-48 overflow-hidden rounded-md border">
                <Image
                  src={thumbnailUrl}
                  alt="Thumbnail preview"
                  fill
                  className="object-cover"
                  sizes="200px"
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tech & Links</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="techStack">Tech Stack (comma-separated)</Label>
            <Input
              id="techStack"
              placeholder="React, TypeScript, Tailwind CSS"
              defaultValue={initialData?.techStack?.join(", ") ?? ""}
              onChange={(e) => {
                const tags = e.target.value
                  .split(",")
                  .map((t) => t.trim())
                  .filter(Boolean);
                setValue("techStack", tags);
              }}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="liveUrl">Live URL</Label>
              <Input
                id="liveUrl"
                placeholder="https://example.com"
                {...register("liveUrl")}
              />
              {errors.liveUrl && (
                <p className="text-sm text-red-500">{errors.liveUrl.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="githubUrl">GitHub URL</Label>
              <Input
                id="githubUrl"
                placeholder="https://github.com/..."
                {...register("githubUrl")}
              />
              {errors.githubUrl && (
                <p className="text-sm text-red-500">
                  {errors.githubUrl.message}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Images</CardTitle>
        </CardHeader>
        <CardContent>
          {allImages.length > 0 ? (
            <ImagePicker
              allImages={allImages}
              selectedIds={selectedImageIds}
              thumbnailUrl={thumbnailUrl || ""}
              onSelectionChange={setSelectedImageIds}
              onThumbnailChange={(url) => setValue("thumbnailUrl", url)}
            />
          ) : (
            <p className="text-sm text-zinc-500">
              No images available yet. Upload images in the{" "}
              <a href="/admin/images" className="underline">
                Images
              </a>{" "}
              section, then return here to attach them.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sortOrder">Sort Order</Label>
              <Input
                id="sortOrder"
                type="number"
                {...register("sortOrder", { valueAsNumber: true })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                value={status}
                onChange={(e) =>
                  setValue("status", e.target.value as "draft" | "published")
                }
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Switch
              id="featured"
              checked={featured}
              onCheckedChange={(checked) => setValue("featured", !!checked)}
            />
            <Label htmlFor="featured">Featured project</Label>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                defaultValue={
                  initialData?.startDate
                    ? initialData.startDate.toISOString().split("T")[0]
                    : ""
                }
                onChange={(e) =>
                  setValue(
                    "startDate",
                    e.target.value ? new Date(e.target.value) : null,
                  )
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                defaultValue={
                  initialData?.endDate
                    ? initialData.endDate.toISOString().split("T")[0]
                    : ""
                }
                onChange={(e) =>
                  setValue(
                    "endDate",
                    e.target.value ? new Date(e.target.value) : null,
                  )
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending
            ? "Saving..."
            : isEditing
              ? "Update Portfolio Item"
              : "Create Portfolio Item"}
        </Button>
        <a href="/admin" className={buttonVariants({ variant: "outline" })}>
          Cancel
        </a>
      </div>
    </form>
  );
}
