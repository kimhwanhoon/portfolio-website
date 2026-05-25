import {
  pgTable,
  uuid,
  text,
  varchar,
  boolean,
  integer,
  timestamp,
  jsonb,
  pgEnum,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const statusEnum = pgEnum("portfolio_status", ["draft", "published"]);

export const portfolioItems = pgTable("portfolio_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  shortDescription: text("short_description").notNull(),
  fullDescription: text("full_description").notNull(),
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

export const images = pgTable("images", {
  id: uuid("id").defaultRandom().primaryKey(),
  portfolioId: uuid("portfolio_id").references(() => portfolioItems.id, {
    onDelete: "cascade",
  }),
  url: text("url").notNull(),
  alt: text("alt").default(""),
  sortOrder: integer("sort_order").default(0).notNull(),
  width: integer("width"),
  height: integer("height"),
  fileSize: integer("file_size"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

export const portfolioItemsRelations = relations(
  portfolioItems,
  ({ many }) => ({
    images: many(images),
  })
);

export const imagesRelations = relations(images, ({ one }) => ({
  portfolioItem: one(portfolioItems, {
    fields: [images.portfolioId],
    references: [portfolioItems.id],
  }),
}));
