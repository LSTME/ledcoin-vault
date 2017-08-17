const logger = require('./lib/logger');
const web = require('./lib/web');
const tcp = require('./lib/tcp');

const context = {};

Promise.resolve()
  .then(async () => web(process.env.NODE_ENV || 'development', context))
  .then(async () => tcp(process.env.NODE_ENV || 'development', context))
  .catch(error => logger.error(error));

