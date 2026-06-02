"use client";

import {
  IconCheck,
  IconChevronLeft,
  IconChevronRight,
  IconPhoto,
  IconStar,
  IconX,
} from "@tabler/icons-react";
import Image from "next/image";
import { useState } from "react";
import Lightbox, { type Slide } from "yet-another-react-lightbox";
import Counter from "yet-another-react-lightbox/plugins/counter";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/counter.css";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface ImageItem {
  id: string;
  url: string;
  alt: string | null;
  width: number | null;
  height: number | null;
}

interface ImagePickerProps {
  allImages: ImageItem[];
  selectedIds: string[];
  thumbnailUrl: string;
  onSelectionChange: (ids: string[]) => void;
  onThumbnailChange: (url: string) => void;
}

export function ImagePicker({
  allImages,
  selectedIds,
  thumbnailUrl,
  onSelectionChange,
  onThumbnailChange,
}: ImagePickerProps) {
  const [open, setOpen] = useState(false);
  const [localSelection, setLocalSelection] = useState<string[]>(selectedIds);
  const [lightboxIndex, setLightboxIndex] = useState(-1);
  const [query, setQuery] = useState("");

  const normalizedQuery = query.trim().toLowerCase();
  const filteredImages = normalizedQuery
    ? allImages.filter((img) =>
        (img.alt ?? "").toLowerCase().includes(normalizedQuery),
      )
    : allImages;

  function toggleImage(id: string) {
    setLocalSelection((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  }

  function handleConfirm() {
    onSelectionChange(localSelection);
    setOpen(false);
  }

  // Resolve in selection order so the array order == gallery sort order.
  const selectedImages = selectedIds
    .map((id) => allImages.find((img) => img.id === id))
    .filter((img): img is ImageItem => Boolean(img));

  function moveImage(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= selectedIds.length) return;
    const next = [...selectedIds];
    [next[index], next[target]] = [next[target], next[index]];
    onSelectionChange(next);
  }

  function removeImage(id: string) {
    onSelectionChange(selectedIds.filter((i) => i !== id));
  }

  const slides: Slide[] = selectedImages.map((img) => ({
    src: img.url,
    alt: img.alt ?? undefined,
    width: img.width ?? undefined,
    height: img.height ?? undefined,
    ...(img.alt ? { description: img.alt } : {}),
  }));

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">Gallery Images</label>
        <Dialog
          open={open}
          onOpenChange={(v) => {
            setOpen(v);
            if (v) {
              setLocalSelection(selectedIds);
              setQuery("");
            }
          }}
        >
          <DialogTrigger
            render={<Button type="button" variant="outline" size="sm" />}
          >
            <IconPhoto className="size-4" />
            Select Images
          </DialogTrigger>
          <DialogContent className="max-w-[min(90vw,72rem)] sm:max-w-[min(90vw,72rem)]">
            <DialogHeader>
              <DialogTitle>Select Gallery Images</DialogTitle>
            </DialogHeader>
            {allImages.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No images available. Upload images in the Images section first.
              </p>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <Input
                    type="search"
                    placeholder="Search by alt text…"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="h-8"
                  />
                  <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                    {filteredImages.length} / {allImages.length}
                  </span>
                </div>
                {filteredImages.length === 0 ? (
                  <p className="py-8 text-center text-sm text-muted-foreground">
                    No images match &ldquo;{query}&rdquo;.
                  </p>
                ) : (
                  <div className="grid max-h-[60vh] grid-cols-2 gap-2 overflow-y-auto sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                    {filteredImages.map((img) => {
                      const isSelected = localSelection.includes(img.id);
                      return (
                        <button
                          key={img.id}
                          type="button"
                          onClick={() => toggleImage(img.id)}
                          className={cn(
                            "relative aspect-video overflow-hidden rounded-md border-2 bg-muted transition-colors",
                            isSelected
                              ? "border-primary"
                              : "border-transparent hover:border-muted-foreground/30",
                          )}
                        >
                          <Image
                            src={img.url}
                            alt={img.alt || ""}
                            fill
                            loading="lazy"
                            className="object-cover"
                            sizes="(max-width: 640px) 45vw, (max-width: 768px) 30vw, 200px"
                          />
                          {isSelected && (
                            <div className="absolute top-1 right-1 rounded-full bg-primary p-0.5 text-white">
                              <IconCheck className="size-3" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </>
            )}
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="button" onClick={handleConfirm}>
                Confirm ({localSelection.length} selected)
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {selectedImages.length > 0 && (
        <>
          <p className="text-xs text-muted-foreground">
            Click an image to preview. Use the arrows to reorder the gallery.
          </p>
          <div className="grid grid-cols-4 gap-2">
            {selectedImages.map((img, index) => {
              const isThumbnail = thumbnailUrl === img.url;
              const isFirst = index === 0;
              const isLast = index === selectedImages.length - 1;
              return (
                <div
                  key={img.id}
                  className="group relative aspect-video overflow-hidden rounded-md border bg-muted"
                >
                  {/* Image body opens the lightbox. Sibling (not parent) of the
                      control buttons to avoid nesting interactive elements. */}
                  <button
                    type="button"
                    onClick={() => setLightboxIndex(index)}
                    aria-label="Preview image"
                    className="absolute inset-0 cursor-zoom-in"
                  >
                    <Image
                      src={img.url}
                      alt={img.alt || ""}
                      fill
                      className="object-cover"
                      sizes="150px"
                    />
                  </button>

                  {/* Controls overlay: transparent to pointer events so empty
                      areas fall through to the image button; buttons re-enable. */}
                  <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity group-hover:bg-black/20 group-hover:opacity-100">
                    <div className="absolute top-1 right-1 left-1 flex items-start justify-between">
                      <button
                        type="button"
                        onClick={() => onThumbnailChange(img.url)}
                        className={cn(
                          "pointer-events-auto rounded-full p-0.5",
                          isThumbnail
                            ? "bg-yellow-400 text-white"
                            : "bg-background/80 text-foreground backdrop-blur-sm hover:bg-yellow-400 hover:text-white",
                        )}
                        title="Set as thumbnail"
                      >
                        <IconStar className="size-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeImage(img.id)}
                        className="pointer-events-auto rounded-full bg-background/80 p-0.5 text-foreground backdrop-blur-sm hover:bg-red-500 hover:text-white"
                        title="Remove from gallery"
                      >
                        <IconX className="size-3.5" />
                      </button>
                    </div>
                    <div className="absolute right-1 bottom-1 flex gap-1">
                      <button
                        type="button"
                        onClick={() => moveImage(index, -1)}
                        disabled={isFirst}
                        className="pointer-events-auto rounded-full bg-background/80 p-0.5 text-foreground backdrop-blur-sm hover:bg-foreground hover:text-background disabled:pointer-events-none disabled:opacity-30"
                        title="Move left"
                      >
                        <IconChevronLeft className="size-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveImage(index, 1)}
                        disabled={isLast}
                        className="pointer-events-auto rounded-full bg-background/80 p-0.5 text-foreground backdrop-blur-sm hover:bg-foreground hover:text-background disabled:pointer-events-none disabled:opacity-30"
                        title="Move right"
                      >
                        <IconChevronRight className="size-3.5" />
                      </button>
                    </div>
                  </div>

                  {isThumbnail && (
                    <div className="pointer-events-none absolute bottom-1 left-1">
                      <span className="rounded bg-yellow-400 px-1.5 py-0.5 text-[10px] font-medium text-white">
                        Thumbnail
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      <Lightbox
        open={lightboxIndex >= 0}
        close={() => setLightboxIndex(-1)}
        index={lightboxIndex < 0 ? 0 : lightboxIndex}
        slides={slides}
        on={{ view: ({ index }) => setLightboxIndex(index) }}
        plugins={[Zoom, Counter]}
        carousel={{ finite: selectedImages.length <= 1 }}
        counter={{ container: { style: { top: "unset", bottom: 0 } } }}
        zoom={{ maxZoomPixelRatio: 3 }}
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
    </div>
  );
}
