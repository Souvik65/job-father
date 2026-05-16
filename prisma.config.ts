// prisma.config.ts
// Prisma v7 — Connection URLs live here, NOT in schema.prisma
// Docs: https://pris.ly/d/config-datasource

import 'dotenv/config';
import { defineConfig } from 'prisma/config';
// import { PrismaNeon } from '@prisma/adapter-neon';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    // Used for CLI commands like db push/migrate (direct connection)
    url: process.env['DIRECT_URL'] ?? process.env['DATABASE_URL'] ?? (() => {
      throw new Error('Missing DATABASE_URL or DIRECT_URL environment variable');
    })(),
  },
});
