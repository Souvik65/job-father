/**
 * src/app/api/auth/[...nextauth]/route.ts
 * Auth.js v5 catch-all API route handler.
 * Handles: GET/POST /api/auth/session, /api/auth/signIn, /api/auth/signOut, etc.
 */

import { handlers } from '@/lib/auth';

export const { GET, POST } = handlers;
