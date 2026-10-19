const app = require('./app');

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`[INFO] Server started successfully on port ${PORT}`);
  console.log(`[INFO] Environment: ${process.env.NODE_ENV || 'production'}`);
  console.log(`[INFO] Health check available at http://localhost:${PORT}/health`);
});

// Graceful shutdown handling for Cloud-Native environments
const handleShutdown = (signal) => {
  console.log(`[INFO] Received ${signal}. Gracefully terminating server...`);
  server.close(() => {
    console.log('[INFO] HTTP server closed cleanly. Exiting process.');
    process.exit(0);
  });

  // Force shutdown after timeout if connections hang
  setTimeout(() => {
    console.error('[ERROR] Forcing shutdown after timeout.');
    process.exit(1);
  }, 5000);
};

process.on('SIGTERM', () => handleShutdown('SIGTERM'));
process.on('SIGINT', () => handleShutdown('SIGINT'));

module.exports = server;
