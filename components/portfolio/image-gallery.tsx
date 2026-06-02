"use client";

import { IconMaximize } from "@tabler/icons-react";
import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import { useState } from "react";
import Lightbox, { type Slide } from "yet-another-react-lightbox";
import Captions from "yet-another-react-lightbox/plugins/captions";
import Counter from "yet-another-react-lightbox/plugins/counter";
import Fullscreen from "yet-another-react-lightbox/plugins/fullscreen";
import Slideshow from "yet-another-react-lightbox/plugins/slideshow";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/captions.css";
import "yet-another-react-lightbox/plugins/counter.css";
import "yet-another-react-lightbox/plugins/thumbnails.css";
import { cn } from "@/lib/utils";

interface GalleryImage {
  id: string;
  url: string;
  alt: string | null;
  width: number | null;
  height: number | null;
}

interface ImageGalleryProps {
  images: GalleryImage[];
  thumbnailUrl?: string | null;
  /** Translated label for the "open fullscreen" affordance (i18n). */
  viewLabel?: string;
}

export function ImageGallery({
  images,
  thumbnailUrl,
  viewLabel = "View full size",
}: ImageGalleryProps) {
  const allImages =
    images.length > 0
      ? images
      : thumbnailUrl
        ? [
            {
              id: "thumb",
              url: thumbnailUrl,
              alt: null,
              width: null,
              height: null,
            },
          ]
        : [];

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState(-1);

  if (allImages.length === 0) return null;

  const current = allImages[selectedIndex];

  // Slides for the lightbox. Dimensions (when known) let the Zoom plugin
  // compute sane zoom bounds and the Next/Image renderer size correctly.
  const slides: Slide[] = allImages.map((img) => ({
    src: img.url,
    alt: img.alt ?? undefined,
    width: img.width ?? undefined,
    height: img.height ?? undefined,
    ...(img.alt ? { description: img.alt } : {}),
  }));

  function openLightbox(index: number) {
    setLightboxIndex(index);
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={() => openLightbox(selectedIndex)}
        aria-label={viewLabel}
        className="group relative block aspect-video w-full cursor-zoom-in overflow-hidden rounded-lg bg-zinc-100"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0"
          >
            <Image
              src={current.url}
              alt={current.alt || "Project screenshot"}
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, 800px"
              priority
            />
          </motion.div>
        </AnimatePresence>
        <span className="pointer-events-none absolute right-3 bottom-3 flex items-center gap-1.5 rounded-full bg-black/55 px-2.5 py-1 text-xs font-medium text-white opacity-0 backdrop-blur-sm transition-opacity duration-200 group-hover:opacity-100">
          <IconMaximize className="size-3.5" />
          {viewLabel}
        </span>
      </button>

      {allImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {allImages.map((img, i) => (
            <button
              key={img.id}
              type="button"
              onClick={() => setSelectedIndex(i)}
              onDoubleClick={() => openLightbox(i)}
              aria-current={i === selectedIndex}
              className={cn(
                "relative size-16 shrink-0 overflow-hidden rounded-md border-2 transition-colors",
                i === selectedIndex
                  ? "border-primary"
                  : "border-transparent hover:border-zinc-300",
              )}
            >
              <Image
                src={img.url}
                alt={img.alt || ""}
                fill
                className="object-cover"
                sizes="64px"
              />
            </button>
          ))}
        </div>
      )}

      <Lightbox
        open={lightboxIndex >= 0}
        close={() => setLightboxIndex(-1)}
        index={lightboxIndex < 0 ? 0 : lightboxIndex}
        slides={slides}
        on={{
          // `index` is controlled, so keep lightboxIndex in sync as the user
          // navigates — otherwise the next render snaps back to the opened
          // slide. Mirror into selectedIndex so the inline preview follows too.
          view: ({ index }) => {
            setLightboxIndex(index);
            setSelectedIndex(index);
          },
        }}
        plugins={[Zoom, Fullscreen, Slideshow, Thumbnails, Counter, Captions]}
        // Don't lock <body> scroll: this app scrolls on window, and YARL's
        // `height:100%;overflow:hidden` body lock resets scroll to top on close.
        noScroll={{ disabled: true }}
        carousel={{ finite: allImages.length <= 1 }}
        counter={{ container: { style: { top: "unset", bottom: 0 } } }}
        zoom={{ maxZoomPixelRatio: 3, doubleTapDelay: 250 }}
        thumbnails={{ showToggle: true, width: 96, height: 64 }}
        styles={{
          container: { backgroundColor: "rgba(0, 0, 0, .92)" },
        }}
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
