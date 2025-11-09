import type { CryptoAlgorithm, CryptoPrimitiveType, CryptoServiceType } from "@/types/crypto.ts";

export interface CryptoOperation {
    id?: number;
    serviceType: CryptoServiceType;
    primitiveType: CryptoPrimitiveType;
    algorithm: CryptoAlgorithm;
    status?: string;
    metadata?: string;
    inputDataEncrypted?: string;
    outputDataEncrypted?: string;
    performedById: string;
    keyMaterialId: number;
    createdAt?: string;
}
