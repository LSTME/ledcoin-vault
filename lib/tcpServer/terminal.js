/* eslint class-methods-use-this: 0, no-bitwise: 0 */
const WebSocket = require('ws');
const uuid = require('uuid');
const Proto = require('../../utils/LedcoinProtocol');
const crypto = require('../../utils/crypto');
const _ = require('lodash');

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
      this.info(`Unknown command '${command}'`);
      return Promise.reject(new Error(`Unknown command '${command}'`));
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
      },
    };

    this.log.push(request);

    if (expectResult) {
      return new Promise((resolve, reject) => {
        this.requests[id] = {
          callback: resolve,
          timeout: setTimeout(() => {
            this.info(`Command ${command} timed out or does not have response`);
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
    let callback;

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
        callback = request.callback;
        delete request.callback;
      }

      if (request.timeout) {
        clearTimeout(request.timeout);
        delete request.timeout;
      }

      Object.assign(log.meta, request.meta);
      log.meta.duration = log.meta.completedAt - request.meta.startedAt;

      if (request.meta.commandId === 1) {
        this.connectedWalletId = completeBuffer[0];
      }
    }

    this.log.push(log);

    this.logger.info(`[TCP-${this.key}] incoming data`, completeBuffer);

    if (callback) callback(completeBuffer);
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
      'GetLog',
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

      if (message.button === 'pi/15' && message.event === 'pressed') {
        this.handleButtonPress();
      }
    });
  }

  auth() {
    const callerId = 0;
    const targetChallenge = Math.round(Math.random() * 0xFFFF);
    const args = [callerId, targetChallenge];

    return this.tell('GetAuth', args).then((res) => {
      const responseObject = {
        targetId: res[0],
        targetSignature: (res[1] << 8) | res[2],
        callerChallenge: (res[3] << 8) | res[4],
      };

      if (!proto.IsValid(callerId, responseObject.targetId, targetChallenge, responseObject.targetSignature)) {
        this.info('Signature from wallet is invalid');
        return false;
      }

      this.info('GetAuth signature correct, sending response');

      const callerSignature = crypto.M(responseObject.targetId, callerId, responseObject.callerChallenge);
      return this.tell('SetAuth', [callerId, callerSignature], false)
        .then(() => { this.authId = responseObject.targetId; })
        .then(() => responseObject); // auth() should return response from GetAuth command
    })
      .catch((e) => {
        console.error(e);
      });
  }

  deauth() {
    return this.tell('DeAuth', [0], false).then(() => {
      delete this.authId;
      delete this.connectedWalletId;

      this.info('DEAUTHENTICATED');
    });
  }

  /*
    Use to set wallet balance
    1. Authenticate
    2. Read logs of scanned bounties
    3. Create bounty transactions for new scans
    4. Calculate new total balance
    5. Write new balance back to wallet
    6. Deauth
   */
  async syncWalletBalance(walletId) {
    try {
      this.toggleRedLed(true);

      // 1. Authenticate
      const authResponse = await this.auth();

      // Only if walletId is defined, verify correctness of received id
      if (walletId !== undefined) {
        if (authResponse.targetId !== walletId) {
          const message = `Wallet [${authResponse.targetId}] does not match [${walletId}]`;
          this.info(message, 'SYNC');
          throw new Error(message);
        }
        this.info(`Correct wallet ID [${walletId}]`, 'SYNC');
      }

      // 2. Read logs of scanned bounties
      const log = await this.readLog(0);

      this.info(`GetLog: ${JSON.stringify(log)}`);

      // 3. Create bounty transactions for new scans
      // Get transactions with type 'bounty' for wallet
      const createdTransactions = await this.syncTransactions(authResponse.targetId, log);

      this.info(`Created ${createdTransactions.length} transactions`);

      // 4. Calculate new total balance
      const transactions = await this.dataSource.getTransactionsForWallet(authResponse.targetId);
      const value = transactions.reduce((acc, t) => acc + Number(t.deltaCoin), 0);

      // 5. Write new balance back to wallet
      this.info(`Syncing [${value}] ledcoins to wallet [${authResponse.targetId}]`, 'SYNC');
      await this.tell('WriteEEPROM', [2, [(value >> 8) & 0xFF, value & 0xFF]]);

      // 6. Deauth
      this.toggleRedLed(false);
      this.deauth();
    } catch (error) {
      const resultMessage = `Error running procedure syncWalletBalance: ${error}`;
      this.info(resultMessage);
      this.toggleRedLed(false);
      this.deauth();
      return resultMessage;
    }

    return null; // Return null if no error was caught
  }

  async readLog(type) {
    this.info(`Loading log: ${type === 0 ? 'BOUNTIES' : 'GAMES'}`);

    const logBuffer = await this.tell('GetLog', [type]);
    const response = new Proto.GetLogResponse(logBuffer, 0);

    return response;
  }

  async syncTransactions(walletId, log) {
    // Get existing bounty transactions
    const bountyTransactions = (await this.dataSource.getTransactions({
      attributes: ['targetId'],
      where: {
        walletId,
        type: 'bounty',
      },
    })).map(t => t.targetId); // and pluck ids

    // Get all bounties
    const bounties = _.keyBy(await this.dataSource.getBounties(), 'code');

    // Remove records that already have transactions
    const newlyScannedBounties = log.records
      .filter(rec => !bountyTransactions.includes(rec.targetId))
      .map(rec => bounties[rec.targetId.toString()]) // ... transform to bounties
      .filter(r => r); // ... filter nonexisting bounties

    this.info(`New bounties: ${newlyScannedBounties.map(b => `${b.code}(${b.id})`).join(',')}`);

    // Create transactions for new bounties
    const newTransactions = newlyScannedBounties.map(b => ({
      walletId,
      deltaCoin: b.value,
      description: b.description,
      type: 'bounty',
      targetId: b.code,
    }));
    return this.dataSource.createTransactions(newTransactions);
  }

  toggleRedLed(on) {
    this.send({ led: 'red', value: (on ? 'high' : 'low') });
  }

  handleButtonPress() {
    this.syncWalletBalance();
  }

  info(message, prefix, level = 'info') {
    // const log = this.logger[level];
    // log[level](`[${prefix ? `${prefix}-` : ''}${this.key}] ${message}`);
    console.log(`[${prefix ? `${prefix}-` : ''}${this.key}] ${message}`);
  }

  terminate() {
    this.isTerminated = true;

    if (this.websocket) {
      this.websocket.close();
    }
  }
};
