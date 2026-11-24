const path = require('path');
const dotenv = require('dotenv');
const { defineConfig } = require('prisma/config');

// Prisma 7 no longer loads .env files itself. Mirror src/config/env.js:
// NODE_ENV=test → .env.test, otherwise .env. Already-set variables win.
dotenv.config({
  path: path.resolve(__dirname, process.env.NODE_ENV === 'test' ? '.env.test' : '.env'),
  quiet: true,
});

module.exports = defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'node prisma/seed.js',
  },
  datasource: {
    // Read directly rather than via env(): `prisma generate` (run on
    // postinstall) must work before a .env file exists. Commands that connect
    // still fail clearly when it is missing.
    // On Neon, DATABASE_URL is the pooled (PgBouncer) endpoint, which breaks
    // Prisma Migrate; the CLI uses the direct DATABASE_URL_UNPOOLED instead.
    // The app itself (src/config/db.js) keeps the pooled DATABASE_URL.
    url: process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL,
  },
});
