"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface AvailableImage {
  id: string;
  url: string;
  alt: string | null;
}

interface CoverImagePickerProps {
  images: AvailableImage[];
  selectedUrl: string;
  onSelect: (url: string) => void;
  /** How many newest images to show as quick-pick thumbnails. */
  recentCount?: number;
}

export function CoverImagePicker({
  images,
  selectedUrl,
  onSelect,
  recentCount = 8,
}: CoverImagePickerProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const recent = images.slice(0, recentCount);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return images;
    return images.filter(
      (img) =>
        img.alt?.toLowerCase().includes(q) || img.url.toLowerCase().includes(q),
    );
  }, [images, query]);

  if (images.length === 0) return null;

  return (
    <div className="space-y-2 pt-2">
      <div className="flex flex-wrap items-center gap-2">
        {recent.map((img) => (
          <button
            key={img.id}
            type="button"
            onClick={() => onSelect(img.url)}
            aria-pressed={selectedUrl === img.url}
            className={`relative size-16 overflow-hidden rounded-md border hover:ring-2 hover:ring-primary ${
              selectedUrl === img.url ? "ring-2 ring-primary" : ""
            }`}
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
        {images.length > recentCount && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-16"
            onClick={() => setOpen(true)}
          >
            Browse all ({images.length})
          </Button>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Choose cover image</DialogTitle>
          </DialogHeader>
          <Input
            type="search"
            placeholder="Search by alt text or filename..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
          {filtered.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No images match “{query}”.
            </p>
          ) : (
            <div className="grid max-h-[60vh] grid-cols-3 gap-2 overflow-y-auto sm:grid-cols-4">
              {filtered.map((img) => (
                <button
                  key={img.id}
                  type="button"
                  onClick={() => {
                    onSelect(img.url);
                    setOpen(false);
                  }}
                  aria-pressed={selectedUrl === img.url}
                  title={img.alt ?? img.url}
                  className={`relative aspect-square overflow-hidden rounded-md border hover:ring-2 hover:ring-primary ${
                    selectedUrl === img.url ? "ring-2 ring-primary" : ""
                  }`}
                >
                  <Image
                    src={img.url}
                    alt={img.alt ?? ""}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 33vw, 160px"
                  />
                </button>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
