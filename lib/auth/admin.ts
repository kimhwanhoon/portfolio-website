import { auth } from "@clerk/nextjs/server";

function getAdminUserIds(): string[] {
  return (process.env.ADMIN_USER_IDS ?? "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);
}

export function isAdmin(userId: string | null | undefined): boolean {
  if (!userId) return false;
  const allowlist = getAdminUserIds();
  // If the allowlist is empty, deny by default (safer than allow-all).
  if (allowlist.length === 0) return false;
  return allowlist.includes(userId);
}

/**
 * Throws if the current request is not authenticated as an admin.
 * Use inside Server Actions and route handlers for any mutation
 * that must be admin-only.
 */
export async function requireAdmin(): Promise<string> {
  const { userId } = await auth();
  if (!isAdmin(userId)) {
    throw new Error("Unauthorized");
  }
  return userId as string;
}
