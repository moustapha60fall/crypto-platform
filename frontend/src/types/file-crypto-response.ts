import type { CryptoPrimitiveType } from "./crypto";

export interface FileCryptoResponseDTO {

    inputFile: string;
    outputFile: string;
    operation: CryptoPrimitiveType;
}
