// types/PbeDeriveKeyDTO.ts
export interface PbeDeriveKeyDTO {
  name: string;
  masterkeyRef: string;
  keySize: number;
  derivationAlgorithm: "HKDF" | "PBKDF2";
  ownerId: string;
}
