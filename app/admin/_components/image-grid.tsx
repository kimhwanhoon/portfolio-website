"use client";

import { IconMaximize, IconTrash } from "@tabler/icons-react";
import Image from "next/image";
import { useState } from "react";
import Lightbox, { type Slide } from "yet-another-react-lightbox";
import Captions from "yet-another-react-lightbox/plugins/captions";
import Counter from "yet-another-react-lightbox/plugins/counter";
import Fullscreen from "yet-another-react-lightbox/plugins/fullscreen";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/captions.css";
import "yet-another-react-lightbox/plugins/counter.css";
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
  const [lightboxIndex, setLightboxIndex] = useState(-1);

  const slides: Slide[] = images.map((img) => ({
    src: img.url,
    alt: img.alt ?? undefined,
    width: img.width ?? undefined,
    height: img.height ?? undefined,
    ...(img.alt ? { description: img.alt } : {}),
  }));

  if (images.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12">
        <p className="text-sm text-muted-foreground">No images uploaded yet.</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {images.map((image, index) => (
          <div
            key={image.id}
            className="group relative overflow-hidden rounded-lg border bg-muted"
          >
            <button
              type="button"
              onClick={() => setLightboxIndex(index)}
              aria-label={`View ${image.alt || "image"} full size`}
              className="relative block aspect-video w-full cursor-zoom-in"
            >
              <Image
                src={image.url}
                alt={image.alt || "Uploaded image"}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />
              <span className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/0 text-white opacity-0 transition-all duration-200 group-hover:bg-black/30 group-hover:opacity-100">
                <IconMaximize className="size-6 drop-shadow" />
              </span>
            </button>
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

      <Lightbox
        open={lightboxIndex >= 0}
        close={() => setLightboxIndex(-1)}
        index={lightboxIndex < 0 ? 0 : lightboxIndex}
        slides={slides}
        on={{ view: ({ index }) => setLightboxIndex(index) }}
        plugins={[Zoom, Fullscreen, Counter, Captions]}
        // Don't lock <body> scroll: this app scrolls on window, and YARL's
        // `height:100%;overflow:hidden` body lock resets scroll to top on close.
        noScroll={{ disabled: true }}
        counter={{ container: { style: { top: "unset", bottom: 0 } } }}
        zoom={{ maxZoomPixelRatio: 3 }}
        captions={{ showToggle: true, descriptionTextAlign: "center" }}
        styles={{ container: { backgroundColor: "rgba(0, 0, 0, .92)" } }}
        render={{
          slide: ({ slide, rect }) => {
            if (!slide.width || !slide.height) return undefined;
            const width = Math.round(
              Math.min(rect.width, (rect.height / slide.height) * slide.width),
            );
            const height = Math.round(
              Math.min(rect.height, (rect.width / slide.width) * slide.height),
            );
            return (
              <div style={{ position: "relative", width, height }}>
                <Image
                  src={slide.src}
                  alt={slide.alt || ""}
                  fill
                  loading="eager"
                  draggable={false}
                  className="object-contain"
                  sizes={`${Math.ceil((width / 1920) * 100)}vw`}
                />
              </div>
            );
          },
        }}
      />
    </>
  );
}
