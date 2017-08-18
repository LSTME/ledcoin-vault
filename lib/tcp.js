/* eslint no-param-reassign: 0 */
const net = require('net');

const logger = require('./logger');
const configLoader = require('./configLoader');
const dbLoader = require('./dbLoader');
const DataSource = require('./DataSource');
const seeds = require('./seeds');

const Terminal = require('./tcpServer/terminal');

module.exports = async (environment, context) => {
  const terminals = {};
  const config = configLoader(environment);
  const db = await dbLoader(config.db.url);
  const dataSource = new DataSource(config, db);

  if (environment !== 'production' && dataSource.getUsers().length === 0) {
    seeds(dataSource);
  }

  context.terminals = terminals;

  const server = net.createServer((client) => {
    logger.info('client connected');
    const terminal = new Terminal(client, logger);
    terminals[terminal.key] = terminal;

    client.on('end', () => {
      terminal.terminate();
      delete terminals[terminal.key];
      logger.info('client disconnected');
    });

    let rTimeout;
    let rBuffer;

    client.on('data', (buffer) => {
      clearTimeout(rTimeout);

      if (rBuffer) {
        rBuffer = Buffer.concat([rBuffer, buffer], rBuffer.length + buffer.length);
      } else {
        rBuffer = buffer;
      }

      rTimeout = setTimeout(() => {
        terminal.log.push({ time: new Date(), method: 'TCP', data: rBuffer });
        logger.info('client', rBuffer);
        rBuffer = null;
      }, 200);
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
