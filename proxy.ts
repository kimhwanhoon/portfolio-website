import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import type { NextRequest } from "next/server";
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";

const isProtectedRoute = createRouteMatcher(["/admin(.*)"]);
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

const handler = clerkMiddleware((auth, req) => {
  // Protect admin routes
  if (isProtectedRoute(req)) {
    auth.protect();
  }

  // Apply i18n middleware for public routes
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
