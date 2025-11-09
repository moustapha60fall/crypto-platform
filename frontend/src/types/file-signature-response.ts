import type { CryptoPrimitiveType } from "./crypto";

export interface FileSignatureResponseDTO {
    inputFile: string;   // Nom du fichier d'entrée
    outputFile: string;  // Nom du fichier résultant (signé ou vérifié)
    signature?: string;  // Signature Base64/Hex (si sign)
    verified?: boolean;  // Résultat de vérification (si verify)
    operation: CryptoPrimitiveType; // SIGNATURE ou VERIFICATION
}
