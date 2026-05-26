"use client";

import { IconCheck, IconPhoto, IconStar, IconX } from "@tabler/icons-react";
import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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

  function toggleImage(id: string) {
    setLocalSelection((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  }

  function handleConfirm() {
    onSelectionChange(localSelection);
    setOpen(false);
  }

  const selectedImages = allImages.filter((img) =>
    selectedIds.includes(img.id),
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">Gallery Images</label>
        <Dialog
          open={open}
          onOpenChange={(v) => {
            setOpen(v);
            if (v) setLocalSelection(selectedIds);
          }}
        >
          <DialogTrigger
            render={<Button type="button" variant="outline" size="sm" />}
          >
            <IconPhoto className="size-4" />
            Select Images
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Select Gallery Images</DialogTitle>
            </DialogHeader>
            {allImages.length === 0 ? (
              <p className="py-8 text-center text-sm text-zinc-500">
                No images available. Upload images in the Images section first.
              </p>
            ) : (
              <div className="grid max-h-96 grid-cols-3 gap-2 overflow-y-auto">
                {allImages.map((img) => {
                  const isSelected = localSelection.includes(img.id);
                  return (
                    <button
                      key={img.id}
                      type="button"
                      onClick={() => toggleImage(img.id)}
                      className={cn(
                        "relative aspect-video overflow-hidden rounded-md border-2 transition-colors",
                        isSelected
                          ? "border-primary"
                          : "border-transparent hover:border-zinc-300",
                      )}
                    >
                      <Image
                        src={img.url}
                        alt={img.alt || ""}
                        fill
                        className="object-cover"
                        sizes="200px"
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
        <div className="grid grid-cols-4 gap-2">
          {selectedImages.map((img) => (
            <div
              key={img.id}
              className="group relative aspect-video overflow-hidden rounded-md border"
            >
              <Image
                src={img.url}
                alt={img.alt || ""}
                fill
                className="object-cover"
                sizes="150px"
              />
              <div className="absolute inset-0 flex items-start justify-between bg-black/0 p-1 opacity-0 transition-opacity group-hover:bg-black/20 group-hover:opacity-100">
                <button
                  type="button"
                  onClick={() => onThumbnailChange(img.url)}
                  className={cn(
                    "rounded-full p-0.5",
                    thumbnailUrl === img.url
                      ? "bg-yellow-400 text-white"
                      : "bg-background/80 text-foreground backdrop-blur-sm hover:bg-yellow-400 hover:text-white",
                  )}
                  title="Set as thumbnail"
                >
                  <IconStar className="size-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    onSelectionChange(selectedIds.filter((id) => id !== img.id))
                  }
                  className="rounded-full bg-background/80 p-0.5 text-foreground backdrop-blur-sm hover:bg-red-500 hover:text-white"
                  title="Remove from gallery"
                >
                  <IconX className="size-3.5" />
                </button>
              </div>
              {thumbnailUrl === img.url && (
                <div className="absolute bottom-1 left-1">
                  <span className="rounded bg-yellow-400 px-1.5 py-0.5 text-[10px] font-medium text-white">
                    Thumbnail
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
