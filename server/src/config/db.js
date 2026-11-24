const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { databaseUrl } = require('./env');

// Prisma 7 talks to PostgreSQL through the node-postgres driver adapter.
// pg has no connect timeout by default; keep Prisma 6's 5s so a down
// database fails fast instead of hanging requests.
const adapter = new PrismaPg({ connectionString: databaseUrl, connectionTimeoutMillis: 5000 });

const prisma = new PrismaClient({ adapter });

module.exports = prisma;
