const net = require('net');

const logger = require('./logger');
const configLoader = require('./configLoader');
const dbLoader = require('./dbLoader');
const DataSource = require('./DataSource');
const seeds = require('./seeds');

module.exports = async (environment) => {
  const config = configLoader(environment);
  const db = await dbLoader(config.db.url);
  const dataSource = new DataSource(config, db);

  if (environment !== 'production' && dataSource.getUsers().length === 0) {
    seeds(dataSource);
  }

  const server = net.createServer((client) => {
    logger.info('client connected');
    client.on('end', () => {
      logger.info('client disconnected');
    });
    client.write('hello\r\n');
    client.pipe(client);

    client.on('data', (buffer) => {
      const data = buffer.toString();
      logger.info('client', data);
    });

    client.on('error', (error) => {
      logger.error('client error', error);
    });
  });

  server.on('error', (err) => {
    console.error('server error', err);
  });

  server.listen(config.tcp.port, () => {
    logger.info(`TCP server started at localhost:${config.tcp.port}`);
  });

};
