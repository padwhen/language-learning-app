module.exports = {
    preset: '@shelf/jest-mongodb', // Use the preset for MongoDB setup
    testEnvironment: 'node', // Specify Node.js environment
    // Optional: Watch for changes and automatically connect/disconnect MongoDB
    // watchPlugins: [
    //   'jest-watch-typeahead/filename',
    //   'jest-watch-typeahead/testname',
    //   ['jest-mongodb/watch', { MONGODB_VERSION: 'latest' }], // Adjust MongoDB version if needed
    // ],
  };