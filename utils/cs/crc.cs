using System;

namespace LedcoinUtils
{
    class Program
    {
        public static byte Crc(byte[] data)
        {
            const byte CRC8POLY = 0x9B;
            byte crc = 0;
            for (byte i = 0; i < data.Length; i++)
            {
                byte b = data[i];

                for (byte j = 0; j < 8; j++)
                {
                    byte feedback_bit = (byte)((crc ^ b) & 0x01);

                    if (feedback_bit == 0x01)
                    {
                        crc = (byte)(crc ^ CRC8POLY);
                    }
                    crc = (byte)((crc >> 1) & 0x7F);
                    if (feedback_bit == 0x01)
                    {
                        crc = (byte)(crc | 0x80);
                    }

                    b = (byte)(b >> 1);
                }

            }
            return crc;
        }

        static void Main(string[] args)
        {
            byte[] data = { 133, 0, 1, 255, 3, 39, 125 };
            byte crc = Crc(data);
            Console.WriteLine($"Calculated CRC: {crc}");
        }
    }
}
