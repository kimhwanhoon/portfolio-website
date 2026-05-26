"use client";

import { IconEdit, IconTrash } from "@tabler/icons-react";
import Link from "next/link";
import { useTransition } from "react";
import {
  deletePost,
  togglePostFeatured,
  togglePostStatus,
} from "@/app/actions/post";
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

interface PostItem {
  id: string;
  title: string;
  slug: string;
  status: "draft" | "published";
  featured: boolean;
  readingMinutes: number;
  updatedAt: Date;
}

interface PostListProps {
  items: PostItem[];
}

export function PostList({ items }: PostListProps) {
  const [isPending, startTransition] = useTransition();

  function handleToggleStatus(id: string) {
    startTransition(() => togglePostStatus(id));
  }

  function handleToggleFeatured(id: string) {
    startTransition(() => togglePostFeatured(id));
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Featured</TableHead>
            <TableHead>Read time</TableHead>
            <TableHead>Updated</TableHead>
            <TableHead className="w-24 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="py-8 text-center text-zinc-500">
                No posts yet. Create your first one.
              </TableCell>
            </TableRow>
          )}
          {items.map((item) => (
            <TableRow key={item.id}>
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
                <button
                  type="button"
                  onClick={() => handleToggleFeatured(item.id)}
                  disabled={isPending}
                >
                  <Badge
                    variant={item.featured ? "default" : "outline"}
                    className="cursor-pointer"
                  >
                    {item.featured ? "Featured" : "—"}
                  </Badge>
                </button>
              </TableCell>
              <TableCell className="text-zinc-500">
                {item.readingMinutes} min
              </TableCell>
              <TableCell className="text-zinc-500">
                {item.updatedAt.toLocaleDateString()}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1">
                  <Link
                    href={`/admin/posts/${item.id}`}
                    className={buttonVariants({
                      variant: "ghost",
                      size: "icon-sm",
                    })}
                  >
                    <IconEdit className="size-4" />
                  </Link>
                  <DeleteDialog
                    title="Delete post"
                    description={`Are you sure you want to delete "${item.title}"? This action cannot be undone.`}
                    onConfirm={() => deletePost(item.id)}
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
