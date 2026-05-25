import { relations } from "drizzle-orm";
import {
  boolean,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const statusEnum = pgEnum("portfolio_status", ["draft", "published"]);

export const portfolioItems = pgTable("portfolio_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  thumbnailUrl: text("thumbnail_url"),
  techStack: jsonb("tech_stack").$type<string[]>().default([]),
  liveUrl: text("live_url"),
  githubUrl: text("github_url"),
  featured: boolean("featured").default(false).notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  status: statusEnum("status").default("draft").notNull(),
  startDate: timestamp("start_date", { mode: "date" }),
  endDate: timestamp("end_date", { mode: "date" }),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

export const portfolioTranslations = pgTable(
  "portfolio_translations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    portfolioId: uuid("portfolio_id")
      .references(() => portfolioItems.id, { onDelete: "cascade" })
      .notNull(),
    locale: varchar("locale", { length: 10 }).notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    shortDescription: text("short_description").notNull(),
    fullDescription: text("full_description").notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("portfolio_locale_idx").on(table.portfolioId, table.locale),
  ],
);

export const images = pgTable("images", {
  id: uuid("id").defaultRandom().primaryKey(),
  portfolioId: uuid("portfolio_id").references(() => portfolioItems.id, {
    onDelete: "cascade",
  }),
  url: text("url").notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  width: integer("width"),
  height: integer("height"),
  fileSize: integer("file_size"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

export const imageTranslations = pgTable(
  "image_translations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    imageId: uuid("image_id")
      .references(() => images.id, { onDelete: "cascade" })
      .notNull(),
    locale: varchar("locale", { length: 10 }).notNull(),
    alt: text("alt").default(""),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
  },
  (table) => [uniqueIndex("image_locale_idx").on(table.imageId, table.locale)],
);

// Relations
export const portfolioItemsRelations = relations(
  portfolioItems,
  ({ many }) => ({
    images: many(images),
    translations: many(portfolioTranslations),
  }),
);

export const portfolioTranslationsRelations = relations(
  portfolioTranslations,
  ({ one }) => ({
    portfolioItem: one(portfolioItems, {
      fields: [portfolioTranslations.portfolioId],
      references: [portfolioItems.id],
    }),
  }),
);

export const imagesRelations = relations(images, ({ one, many }) => ({
  portfolioItem: one(portfolioItems, {
    fields: [images.portfolioId],
    references: [portfolioItems.id],
  }),
  translations: many(imageTranslations),
}));

export const imageTranslationsRelations = relations(
  imageTranslations,
  ({ one }) => ({
    image: one(images, {
      fields: [imageTranslations.imageId],
      references: [images.id],
    }),
  }),
);
