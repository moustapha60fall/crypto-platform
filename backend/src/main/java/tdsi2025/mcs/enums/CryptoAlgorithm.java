package tdsi2025.mcs.enums;

public enum CryptoAlgorithm {

      // Symmetric
      AES, TRIPLE_DES, BLOWFISH, RC4, CHACHA20, CHACHA20_POLY1305,

      // Asymmetric
      RSA, DSA, ECC, ELGAMAL,

      // Hash
      SHA256, SHA512, SHA3, BLAKE2,

      // MAC
      HMACSHA256, HMACSHA512, CMAC,

      // Signature
      ECDSA, EDDSA,
}
