"use client";

import { IconTrash } from "@tabler/icons-react";
import Image from "next/image";
import { deleteImage } from "@/app/actions/images";
import { Badge } from "@/components/ui/badge";
import { AltEditDialog } from "./alt-edit-dialog";
import { DeleteDialog } from "./delete-dialog";

interface ImageItem {
  id: string;
  url: string;
  width: number | null;
  height: number | null;
  fileSize: number | null;
  portfolioId: string | null;
  createdAt: Date;
  alt: string | null;
}

interface ImageGridProps {
  images: ImageItem[];
}

function formatFileSize(bytes: number | null): string {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function ImageGrid({ images }: ImageGridProps) {
  if (images.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12">
        <p className="text-sm text-muted-foreground">No images uploaded yet.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {images.map((image) => (
        <div
          key={image.id}
          className="group relative overflow-hidden rounded-lg border bg-muted"
        >
          <div className="relative aspect-video">
            <Image
              src={image.url}
              alt={image.alt || "Uploaded image"}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          </div>
          <div className="space-y-1.5 p-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {formatFileSize(image.fileSize)}
              </span>
              {image.portfolioId && (
                <Badge variant="secondary" className="text-xs">
                  Linked
                </Badge>
              )}
            </div>
            <p
              className={`line-clamp-2 min-h-9 text-xs ${
                image.alt ? "text-foreground" : "text-muted-foreground italic"
              }`}
              title={image.alt ?? undefined}
            >
              {image.alt || "No alt text"}
            </p>
            <div className="flex items-center justify-end gap-1">
              <AltEditDialog
                imageId={image.id}
                currentAlt={image.alt}
                triggerClassName="opacity-0 transition-opacity group-hover:opacity-100"
              />
              <DeleteDialog
                title="Delete image"
                description="Are you sure you want to delete this image? This action cannot be undone."
                onConfirm={() => deleteImage(image.id)}
                triggerLabel={<IconTrash className="size-3.5" />}
                triggerSize="icon-xs"
                triggerClassName="opacity-0 transition-opacity group-hover:opacity-100"
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
