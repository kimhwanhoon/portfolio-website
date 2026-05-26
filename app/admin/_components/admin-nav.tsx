"use client";

import { UserButton } from "@clerk/nextjs";
import {
  IconArticle,
  IconLayoutDashboard,
  IconPhoto,
  IconPlus,
} from "@tabler/icons-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { cn } from "@/lib/utils";

const navItems = [
  {
    label: "Portfolio",
    href: "/admin",
    icon: IconLayoutDashboard,
    exact: true,
  },
  {
    label: "New Item",
    href: "/admin/new",
    icon: IconPlus,
    exact: false,
  },
  {
    label: "Posts",
    href: "/admin/posts",
    icon: IconArticle,
    exact: false,
  },
  {
    label: "Images",
    href: "/admin/images",
    icon: IconPhoto,
    exact: false,
  },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <aside className="flex w-60 flex-col border-r bg-sidebar">
      <div className="flex h-14 items-center justify-between border-b px-4">
        <Link href="/admin" className="text-sm font-semibold tracking-tight">
          Admin CMS
        </Link>
        <ThemeToggle />
      </div>
      <nav className="flex flex-1 flex-col gap-1 p-3">
        {navItems.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
                isActive
                  ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              )}
            >
              <item.icon className="size-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t p-4">
        <UserButton />
      </div>
    </aside>
  );
}
