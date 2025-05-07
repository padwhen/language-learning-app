// backend/jest-mongodb-config.js
module.exports = {
    mongodbMemoryServerOptions: {
      binary: {
        version: '6.0.4', // Use a specific MongoDB version (check compatibility)
        skipMD5: true,
      },
      instance: {
        dbName: 'jest', // Name for the in-memory database
      },
      autoStart: false, // We will start/stop it manually in tests
    },
  };