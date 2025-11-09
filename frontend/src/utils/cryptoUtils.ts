import { CryptoAlgorithms, PaddingTypes, SymmetricModes, type CryptoAlgorithm, type PaddingType, type SymmetricMode } from "@/types/crypto";

// ===============================
// 🧠 Fonctions utilitaires
// ===============================

/**
 * Détermine le padding par défaut en fonction de l'algorithme.
 */
export function resolveDefaultPadding(algo: CryptoAlgorithm): PaddingType {
  switch (algo) {
    case CryptoAlgorithms.RSA:
      return PaddingTypes.OAEP;
    case CryptoAlgorithms.ELGAMAL:
      return PaddingTypes.PKCS1_V1_5;
    case CryptoAlgorithms.ECC:
    case CryptoAlgorithms.ECDSA:
    case CryptoAlgorithms.EDDSA:
      return PaddingTypes.NOPADDING;
    default:
      return PaddingTypes.NOPADDING;
  }
}

/**
 * Résout le padding typique selon le mode de chiffrement symétrique.
 */
export function resolvePadding(mode: SymmetricMode): "PKCS5Padding" | "NOPADDING" {
  switch (mode) {
    case SymmetricModes.GCM:
    case SymmetricModes.CCM:
    case SymmetricModes.XTS:
    case SymmetricModes.CTR:
      return "NOPADDING";
    default:
      return "PKCS5Padding";
  }
}

/**
 * 🔍 Vérifie la compatibilité algo ↔ padding avant appel backend.
 * (empêche des erreurs comme "Tag mismatch!" ou "Invalid padding".)
 */
export function validateAlgorithmPaddingCompatibility(
  algo: CryptoAlgorithm,
  padding?: PaddingType
): void {
  if (!padding) return;

  const rsaPaddings: readonly PaddingType[] = [
    PaddingTypes.OAEP,
    PaddingTypes.PKCS1_V1_5,
  ];

  const aesPaddings: readonly PaddingType[] = [
    PaddingTypes.PKCS5,
    PaddingTypes.PKCS5Padding,
    PaddingTypes.NOPADDING,
  ];

  switch (algo) {
    case CryptoAlgorithms.RSA:
      if (!rsaPaddings.includes(padding))
        throw new Error(
          `Padding ${padding} n’est pas valide pour RSA (choisir OAEP ou PKCS1_V1_5).`
        );
      break;

    case CryptoAlgorithms.AES:
    case CryptoAlgorithms.TRIPLE_DES:
    case CryptoAlgorithms.BLOWFISH:
      if (!aesPaddings.includes(padding))
        throw new Error(
          `Padding ${padding} n’est pas compatible avec ${algo} (choisir PKCS5Padding ou NoPadding).`
        );
      break;

    default:
      if (padding !== PaddingTypes.NOPADDING)
        throw new Error(`Padding ${padding} non applicable pour ${algo}.`);
      break;
  }
}

export function base64EncodeUtf8(str: string): string {
  return btoa(unescape(encodeURIComponent(str)));
}

export function base64DecodeUtf8(str: string): string {
  return decodeURIComponent(escape(atob(str)));
}
