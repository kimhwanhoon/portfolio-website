import { IconPlus } from "@tabler/icons-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { getAllPortfolioItemsForAdmin } from "@/lib/queries/portfolio";
import { PortfolioList } from "./_components/portfolio-list";

export default async function AdminPage() {
  const items = await getAllPortfolioItemsForAdmin();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Portfolio</h1>
          <p className="text-sm text-zinc-500">Manage your portfolio items.</p>
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
