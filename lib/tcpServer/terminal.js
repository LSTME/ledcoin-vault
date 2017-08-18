const WebSocket = require('ws');

const RPI_WEBSOCKET_PORT = 1880;
const RECONNECT_INTERVAL = 1000;

module.exports = class Terminal {
  constructor(socket, logger) {
    this.logger = logger;
    this.socket = socket;
    this.key = `${socket.remoteAddress}`;
    this.log = [];
    this.isTerminated = false;

    this.initWebsocket();
  }

  tell(data) {
    this.log.push({
      time: new Date(),
      direction: 'out',
      method: 'TCP',
      data,
    });
    return this.socket.write(data);
  }

  send(data) {
    this.log.push({
      time: new Date(),
      direction: 'out',
      method: 'WEBSOCKET',
      data,
    });
    this.logger.info('send', data);
    return this.websocket.send(JSON.stringify(data));
  }

  initWebsocket() {
    const wsAddress = `ws://[${this.socket.remoteAddress}]:${RPI_WEBSOCKET_PORT}/ws`;
    this.logger.info(`[WS-${this.key}] CONNECTING: ${wsAddress}`);
    const ws = new WebSocket(wsAddress);

    ws.on('open', () => {
      this.logger.info(`[WS-${this.key}] CONNECTED`);
      this.websocket = ws;
    });

    ws.on('close', () => {
      if (this.isTerminated) {
        this.logger.info(`[WS-${this.key}] DISCONNECTED`);
      } else {
        this.logger.info(`[WS-${this.key}] DISCONNECTED, ATTEMPTING RECONNECT`);
        setTimeout(() => ws.connect(), RECONNECT_INTERVAL);
      }
    });

    ws.on('error', (error) => {
      if (!this.isTerminated) {
        this.logger.error(`[WS-${this.key}] ERROR (${wsAddress}): ${error}`);
        // setTimeout(() => ws.connect(), RECONNECT_INTERVAL);
      }
    });

    ws.on('message', (data) => {
      const message = JSON.parse(data);
      this.logger.info(`[WS-${this.key}] incoming message (${message})`);
      this.log.push({ time: new Date(), method: 'WEBSOCKET', data: message });
    });
  }

  terminate() {
    this.isTerminated = true;

    if (this.websocket) {
      this.websocket.close();
    }
  }
};
