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
  return mixedTranslationsObject(itemSchema, itemSchema);
}

/**
 * Like `translationsObject`, but lets the default locale use a stricter schema
 * than the others. Useful on the server: the default locale must be fully
 * valid, while non-default locales are parsed loosely (empty strings allowed)
 * so genuinely-empty translations can be filtered out before a strict re-check.
 *
 * The inferred type follows the default locale's schema.
 */
export function mixedTranslationsObject<
  TDefault extends z.ZodTypeAny,
  TOther extends z.ZodTypeAny,
>(
  defaultSchema: TDefault,
  otherSchema: TOther,
): z.ZodType<TranslationsFor<z.infer<TDefault>>> {
  const shape = Object.fromEntries(
    routing.locales.map((locale) => [
      locale,
      locale === routing.defaultLocale ? defaultSchema : otherSchema.optional(),
    ]),
  );
  return z.object(shape) as unknown as z.ZodType<
    TranslationsFor<z.infer<TDefault>>
  >;
}
