const logger = require('./lib/logger');
const web = require('./lib/web');
const tcp = require('./lib/tcp');

Promise.resolve()
  .then(async () => web(process.env.NODE_ENV || 'development'))
  .then(async () => tcp(process.env.NODE_ENV || 'development'))
  .catch(error => logger.error(error));

