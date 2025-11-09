import type { CryptoAlgorithm, PaddingType } from "./crypto";

export interface AsymmetricCryptoDTO {
    publicKeyRef?: string;       // Référence vers la clé publique (ex: UUID ou nom)
    privateKeyRef?: string;      // Référence vers la clé privée
    inputData?: string;          // Données en base64 à chiffrer ou déchiffrer
    outputData?: string;        // Résultat en base64 (optionnel, rempli après traitement)
    performedById: string;      // ID de l'utilisateur ayant initié l'opération
    algorithm?: CryptoAlgorithm;
    padding?: PaddingType
}
