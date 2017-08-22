/* eslint no-bitwise: 0, func-names: 0 */
const crc = require('./crc8');
const crypto = require('./crypto');

const BYTE = 0xFF;

function LedcoinProtocol() {
  this.Commands = {
    GetAuth: 1,
    SetAuth: 2,
    DeAuth: 2,
    GetBalance: 3,
    EditBalance: 4,
    GetLog: 5,
    ShrinkLog: 6,
    SetReadyToGame: 7,
    SetGamePacket: 8,
    GetEEPROM: 14,
    WriteEEPROM: 15,
    SetBounty: 16,
  };

  this.BalanceCounter = {
    Main: 0,
    Bounty: 1,
    Games: 2,
  };

  this.OperationType = {
    AddLedcoin: 0,
    DeduceLedcoin: 1,
  };

  this.BuildRequest = (commandId, body) => {
    if (body.constructor.name !== 'Uint8ClampedArray') {
      throw new Error(`Wrong body type: ${body.constructor.name}`);
    }

    if (body.length > 8) {
      throw new Error(`Body length out of range: ${body.length}`);
    }

    // 1 x CCCC CLLL - header: command_id + body length (1 byte)
    // 8 x BBBB BBBB - body (1 ~ 8 bytes)
    // 1 x RRRR RRRR - CRC (1 byte)
    const res = new Uint8ClampedArray(body.length + 2);

    res[0] = (commandId << 3) | (body.length - 1);
    body.forEach((v, i) => { res[i + 1] = v; });
    res[res.length - 1] = crc.checksum(res.slice(0, -1));

    return Buffer(res);
  };
}

LedcoinProtocol.prototype.GetAuth = function (callerId, targetChallenge) {
  const body = new Uint8ClampedArray([
    callerId,
    BYTE & (targetChallenge >> 8),
    BYTE & targetChallenge,
  ]);
  return this.BuildRequest(this.Commands.GetAuth, body);
};

LedcoinProtocol.prototype.IsValid = function (callerId, targetId, targetChallenge, signature) {
  const correct = crypto.M(callerId, targetId, targetChallenge);
  return signature === correct;
};

LedcoinProtocol.prototype.SetAuth = function (callerId, callerSignature) {
  const body = new Uint8ClampedArray([
    callerId,
    BYTE & (callerSignature >> 8),
    BYTE & callerSignature,
  ]);
  return this.BuildRequest(this.Commands.SetAuth, body);
};

LedcoinProtocol.prototype.DeAuth = function (callerId) {
  const body = new Uint8ClampedArray([
    callerId, 0, 0,
  ]);
  return this.BuildRequest(this.Commands.DeAuth, body);
};

LedcoinProtocol.prototype.GetBalance = function (counterId) {
  const body = new Uint8ClampedArray([counterId]);
  return this.BuildRequest(this.Commands.GetBalance, body);
};

LedcoinProtocol.prototype.EditBalance = function (operationType, value) {
  const body = new Uint8ClampedArray([operationType, value]);
  return this.BuildRequest(this.Commands.EditBalance, body);
};

LedcoinProtocol.prototype.GetLog = function (dataId) {
  const body = new Uint8ClampedArray([dataId]);
  return this.BuildRequest(this.Commands.GetLog, body);
};

LedcoinProtocol.prototype.ShrinkLog = function (dataId, keepCount) {
  const body = new Uint8ClampedArray([dataId, keepCount]);
  return this.BuildRequest(this.Commands.ShrinkLog, body);
};

LedcoinProtocol.prototype.SetReadyToGame = function (gameId) {
  const body = new Uint8ClampedArray([gameId]);
  return this.BuildRequest(this.Commands.SetReadyToGame, body);
};

LedcoinProtocol.prototype.SetGamePacket = function (gameId, packet) {
  const body = new Uint8ClampedArray([gameId].concat(packet));
  return this.BuildRequest(this.Commands.SetGamePacket, body);
};

LedcoinProtocol.prototype.GetEEPROM = function (address, length) {
  const body = new Uint8ClampedArray([
    BYTE & (address >> 8),
    BYTE & address,
    BYTE & (length >> 8),
    BYTE & length,
  ]);
  return this.BuildRequest(this.Commands.GetEEPROM, body);
};

LedcoinProtocol.prototype.WriteEEPROM = function (address, data) {
  const body = new Uint8ClampedArray(2 + data.length);
  body[0] = BYTE & (address >> 8);
  body[1] = BYTE & address;
  data.forEach((d, i) => {
    body[i + 2] = d;
  });
  return this.BuildRequest(this.Commands.WriteEEPROM, body);
};

LedcoinProtocol.prototype.SetBounty = function (bountyId, recipient, value) {
  const body = new Uint8ClampedArray(6);
  body[0] = BYTE & (bountyId >> 8);
  body[1] = BYTE & bountyId;
  body[2] = BYTE & recipient;
  body[3] = BYTE & value;

  const sig = crypto.M(recipient, value, bountyId);
  body[4] = BYTE & (sig >> 8);
  body[5] = BYTE & sig;

  return this.BuildRequest(this.Commands.SetBounty, body);
};

module.exports = LedcoinProtocol;
