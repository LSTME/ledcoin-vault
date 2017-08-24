const configLoader = require('../lib/configLoader');

const config = configLoader(process.env.NODE_ENV || 'development');

module.exports = config.db;
