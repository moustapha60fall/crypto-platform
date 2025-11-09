import type { CryptoAlgorithm, KeyType } from "@/types/crypto.ts";

export interface KeyMaterial {
    id: number
    name: string
    purpose?: string
    keyType: KeyType;
    algorithm: CryptoAlgorithm;
    encodedKey?: string
    keyRef: string
    ownerId?: string
    createdAt: string
    deprecated: boolean
}
