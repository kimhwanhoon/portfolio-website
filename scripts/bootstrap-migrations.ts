/**
 * One-time bootstrap: mark existing migration files as already applied
 * on a database that was previously managed via `drizzle-kit push`.
 *
 * Idempotent: rows already present (matched by hash) are not duplicated.
 * Run with:  bun run db:bootstrap
 *
 * After running once on every existing environment (dev, staging, prod),
 * switch to `bun run db:migrate` for all future schema changes.
 */
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { neon } from "@neondatabase/serverless";
import { config as loadEnv } from "dotenv";

loadEnv({ path: ".env.local" });

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("DATABASE_URL is not set in .env.local");
  process.exit(1);
}

const MIGRATIONS_DIR = resolve("lib/db/migrations");

interface JournalEntry {
  idx: number;
  version: string;
  when: number;
  tag: string;
  breakpoints: boolean;
}

interface Journal {
  version: string;
  dialect: string;
  entries: JournalEntry[];
}

async function main() {
  const journalPath = resolve(MIGRATIONS_DIR, "meta/_journal.json");
  const journal: Journal = JSON.parse(readFileSync(journalPath, "utf-8"));

  const sql = neon(DATABASE_URL!);

  // Drizzle's migrator creates these on first run; we replicate exactly.
  await sql`CREATE SCHEMA IF NOT EXISTS drizzle`;
  await sql`
    CREATE TABLE IF NOT EXISTS drizzle.__drizzle_migrations (
      id SERIAL PRIMARY KEY,
      hash text NOT NULL,
      created_at bigint
    )
  `;

  const existing =
    (await sql`SELECT hash FROM drizzle.__drizzle_migrations`) as Array<{
      hash: string;
    }>;
  const existingHashes = new Set(existing.map((r) => r.hash));

  let inserted = 0;
  let skipped = 0;

  for (const entry of journal.entries) {
    const sqlPath = resolve(MIGRATIONS_DIR, `${entry.tag}.sql`);
    const content = readFileSync(sqlPath, "utf-8");
    const hash = createHash("sha256").update(content).digest("hex");

    if (existingHashes.has(hash)) {
      console.log(`✓ ${entry.tag} already marked as applied`);
      skipped++;
      continue;
    }

    await sql`
      INSERT INTO drizzle.__drizzle_migrations (hash, created_at)
      VALUES (${hash}, ${entry.when})
    `;
    console.log(`+ ${entry.tag} marked as applied`);
    inserted++;
  }

  console.log(`\nDone. inserted=${inserted}, skipped=${skipped}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
