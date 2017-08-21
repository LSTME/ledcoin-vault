/* eslint class-methods-use-this: 0, no-bitwise: 0 */
const WebSocket = require('ws');
const uuid = require('uuid');
const Proto = require('../../utils/LedcoinProtocol');
const crypto = require('../../utils/crypto');

const PROMISE_TIMEOUT = 3000;
const FRAME_MAX_DELAY = 500;
const RPI_WEBSOCKET_PORT = 1880;
const RECONNECT_INTERVAL = 1000;

const proto = new Proto();

module.exports = class Terminal {
  constructor(socket, logger, dataSource) {
    this.logger = logger;
    this.socket = socket;
    this.key = `${socket.remoteAddress}`;
    this.log = [];
    this.isTerminated = false;
    this.requests = {};
    this.dataSource = dataSource;

    this.initTcpSocket();
    this.initWebsocket();
  }

  tell(command, args, expectResult = true) {
    const commandId = proto.Commands[command];
    if (commandId === undefined) {
      return Promise.reject(new Error(`Unknown command '${command}'`));
    }

    let targetChallenge;
    if (commandId === proto.Commands.GetAuth) {
      targetChallenge = Math.round(Math.random() * 0xFFFF);
      args.push(targetChallenge);
    }

    const data = proto[command](...args);

    const id = uuid.v4();
    this.lastId = id;

    const request = {
      id,
      time: new Date(),
      direction: 'out',
      method: 'TCP',
      data,
      meta: {
        command,
        commandId,
        args,
        startedAt: new Date(),
        targetChallenge,
      },
    };

    if (commandId === proto.Commands.GetAuth) {
      request.meta.targetChallenge = (data[2] << 8) | data[3];
    }

    this.log.push(request);

    if (expectResult) {
      return new Promise((resolve, reject) => {
        this.requests[id] = {
          callback: resolve,
          timeout: setTimeout(() => {
            reject(new Error(`Command ${command} timed out or does not have response`));
          }, PROMISE_TIMEOUT),
          meta: request.meta,
        };
        this.socket.write(data);
      });
    }

    return Promise.resolve(this.socket.write(data));
  }

  processTcpMessage(completeBuffer) {
    const id = this.lastId;

    const log = {
      id,
      time: new Date(),
      direction: 'in',
      method: 'TCP',
      data: completeBuffer,
      meta: {
        completedAt: new Date(),
      },
    };

    if (this.requests[id]) {
      const request = this.requests[id];

      if (request.callback) {
        request.callback(completeBuffer);
        delete request.callback;
      }

      if (request.timeout) {
        clearTimeout(request.timeout);
        delete request.timeout;
      }

      Object.assign(log.meta, request.meta);
      log.meta.duration = log.meta.completedAt - request.meta.startedAt;

      if (request.meta.commandId === proto.Commands.GetAuth) {
        const callerId = 0;
        const targetId = completeBuffer[0];
        const targetChallenge = request.meta.targetChallenge;

        const signature = (completeBuffer[1] << 8) | completeBuffer[2];
        if (proto.IsValid(callerId, targetId, targetChallenge, signature)) {
          this.logger.info('GetAuth signature correct');
        } else {
          this.logger.warning('Signature from wallet is invalid');
        }

        const callerChallenge = (completeBuffer[3] << 8) | completeBuffer[4];
        const callerSignature = crypto.M(targetId, callerId, callerChallenge);
        this.tell('SetAuth', [callerId, callerSignature], false);
      }
    }

    this.log.push(log);

    this.logger.info(`[TCP-${this.key}] incoming data`, completeBuffer);
  }

  initTcpSocket() {
    this.logger.info(`[TCP-${this.key}] CONNECTED`);

    this.socket.on('end', () => {
      this.terminate();
      if (this.onTerminate) this.onTerminate(this);
      this.logger.info(`[TCP-${this.key}] DISCONNECTED`);
    });

    let rTimeout;
    let rBuffer;

    this.socket.on('data', (buffer) => {
      clearTimeout(rTimeout);

      if (rBuffer) {
        rBuffer = Buffer.concat([rBuffer, buffer], rBuffer.length + buffer.length);
      } else {
        rBuffer = buffer;
      }

      rTimeout = setTimeout(() => {
        this.processTcpMessage(rBuffer);
        rBuffer = null;
      }, FRAME_MAX_DELAY);
    });

    this.socket.on('error', (error) => {
      this.logger.error(`[TCP-${this.key}] ERROR`, error);
    });
  }

  availableCommands() {
    return [
      'GetAuth',
      'DeAuth',
      'GetBalance',
      'EditBalance',
      'GetEEPROM',
      'WriteEEPROM',
      'SetBounty',
    ];
  }

  send(data) {
    this.log.push({
      time: new Date(),
      direction: 'out',
      method: 'WEBSOCKET',
      data,
    });
    this.logger.info(`[WS-${this.key}] SEND`, data);
    return this.websocket.send(JSON.stringify(data));
  }

  initWebsocket() {
    const wsAddress = `ws://[${this.socket.remoteAddress}]:${RPI_WEBSOCKET_PORT}/ws`;
    this.logger.info(`[WS-${this.key}] CONNECTING: ${wsAddress}`);
    const ws = new WebSocket(wsAddress);

    ws.on('open', () => {
      this.logger.info(`[WS-${this.key}] CONNECTED`);
      this.websocket = ws;
      this.send({ led: 'green', value: 'high' });
    });

    ws.on('close', () => {
      if (this.isTerminated) {
        this.logger.info(`[WS-${this.key}] DISCONNECTED`);
      } else {
        this.logger.info(`[WS-${this.key}] DISCONNECTED, ATTEMPTING RECONNECT`);
        setTimeout(() => this.initWebsocket(), RECONNECT_INTERVAL);
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
      this.logger.info(`[WS-${this.key}] incoming message (${JSON.stringify(message)})`);
      this.log.push({ time: new Date(), method: 'WEBSOCKET', data: message });
    });
  }

  deauth() {
    this.tell('DeAuth', [0]).catch(() => {
      this.log.info(`[${this.key}] DEAUTHENTICATED`);
    });
  }

  terminate() {
    this.isTerminated = true;

    if (this.websocket) {
      this.websocket.close();
    }
  }
};
