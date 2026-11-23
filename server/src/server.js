const app = require('./app');
const { port } = require('./config/env');
const prisma = require('./config/db');

const server = app.listen(port, () => {
  console.log(`Sweety API listening on http://localhost:${port}`);
});

async function shutdown() {
  server.close();
  await prisma.$disconnect();
  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
