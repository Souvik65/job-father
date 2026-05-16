/**
 * src/types/next-auth.d.ts
 * Extends Auth.js session and JWT types to include custom fields:
 * - user.id  (cuid from DB)
 * - user.role (UserRole enum)
 */

import { DefaultSession, DefaultJWT } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: 'ASPIRANT' | 'ADMIN';
    } & DefaultSession['user'];
  }

  interface User {
    role?: 'ASPIRANT' | 'ADMIN';
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    id?: string;
    role?: string;
  }
}
