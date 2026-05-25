"use client";

import { IconEdit, IconTrash } from "@tabler/icons-react";
import Link from "next/link";
import { useTransition } from "react";
import {
  deletePortfolio,
  togglePortfolioStatus,
} from "@/app/actions/portfolio";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DeleteDialog } from "./delete-dialog";

interface PortfolioItem {
  id: string;
  title: string;
  slug: string;
  status: "draft" | "published";
  featured: boolean;
  sortOrder: number;
  updatedAt: Date;
}

interface PortfolioListProps {
  items: PortfolioItem[];
}

export function PortfolioList({ items }: PortfolioListProps) {
  const [isPending, startTransition] = useTransition();

  function handleToggleStatus(id: string) {
    startTransition(() => togglePortfolioStatus(id));
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">#</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Featured</TableHead>
            <TableHead>Updated</TableHead>
            <TableHead className="w-24 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="py-8 text-center text-zinc-500">
                No portfolio items yet. Create your first one.
              </TableCell>
            </TableRow>
          )}
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="text-zinc-500">{item.sortOrder}</TableCell>
              <TableCell className="font-medium">{item.title}</TableCell>
              <TableCell>
                <button
                  type="button"
                  onClick={() => handleToggleStatus(item.id)}
                  disabled={isPending}
                >
                  <Badge
                    variant={
                      item.status === "published" ? "default" : "secondary"
                    }
                    className="cursor-pointer"
                  >
                    {item.status}
                  </Badge>
                </button>
              </TableCell>
              <TableCell>
                {item.featured && <Badge variant="outline">Featured</Badge>}
              </TableCell>
              <TableCell className="text-zinc-500">
                {item.updatedAt.toLocaleDateString()}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1">
                  <Link
                    href={`/admin/portfolio/${item.id}/edit`}
                    className={buttonVariants({
                      variant: "ghost",
                      size: "icon-sm",
                    })}
                  >
                    <IconEdit className="size-4" />
                  </Link>
                  <DeleteDialog
                    title="Delete portfolio item"
                    description={`Are you sure you want to delete "${item.title}"? This will also delete all associated images. This action cannot be undone.`}
                    onConfirm={() => deletePortfolio(item.id)}
                    triggerLabel={<IconTrash className="size-4" />}
                  />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
