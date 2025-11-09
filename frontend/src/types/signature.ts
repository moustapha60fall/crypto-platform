import type { CryptoAlgorithm, HashFunction } from "./crypto";

export interface SignatureDTO {
  message: string;

  /** Signature générée (base64 ou hex) */
  signature?: string;

  /** Référence vers la clé publique utilisée pour vérification */
  publicKeyRef?: string;

  /** Référence vers la clé privée utilisée pour signature */
  privateKeyRef?: string;

  /** Algorithme de signature (RSA, ECDSA, EDDSA...) */
  algorithm?: CryptoAlgorithm;

  /** Fonction de hachage utilisée avant signature */
  hashFunction?: HashFunction;

  /** Format de sortie (true → Base64, false → hex) */
  base64Output?: boolean;

  /** Identifiant de l’utilisateur ayant effectué l’opération */
  performedById: string;
}


export interface SignatureVerifyDTO {
  message: string;         // Message original à vérifier
  signatureHex: string;    // Signature en hexadécimal
}
