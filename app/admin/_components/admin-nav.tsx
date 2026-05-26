"use client";

import { UserButton } from "@clerk/nextjs";
import { IconLayoutDashboard, IconPhoto, IconPlus } from "@tabler/icons-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
  {
    label: "Portfolio",
    href: "/admin",
    icon: IconLayoutDashboard,
  },
  {
    label: "New Item",
    href: "/admin/new",
    icon: IconPlus,
  },
  {
    label: "Images",
    href: "/admin/images",
    icon: IconPhoto,
  },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <aside className="flex w-60 flex-col border-r bg-zinc-50">
      <div className="flex h-14 items-center border-b px-4">
        <Link href="/admin" className="text-sm font-semibold tracking-tight">
          Admin CMS
        </Link>
      </div>
      <nav className="flex flex-1 flex-col gap-1 p-3">
        {navItems.map((item) => {
          const isActive =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
                isActive
                  ? "bg-zinc-200/70 font-medium text-zinc-900"
                  : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900",
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
