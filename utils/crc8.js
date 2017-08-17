// "Class" for calculating CRC8 checksums...
class CRC8 {
  constructor() {
    this.table = CRC8.generateTable(0x9b);
  }

  // Returns the 8-bit checksum given an array of byte-sized numbers
  checksum(byte_array) {
    let c = 0;
    for (let i = 0; i < byte_array.length; i++) {
      c = this.table[(c ^ byte_array[i]) % 256];
    }
    return c;
  }

  // returns a lookup table byte array given one of the values from CRC8.POLY
  static generateTable(polynomial) {
    const csTable = []; // 256 max len byte array

    for (let i = 0; i < 256; ++i) {
      let curr = i;
      for (let j = 0; j < 8; ++j) {
        if ((curr & 0x80) !== 0) {
          curr = ((curr << 1) ^ polynomial) % 256;
        } else {
          curr = (curr << 1) % 256;
        }
      }
      csTable[i] = curr;
    }

    return csTable;
  }
}

module.exports = CRC8;
