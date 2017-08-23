/* eslint no-param-reassign: 0 */
const net = require('net');

const logger = require('./logger');
const DataSource = require('./DataSource');

const Terminal = require('./tcpServer/terminal');

module.exports = async (environment, context) => {
  const terminals = {};
  const config = context.config;
  const db = context.db;
  const dataSource = new DataSource(config, db);

  context.terminals = terminals;

  const server = net.createServer((client) => {
    const terminal = new Terminal(client, logger, dataSource);
    terminals[terminal.key] = terminal;
    terminal.onTerminate = t => delete terminals[t.key];
  });

  server.on('error', (err) => {
    console.error('server error', err);
  });

  server.listen(config.tcp.port, () => {
    logger.info(`TCP server started at localhost:${config.tcp.port}`);
  });
};
