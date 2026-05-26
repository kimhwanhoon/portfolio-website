import { z } from "zod";
import { type Locale, routing } from "@/i18n/routing";

/**
 * TS shape that mirrors `translationsObject`: the default locale is required,
 * other locales optional.
 */
export type TranslationsFor<T> = { [K in Locale]?: T } & {
  [K in typeof routing.defaultLocale]: T;
};

/**
 * Build a `{ en: schema, fr: schema.optional(), ... }` zod object dynamically
 * from `routing.locales`. The default locale is required; all others optional.
 *
 * Adding a new locale automatically extends this schema — no code changes here.
 *
 * The return type is cast so that `z.infer<...>` produces `TranslationsFor<T>`
 * with the default locale required (zod cannot derive this from a dynamic shape).
 */
export function translationsObject<T extends z.ZodTypeAny>(
  itemSchema: T,
): z.ZodType<TranslationsFor<z.infer<T>>> {
  const shape = Object.fromEntries(
    routing.locales.map((locale) => [
      locale,
      locale === routing.defaultLocale ? itemSchema : itemSchema.optional(),
    ]),
  );
  return z.object(shape) as unknown as z.ZodType<TranslationsFor<z.infer<T>>>;
}
