const io = require('socket.io-client');

const RPI_WEBSOCKET_PORT = 8080;
const RECONNECT_INTERVAL = 1000;

module.exports = class Terminal {
  constructor(socket, logger) {
    this.logger = logger;
    this.socket = socket;
    this.key = `${socket.remoteAddress}_${socket.remotePort}`;
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

  emit(event, data) {
    this.log.push({
      time: new Date(),
      direction: 'out',
      method: 'WEBSOCKET',
      event,
      data,
    });
    this.logger.info('emit', event, data);
    return this.websocket.emit(event, data);
  }

  initWebsocket() {
    const wsAddress = `http://[${this.socket.remoteAddress}]:${RPI_WEBSOCKET_PORT}`;
    this.logger.info(`[WS-${this.key}] CONNECTING: ${wsAddress}`);
    const ws = io(wsAddress, {
      reconnection: false,
    });

    ws.on('connect', () => {
      this.logger.info(`[WS-${this.key}] CONNECTED`);
      this.websocket = ws;
    });

    ws.on('connect_error', (error) => {
      if (!this.isTerminated) {
        this.logger.error(`[WS-${this.key}] CONNECT_ERROR (${wsAddress}): ${error.message}`);
        setTimeout(() => ws.connect(), RECONNECT_INTERVAL);
      }
    });

    ws.on('disconnect', () => {
      if (this.isTerminated) {
        this.logger.info(`[WS-${this.key}] DISCONNECTED`);
      } else {
        this.logger.info(`[WS-${this.key}] DISCONNECTED, ATTEMPTING RECONNECT`);
        setTimeout(() => ws.connect(), RECONNECT_INTERVAL);
      }
    });

    ws.on('error', (error) => {
      this.logger.error(`[WS-${this.key}] ERROR: ${error.message}`);
    });

    ws.on('pin:list', (data) => {
      this.logger.info(`[WS-${this.key}] pin:list`);
      this.log.push({ time: new Date(), method: 'WEBSOCKET', event: 'pin:list', data });
    });

    ws.on('pin:read', (data) => {
      this.logger.info(`[WS-${this.key}] pin:read`);
      this.log.push({ time: new Date(), method: 'WEBSOCKET', event: 'pin:read', data });
    });
  }

  terminate() {
    this.isTerminated = true;

    if (this.websocket) {
      this.websocket.close();
    }
  }
};
