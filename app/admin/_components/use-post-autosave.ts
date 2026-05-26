"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Locale } from "@/i18n/routing";

const AUTOSAVE_VERSION = 2;
const DEFAULT_INTERVAL_MS = 10_000;

export type PostTranslationAutosave = {
  title: string;
  excerpt: string;
  contentJson: unknown;
};

export type PostAutosaveSnapshot = {
  slug: string;
  coverImageUrl: string;
  translations: Partial<Record<Locale, PostTranslationAutosave>>;
  tagSlugs: string[];
  status: "draft" | "published";
  featured: boolean;
  savedAt: string;
  __v: number;
};

type StoredPayload = PostAutosaveSnapshot;

function readStorage(key: string): StoredPayload | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredPayload;
    if (parsed.__v !== AUTOSAVE_VERSION) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeStorage(key: string, data: StoredPayload) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {
    console.warn("[autosave] Failed to write to localStorage");
  }
}

export function usePostAutosave(
  storageKey: string,
  getSnapshot: () => Omit<PostAutosaveSnapshot, "savedAt" | "__v">,
  enabled: boolean,
  options?: { intervalMs?: number },
) {
  const intervalMs = options?.intervalMs ?? DEFAULT_INTERVAL_MS;
  const getSnapshotRef = useRef(getSnapshot);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);

  getSnapshotRef.current = getSnapshot;

  const save = useCallback(() => {
    if (!enabled) return;
    const snapshot = getSnapshotRef.current();
    const payload: StoredPayload = {
      ...snapshot,
      savedAt: new Date().toISOString(),
      __v: AUTOSAVE_VERSION,
    };
    writeStorage(storageKey, payload);
    setLastSavedAt(new Date(payload.savedAt));
  }, [storageKey, enabled]);

  const restore = useCallback((): StoredPayload | null => {
    return readStorage(storageKey);
  }, [storageKey]);

  const clear = useCallback(() => {
    if (typeof window === "undefined") return;
    try {
      localStorage.removeItem(storageKey);
    } catch {
      /* ignore */
    }
    setLastSavedAt(null);
  }, [storageKey]);

  useEffect(() => {
    if (!enabled) return;

    const id = window.setInterval(save, intervalMs);

    const onBeforeUnload = () => save();
    window.addEventListener("beforeunload", onBeforeUnload);

    return () => {
      window.clearInterval(id);
      window.removeEventListener("beforeunload", onBeforeUnload);
    };
  }, [enabled, save, intervalMs]);

  return { restore, clear, save, lastSavedAt };
}
