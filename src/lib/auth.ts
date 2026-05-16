/**
 * src/lib/auth.ts
 * Auth.js v5 (NextAuth) configuration.
 * - Provider: Credentials (email + password)
 * - Adapter:  @auth/prisma-adapter (persists sessions/accounts to Neon DB)
 * - Strategy: JWT (database sessions require edge-incompatible DB calls)
 */

import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),

  // Use JWT strategy — Credentials provider does NOT support database sessions
  session: { strategy: 'jwt' },

  providers: [
    Credentials({
      name: 'Email & Password',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'you@example.com' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
          select: { id: true, name: true, email: true, image: true, password: true, role: true },
        });

        if (!user?.password) return null;

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.password,
        );

        if (!isValid) return null;

        // Return the user object (password excluded)
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role,
        };
      },
    }),
  ],

  callbacks: {
    // Embed user.id and role into the JWT token
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role ?? 'ASPIRANT';
      }
      return token;
    },
    // Forward token fields into the session object (accessible on the client)
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        (session.user as { role?: string }).role = token.role as string;
      }
      return session;
    },
  },

  // Custom pages (we'll build these next)
  pages: {
    signIn: '/auth/login',
    error: '/auth/login',
  },
});
