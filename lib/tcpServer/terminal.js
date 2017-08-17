const io = require('socket.io-client');

const RPI_WEBSOCKET_PORT = 8080;

module.exports = class Terminal {
  constructor(socket, logger) {
    this.logger = logger;
    this.socket = socket;
    this.key = `${socket.remoteAddress}_${socket.remotePort}`;
    this.log = [];

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
    const ws = io(wsAddress);

    ws.on('connect', () => {
      this.logger.info(`[WS-${this.key}] CONNECTED`);
      this.websocket = ws;
    });

    ws.on('connect_error', (error) => {
      this.logger.error(`[WS-${this.key}] CONNECT_ERROR: ${error.message}`);
    });

    ws.on('disconnect', () => {
      this.logger.info(`[WS-${this.key}] DISCONNECTED`);
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
    this.websocket.close();
  }
};
