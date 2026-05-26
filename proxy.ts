import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { type NextRequest, NextResponse } from "next/server";
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";
import { isAdmin } from "@/lib/auth/admin";

const isProtectedRoute = createRouteMatcher(["/admin(.*)", "/api/images(.*)"]);
const intlMiddleware = createIntlMiddleware(routing);

// Paths that skip i18n
const isIgnoredPath = createRouteMatcher([
  "/admin(.*)",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api(.*)",
  "/sitemap.xml",
  "/robots.txt",
]);

const handler = clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    // Force sign-in first
    await auth.protect();

    // Then enforce admin allowlist
    const { userId } = await auth();
    if (!isAdmin(userId)) {
      return new NextResponse("Forbidden", { status: 403 });
    }
  }

  if (!isIgnoredPath(req)) {
    return intlMiddleware(req);
  }
});

export function proxy(
  request: NextRequest,
  event: Parameters<typeof handler>[1],
) {
  return handler(request, event);
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
