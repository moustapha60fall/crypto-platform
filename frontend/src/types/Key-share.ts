export interface KeyShareDTO {
  id?: number;
  keyMaterialId: number;
  sharedByUserId: string;
  sharedWithUserId: string;
  encodedKey?: string; // 👈 clé publique en Base64
  algorithm?: string;
}
