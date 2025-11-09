import type { CryptoAlgorithm, PaddingType, SymmetricMode } from "./crypto";

export interface SymmetricCryptoDTO {
  keyRef: string;           // Référence vers la clé AES (UUID ou nom)
  inputData?: string;        // Données à chiffrer/déchiffrer (base64)
  outputData?: string;      // Résultat (base64), rempli après traitement
  inputFile?: string;
  outputFile?: string;
  performedById: string;    // ID de l'utilisateur ayant initié l'opération
  mode?: SymmetricMode;         // CBC, ECB, etc.
  algorithm: CryptoAlgorithm;
  padding: PaddingType
}
