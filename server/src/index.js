require('dotenv').config();

const app = require('./app');
const { testConnection } = require('./config/database');
const logger = require('./utils/logger');

const PORT = process.env.PORT || 5000;

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled promise rejection', {
    message: reason instanceof Error ? reason.message : String(reason),
  });
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception', {
    name: error.name,
    message: error.message,
    stack: error.stack,
  });
  process.exit(1);
});

async function start() {
  console.log('\n========================================');
  console.log('  Integrated Government Services System');
  console.log('  Starting backend server...');
  console.log('========================================\n');

  // Step 1: Test database connection
  try {
    console.log('Checking database connection...');
    await testConnection();
    console.log('DATABASE CONNECTED SUCCESSFULLY');
    console.log(`   Host: ${process.env.DB_HOST}`);
    console.log(`   Database: ${process.env.DB_NAME}`);
    console.log(`   SSL: ${process.env.DB_SSL === 'true' ? 'enabled' : 'disabled'}`);
    console.log('');
  } catch (err) {
    console.error('DATABASE CONNECTION FAILED');
    console.error(`   Reason: ${err.message}`);
    console.error('');
    console.error('   Check your .env file:');
    console.error('     DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD, DB_SSL');
    console.error('');
    logger.error('Failed to connect to database:', err);
    process.exit(1);
  }

  // Step 2: Start server
  try {
    const server = app.listen(PORT, () => {
      console.log('========================================');
      console.log('SERVER STARTED SUCCESSFULLY');
      console.log(`   URL: http://localhost:${PORT}`);
      console.log(`   Health check: http://localhost:${PORT}/api/health`);
      console.log(`   Mode: ${process.env.NODE_ENV || 'development'}`);
      console.log('========================================\n');
      logger.info(`Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('\nSIGTERM received. Shutting down gracefully...');
      server.close(() => {
        console.log('Server closed.');
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      console.log('\nSIGINT received. Shutting down gracefully...');
      server.close(() => {
        console.log('Server closed.');
        process.exit(0);
      });
    });
  } catch (err) {
    console.error('FAILED TO START SERVER');
    console.error(`   Reason: ${err.message}`);
    logger.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();