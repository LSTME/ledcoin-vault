const logger = require('./lib/logger');
const server = require('./lib/server');

Promise.resolve()
  .then(async () => server(process.env.NODE_ENV || 'development'))
  .catch(error => logger.error(error));

