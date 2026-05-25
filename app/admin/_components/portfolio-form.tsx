"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  portfolioSchema,
  type PortfolioFormData,
} from "@/lib/validators/portfolio";
import { createPortfolio, updatePortfolio } from "@/app/actions/portfolio";
import { assignImagesToPortfolio } from "@/app/actions/images";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImagePicker } from "./image-picker";

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
    title: string;
    slug: string;
    shortDescription: string;
    fullDescription: string;
    thumbnailUrl: string | null;
    techStack: string[] | null;
    liveUrl: string | null;
    githubUrl: string | null;
    featured: boolean;
    sortOrder: number;
    status: "draft" | "published";
    startDate: Date | null;
    endDate: Date | null;
  };
  allImages?: AvailableImage[];
  initialImageIds?: string[];
}

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
  } = useForm<PortfolioFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(portfolioSchema) as any,
    defaultValues: {
      title: initialData?.title ?? "",
      slug: initialData?.slug ?? "",
      shortDescription: initialData?.shortDescription ?? "",
      fullDescription: initialData?.fullDescription ?? "",
      thumbnailUrl: initialData?.thumbnailUrl ?? "",
      techStack: initialData?.techStack ?? [],
      liveUrl: initialData?.liveUrl ?? "",
      githubUrl: initialData?.githubUrl ?? "",
      featured: initialData?.featured ?? false,
      sortOrder: initialData?.sortOrder ?? 0,
      status: initialData?.status ?? "draft",
      startDate: initialData?.startDate ?? null,
      endDate: initialData?.endDate ?? null,
    },
  });

  const featured = watch("featured");
  const status = watch("status");

  function onTitleBlur(e: React.FocusEvent<HTMLInputElement>) {
    const currentSlug = watch("slug");
    if (!currentSlug || !isEditing) {
      setValue("slug", slugify(e.target.value));
    }
  }

  function onSubmit(data: PortfolioFormData) {
    startTransition(async () => {
      if (isEditing) {
        await updatePortfolio(initialData.id, data);
        if (selectedImageIds.length > 0) {
          await assignImagesToPortfolio(selectedImageIds, initialData.id);
        }
      } else {
        // For new items, images are assigned after creation via redirect
        await createPortfolio(data);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="Project name"
              {...register("title")}
              onBlur={onTitleBlur}
            />
            {errors.title && (
              <p className="text-sm text-red-500">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">Slug</Label>
            <Input
              id="slug"
              placeholder="project-name"
              {...register("slug")}
            />
            {errors.slug && (
              <p className="text-sm text-red-500">{errors.slug.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="shortDescription">Short Description</Label>
            <Textarea
              id="shortDescription"
              placeholder="Brief description for the card (max 300 chars)"
              rows={2}
              {...register("shortDescription")}
            />
            {errors.shortDescription && (
              <p className="text-sm text-red-500">
                {errors.shortDescription.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="fullDescription">Full Description (Markdown)</Label>
            <Textarea
              id="fullDescription"
              placeholder="Detailed project description. Supports Markdown."
              rows={10}
              {...register("fullDescription")}
            />
            {errors.fullDescription && (
              <p className="text-sm text-red-500">
                {errors.fullDescription.message}
              </p>
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
                <p className="text-sm text-red-500">
                  {errors.liveUrl.message}
                </p>
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

      {isEditing && allImages.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Images</CardTitle>
          </CardHeader>
          <CardContent>
            <ImagePicker
              allImages={allImages}
              selectedIds={selectedImageIds}
              thumbnailUrl={watch("thumbnailUrl") || ""}
              onSelectionChange={setSelectedImageIds}
              onThumbnailChange={(url) => setValue("thumbnailUrl", url)}
            />
          </CardContent>
        </Card>
      )}

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
                    e.target.value ? new Date(e.target.value) : null
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
                    e.target.value ? new Date(e.target.value) : null
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
