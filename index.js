const logger = require('./lib/logger');
const web = require('./lib/web');
const tcp = require('./lib/tcp');

const configLoader = require('./lib/configLoader');
const dbLoader = require('./lib/dbLoader');

let context = {};

Promise.resolve()
  .then(async () => {
    const environment = process.env.NODE_ENV || 'development';
    const config = await configLoader(environment);
    const db = await dbLoader(config.db.url);

    context = {
      environment,
      config,
      db,
    };
  })
  .then(async () => web(context.environment, context))
  .then(async () => tcp(context.environment, context))
  .catch(error => logger.error(error));

