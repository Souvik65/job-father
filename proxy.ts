/**
 * proxy.ts  (Next.js 16+  — was middleware.ts in older versions)
 * Auth.js session proxy: keeps JWT session alive by refreshing the cookie
 * on every matched route request.
 *
 * NOTE: In Next.js 16, this MUST be proxy.ts (not middleware.ts).
 */

export { auth as proxy } from '@/lib/auth';

export const config = {
  // Run on every route EXCEPT static files, images, and API routes
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
