const LedcoinProtocol = require('./LedcoinProtocol');

const LP = new LedcoinProtocol();

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

console.log('GetBalance(Main):', LP.GetBalance(LP.BalanceCounter.Main));
console.log('GetBalance(Bounty):', LP.GetBalance(LP.BalanceCounter.Bounty));
console.log('GetBalance(Games):', LP.GetBalance(LP.BalanceCounter.Games));

console.log('EditBalance(AddLedcoin, 255):', LP.EditBalance(LP.OperationType.AddLedcoin, 255));
console.log('EditBalance(DeduceLedcoin, 255):', LP.EditBalance(LP.OperationType.DeduceLedcoin, 255));

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

const sig = crypto.M(255, 3, 1);
console.log(`SetBounty(1, 255, 3, ${sig})`, LP.SetBounty(1, 255, 3, sig), 'should be', [133, 0, 1, 255, 3, 39, 125, 111]);
