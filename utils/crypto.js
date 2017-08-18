/* eslint no-bitwise: 0, no-plusplus: 0 */

// bytes are handled by & 0xFF
// ushorts are handled by & 0xFFFF

const Crypto = {
  /**
   * @param {byte} a
   * @param {byte} b
   * @param {ushort} c
   * @returns {ushort} result
   */
  M(a, b, c) {
    const usA = a & 0xFF;
    const usB = b & 0xFF;
    const usC = c & 0xFF;
    let usRndState = ((usA << 8) | usB) & 0xFFFF;
    let y = usC;
    let t = 0;

    console.log(usRndState, y);

    for (let i = 0; i < 8; i++) {
      t = (y ^ (y << 5)) & 0xFFFF;
      y = usRndState;
      const usX = (usRndState ^ (usRndState >> 1)) & 0xFFFF;
      usRndState = (usX ^ ((t ^ (t >> 3)) & 0xFFFF)) & 0xFFFF;
    }

    return usRndState;
  },

  /**
   * @param {ushort} a
   * @return {ushort} result
   */
  T(a) {
    return this.M(20, 17, a);
  },
};

console.log(`M(255, 3, 1): ${Crypto.M(255, 3, 1)} should be 10109 {39, 125}`);
console.log(`T(123): ${Crypto.T(123)} should be 78`);

module.exports = Crypto;
