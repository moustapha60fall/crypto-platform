import type { CryptoAlgorithm, PaddingType } from "./crypto";

export interface WrappedKeyDTO {
    algorithm: CryptoAlgorithm;       // "RSA" ou "AES"
    padding?: PaddingType;          // "OAEP", "PKCS5Padding", etc.
    wrappingKeyRef: string;           // Référence de la clé utilisée pour envelopper
    targetKeyRef?: string;             // Référence de la clé à envelopper
    targetKeyType?: string;           // "AES", "DES", etc.

    wrappedKeyBase64?: string;        // Résultat de l’enveloppement
    unwrappedKeyBase64?: string;      // Résultat du désenveloppement

    performedById?: string;           // ID de l'utilisateur ayant effectué l'opération
}
