// ===============================
// 🔑 Algorithmes crypto supportés
// ===============================
export const CryptoAlgorithms = {
  AES: "AES",
  TRIPLE_DES: "TRIPLE_DES",
  BLOWFISH: "BLOWFISH",
  RC4: "RC4",
  CHACHA20: "CHACHA20",

  RSA: "RSA",
  DSA: "DSA",
  ECC: "ECC",
  ELGAMAL: "ELGAMAL",

  SHA256: "SHA256",
  SHA512: "SHA512",
  SHA3: "SHA3",
  BLAKE2: "BLAKE2",

  HMACSHA256: "HMACSHA256",
  HMACSHA512: "HMACSHA512",
  CMAC: "CMAC",

  ECDSA: "ECDSA",
  EDDSA: "EDDSA",
} as const;

export type CryptoAlgorithm = typeof CryptoAlgorithms[keyof typeof CryptoAlgorithms];


// ===============================
// 🧩 Paddings
// ===============================
export const PaddingTypes = {
  NOPADDING: "NOPADDING",
  PKCS5: "PKCS5",
  PKCS7: "PKCS7",
  PKCS5Padding: "PKCS5Padding",
  PKCS7Padding: "PKCS7Padding",
  NONE: "NONE",
  OAEP: "OAEP",
  PKCS1_V1_5: "PKCS1_V1_5",
} as const;

export type PaddingType = typeof PaddingTypes[keyof typeof PaddingTypes];

// ===============================
// 🔢 Modes symétriques
// ===============================
export const SymmetricModes = {
  ECB: "ECB",
  CBC: "CBC",
  CFB: "CFB",
  OFB: "OFB",
  CTR: "CTR",
  GCM: "GCM",
  CCM: "CCM",
  XTS: "XTS",
} as const;

export type SymmetricMode = typeof SymmetricModes[keyof typeof SymmetricModes];

export const HashFunctions = {
  NONE: "NONE",
  SHA256: "SHA256",
  SHA512: "SHA512",
  SHA3_256: "SHA3_256",
  BLAKE2B: "BLAKE2B",
} as const;

export type HashFunction = typeof HashFunctions[keyof typeof HashFunctions];

// 🔒 Types de primitives cryptographiques
export const CryptoPrimitiveTypes = {
    ENCRYPTION: "ENCRYPTION",
    DECRYPTION: "DECRYPTION",
    HASHING: "HASHING",
    SIGNATURE: "SIGNATURE",
    KEY_DERIVATION: "KEY_DERIVATION",
} as const;
export type CryptoPrimitiveType = typeof CryptoPrimitiveTypes[keyof typeof CryptoPrimitiveTypes];

// 🛡️ Services de sécurité
export const CryptoServiceTypes = {
    CONFIDENTIALITY: "CONFIDENTIALITY",
    INTEGRITY: "INTEGRITY",
    AUTHENTICITY: "AUTHENTICITY",
    NON_REPUDIATION: "NON_REPUDIATION",
} as const;
export type CryptoServiceType = typeof CryptoServiceTypes[keyof typeof CryptoServiceTypes];

// 🔑 Types de clés
export const KeyTypes = {
    SYMMETRIC: "SYMMETRIC",
    ASYMMETRIC_PUBLIC: "ASYMMETRIC_PUBLIC",
    ASYMMETRIC_PRIVATE: "ASYMMETRIC_PRIVATE",
} as const;
export type KeyType = typeof KeyTypes[keyof typeof KeyTypes];
