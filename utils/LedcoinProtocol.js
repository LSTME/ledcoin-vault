/* eslint no-bitwise: 0 */
const CRC8 = require('./crc8');

const crc = new CRC8();

const COMMANDS = {
  GetAuth: 1,
  SetAuth: 2,
  GetBalance: 3,
  SetBalance: 4,
  GetLog: 5,
  ShrinkLog: 6,
  SetReadyToGame: 7,
  SetGamePacket: 8,
  GetEEPROM: 14,
  WriteEEPROM: 15,
  SetBounty: 16,
};

const BalanceCounter = {
  Main: 0,
  Bounty: 1,
  Games: 2,
};

const OperationType = {
  AddLedcoin: 0,
  DeduceLedcoin: 1,
};

class LedcoinProtocol {
  static GetAuth(callerId, targetChallenge) {
    const body = new Uint8ClampedArray(3);
    body[0] = callerId;
    body[1] = (targetChallenge >> 8) & 255;
    body[2] = targetChallenge & 255;
    return LedcoinProtocol.BuildRequest(COMMANDS.GetAuth, body);
  }

  static SetAuth(callerId, callerSignature) {
    const body = new Uint8ClampedArray(2);
    body[0] = callerId;
    body[1] = (callerSignature >> 8) & 255;
    body[2] = callerSignature & 255;
    return LedcoinProtocol.BuildRequest(COMMANDS.SetAuth, body);
  }

  static GetBalance(counterId) {
    const body = new Uint8ClampedArray([counterId]);
    return LedcoinProtocol.BuildRequest(COMMANDS.GetBalance, body);
  }

  static SetBalance(operationType, value) {
    const body = new Uint8ClampedArray([operationType, value]);
    return LedcoinProtocol.BuildRequest(COMMANDS.SetBalance, body);
  }

  static GetLog(dataId) {
    const body = new Uint8ClampedArray([dataId]);
    return LedcoinProtocol.BuildRequest(COMMANDS.GetLog, body);
  }

  static ShrinkLog(dataId, keepCount) {
    const body = new Uint8ClampedArray([dataId, keepCount]);
    return LedcoinProtocol.BuildRequest(COMMANDS.ShrinkLog, body);
  }

  static SetReadyToGame(gameId) {
    const body = new Uint8ClampedArray([gameId]);
    return LedcoinProtocol.BuildRequest(COMMANDS.SetReadyToGame, body);
  }

  static SetGamePacket(gameId, packet) {
    const body = new Uint8ClampedArray([gameId].concat(packet));
    return LedcoinProtocol.BuildRequest(COMMANDS.SetGamePacket, body);
  }

  static GetEEPROM(address, length) {
    const body = new Uint8ClampedArray([
      (address >> 8) & 255,
      address & 255,
      (length >> 8) & 255,
      length & 255,
    ]);
    return LedcoinProtocol.BuildRequest(COMMANDS.GetEEPROM, body);
  }

  static WriteEEPROM(address, data) {
    const body = new Uint8ClampedArray(2 + data.length);
    body[0] = (address >> 8) & 255;
    body[1] = address & 255;
    data.forEach((d, i) => {
      body[i + 2] = d;
    });
    return LedcoinProtocol.BuildRequest(COMMANDS.WriteEEPROM, body);
  }

  static SetBounty(bountyId, recipient, value, signature) {
    const body = new Uint8ClampedArray([
      (bountyId >> 8) & 255,
      bountyId & 255,
      recipient,
      value,
      (signature >> 8) & 255,
      signature & 255,
    ]);
    return LedcoinProtocol.BuildRequest(COMMANDS.SetBounty, body);
  }

  static BuildRequest(commandId, body) {
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

    res[0] = (commandId << 3) | body.length;
    body.forEach((v, i) => {
      res[i + 1] = v;
    });
    res[res.length - 1] = crc.checksum(res);

    return res;
  }
}

const LP = LedcoinProtocol;

const sampleCallerId = 0xFF;
const sampleTargetChallenge = 0xFFFF;

console.log(
  `GetAuth(${sampleCallerId}, ${sampleTargetChallenge}): `,
  LP.GetAuth(sampleCallerId, sampleTargetChallenge),
);

const sampleCallerSignature = 0xFFFF;
console.log(
  `SetAuth(${sampleCallerId}, ${sampleCallerSignature}): `,
  LP.SetAuth(sampleCallerId, sampleCallerSignature),
);

console.log('GetBalance(Main):', LP.GetBalance(BalanceCounter.Main));
console.log('GetBalance(Bounty):', LP.GetBalance(BalanceCounter.Bounty));
console.log('GetBalance(Games):', LP.GetBalance(BalanceCounter.Games));

console.log('SetBalance(AddLedcoin, 255):', LP.SetBalance(OperationType.AddLedcoin, 255));
console.log('SetBalance(DeduceLedcoin, 255):', LP.SetBalance(OperationType.DeduceLedcoin, 255));

console.log('GetLog(255):', LP.GetLog(255));

console.log('ShrinkLog(255):', LP.ShrinkLog(255, 255));

console.log('SetReadyToGame(0):', LP.SetReadyToGame(0));
console.log('SetReadyToGame(1):', LP.SetReadyToGame(1));

console.log('SetGamePacket(0, [255,255,255]):', LP.SetGamePacket(0, [255, 255, 255]));
console.log('SetGamePacket(1, [63,31,255]):', LP.SetGamePacket(0, [63, 31, 255]));
console.log('SetGamePacket(1, [255]):', LP.SetGamePacket(1, [255]));
console.log('SetGamePacket(1, [255,63,31,127,255]):', LP.SetGamePacket(1, [255, 63, 31, 127, 255]));

const sampleAddress = 0x013D;
const sampleLength = 0xE1D3;
console.log(`GetEEPROM(${sampleAddress}, ${sampleLength})`, LP.GetEEPROM(sampleAddress, sampleLength));

console.log(`WriteEEPROM(${sampleAddress}, [1])`, LP.WriteEEPROM(sampleAddress, [1]));
console.log(`WriteEEPROM(${sampleAddress}, [1,2])`, LP.WriteEEPROM(sampleAddress, [1, 2]));
console.log(`WriteEEPROM(${sampleAddress}, [1,2,3])`, LP.WriteEEPROM(sampleAddress, [1, 2, 3]));
console.log(`WriteEEPROM(${sampleAddress}, [1,2,3,4])`, LP.WriteEEPROM(sampleAddress, [1, 2, 3, 4]));
console.log(`WriteEEPROM(${sampleAddress}, [1,2,3,4,5])`, LP.WriteEEPROM(sampleAddress, [1, 2, 3, 4, 5]));
console.log(`WriteEEPROM(${sampleAddress}, [1,2,3,4,5,6])`, LP.WriteEEPROM(sampleAddress, [1, 2, 3, 4, 5, 6]));

const sampleBountyId = 0xF1F2;
const sampleRecipient = 0xF3;
const sampleValue = 0xF4;
const sampleSignature = 0xF5F6;
console.log(`SetBounty(${sampleBountyId}, ${sampleRecipient}, ${sampleValue}, ${sampleSignature})`, LP.SetBounty(sampleBountyId, sampleRecipient, sampleValue, sampleSignature));

module.exports = LedcoinProtocol;
