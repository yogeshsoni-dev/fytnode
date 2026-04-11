'use strict';

const path = require('path');

// ── Must be set BEFORE any import that touches the DB (SSL CA cert for Aiven)
process.env.NODE_EXTRA_CA_CERTS = path.join(__dirname, 'certs', 'ca.pem');

require('dotenv').config();

const app    = require('./src/app');
const prisma = require('./src/utils/prismaClient');

const PORT = parseInt(process.env.PORT, 10) || 5000;

async function start() {
  try {
    // Verify DB connectivity before accepting traffic
    await prisma.$connect();
    console.log('✅  PostgreSQL connected (Aiven)');

    const server = app.listen(PORT, () => {
      console.log(`🚀  Server running on http://localhost:${PORT}`);
      console.log(`📋  Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🏋️  FytNodes GMS API ready`);
    });

    // ── Graceful shutdown ────────────────────────────────────────────────────
    const shutdown = async (signal) => {
      console.log(`\n${signal} received — shutting down gracefully...`);
      server.close(async () => {
        await prisma.$disconnect();
        console.log('💤  DB disconnected. Bye!');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT',  () => shutdown('SIGINT'));

    // Unhandled rejection guard
    process.on('unhandledRejection', (err) => {
      console.error('💥  Unhandled rejection:', err);
      shutdown('UNHANDLED_REJECTION');
    });

  } catch (err) {
    console.error('❌  Failed to start server:', err);
    await prisma.$disconnect();
    process.exit(1);
  }
}

start();
