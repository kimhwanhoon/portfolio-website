import Link from "next/link";
import { db } from "@/lib/db";
import { portfolioItems } from "@/lib/db/schema";
import { asc } from "drizzle-orm";
import { PortfolioList } from "./_components/portfolio-list";
import { buttonVariants } from "@/components/ui/button";
import { IconPlus } from "@tabler/icons-react";

export default async function AdminPage() {
  const items = await db
    .select()
    .from(portfolioItems)
    .orderBy(asc(portfolioItems.sortOrder));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Portfolio</h1>
          <p className="text-sm text-zinc-500">
            Manage your portfolio items.
          </p>
        </div>
        <Link href="/admin/portfolio/new" className={buttonVariants()}>
          <IconPlus className="size-4" />
          New Item
        </Link>
      </div>
      <PortfolioList items={items} />
    </div>
  );
}
