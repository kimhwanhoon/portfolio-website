"use client";

import { IconLoader2, IconUpload } from "@tabler/icons-react";
import { useCallback, useRef, useState, useTransition } from "react";
import { saveImageRecord } from "@/app/actions/images";
import { Button } from "@/components/ui/button";

export function ImageUpload() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const uploadFile = useCallback(async (file: File) => {
    setError(null);
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/images/upload", {
        method: "POST",
        body: formData,
      });

      const text = await res.text();
      let data: any;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(`Server error (${res.status}): ${text.slice(0, 200)}`);
      }

      if (!res.ok) {
        throw new Error(data.error || "Upload failed");
      }

      const { url, fileSize } = data;

      // Get image dimensions
      const img = new Image();
      img.src = url;
      await new Promise<void>((resolve) => {
        img.onload = () => resolve();
        img.onerror = () => resolve();
      });

      startTransition(async () => {
        await saveImageRecord({
          url,
          width: img.naturalWidth || undefined,
          height: img.naturalHeight || undefined,
          fileSize,
        });
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }, []);

  function handleFiles(files: FileList | null) {
    if (!files) return;
    // Upload files sequentially to avoid overwhelming the server
    Array.from(files).reduce(
      (chain, file) => chain.then(() => uploadFile(file)),
      Promise.resolve(),
    );
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  }

  return (
    <div className="space-y-2">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors ${
          isDragging
            ? "border-primary bg-primary/5"
            : "border-zinc-200 hover:border-zinc-300"
        }`}
      >
        {uploading ? (
          <IconLoader2 className="size-8 animate-spin text-zinc-400" />
        ) : (
          <IconUpload className="size-8 text-zinc-400" />
        )}
        <p className="mt-2 text-sm text-zinc-500">
          {uploading
            ? "Uploading..."
            : "Drag and drop images here, or click to browse"}
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
          disabled={uploading}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-3"
          disabled={uploading}
          onClick={() => fileInputRef.current?.click()}
        >
          Browse Files
        </Button>
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
