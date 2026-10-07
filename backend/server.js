/**
 * CampusFix Server Entry Point
 */

const app = require('./app');
const env = require('./config/env');
const db = require('./config/db');
const logger = require('./utils/logger');

async function bootstrap() {
  logger.info('Initializing CampusFix Backend Service...');

  // Test database connection
  await db.testConnection();

  const server = app.listen(env.PORT, () => {
    logger.info(`=======================================================`);
    logger.info(`  CampusFix REST API listening on port ${env.PORT}`);
    logger.info(`  Environment : ${env.NODE_ENV}`);
    logger.info(`  Healthcheck : http://localhost:${env.PORT}/api/health`);
    logger.info(`=======================================================`);
  });

  // Graceful shutdown handling
  const shutdown = () => {
    logger.info('Shutting down CampusFix server gracefully...');
    server.close(() => {
      logger.info('HTTP server closed.');
      if (db.pool) {
        db.pool.end().then(() => {
          logger.info('Database connection pool terminated.');
          process.exit(0);
        });
      } else {
        process.exit(0);
      }
    });
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

bootstrap().catch(err => {
  logger.error('Fatal bootstrap error', err);
  process.exit(1);
});
