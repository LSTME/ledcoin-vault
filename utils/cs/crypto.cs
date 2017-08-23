using System;

namespace Ledcoin.Secret
{
    class Program
    {
        static ushort M(byte a, byte b, ushort c)
        {
            ushort rnd_state = (ushort)(a << 8 | b);
            ushort y = c;
            ushort t;

            Console.WriteLine($"{rnd_state} | {y}");

            for (uint i = 0; i < 8; i++)
            {
                t = (ushort)(y ^ (y << 5));
                y = rnd_state;
                ushort x = (ushort)(rnd_state ^ (rnd_state >> 1));
                rnd_state = (ushort)(x ^ (ushort)(t ^ (t >> 3)));
                Console.WriteLine($"{rnd_state} | {t} | {y} | {x}");
            }
            return (ushort)rnd_state;
        }

        static ushort T(ushort a)
        {
            return M(20, 17, a);
        }

        static void Main(string[] args)
        {
            ushort m = M(255, 3, 1);
            byte m1 = (byte)(m / 256);
            byte m2 = (byte)(m % 256);
            Console.WriteLine($"M(255, 3, 1): {m} {{{m1}, {m2}}}");
            Console.WriteLine("T(123): " + T(123));
        }
    }
}
