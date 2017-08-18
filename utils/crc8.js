/* eslint no-bitwise: 0, no-plusplus: 0 */

// bytes are handled by & 0xFF
const BYTE = 0xFF;

const CRC = {
  checksum(byteArray) {
    // const byte CRC8POLY = 0x9B;
    const CRC8POLY = 0x9B;
    // byte crc = 0;
    let crc = 0;

    // for (byte i = 0; i < data.Length; i++)
    for (let i = 0; i < byteArray.length; i++) {
      let b = byteArray[i] & BYTE;

      for (let j = 0; j < 8; j++) {
        const feedbackBit = (crc ^ b) & 0x01;

        if (feedbackBit === 0x01) {
          crc = (crc ^ CRC8POLY) & BYTE;
        }

        crc = ((crc >> 1) & 0x7f) & BYTE;

        if (feedbackBit === 0x01) {
          crc = (crc | 0x80) & BYTE;
        }

        b = (b >> 1) & BYTE;
      }
    }

    return crc;
  },
};

module.exports = CRC;
