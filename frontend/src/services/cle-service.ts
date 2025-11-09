import axiosClient from "@/api/axiosClient";
import type { KeyMaterial } from "@/types/key-material";
import type { KeyShareDTO } from "@/types/Key-share";
import type { PbeDeriveKeyDTO } from "@/types/pbe";

const BASE_URL = "/keys";

export const CleService = {


  // -----------------------------
  // Génération d'une clé
  // -----------------------------
  async generateKey(
    algorithm: string,
    size: number = 0,
    name: string = "default-key",
    ownerId: string
  ): Promise<Record<string, KeyMaterial>> {
    const params = { algorithm, size, name, ownerId };
    const res = await axiosClient.post<Record<string, KeyMaterial>>(`${BASE_URL}/generate`, null, { params });
    return res.data;
  },

  // -----------------------------
  // Dérivation d’une clé à partir d’une clé maîtresse (HKDF / PBE)
  // -----------------------------
  async deriveKey(dto: PbeDeriveKeyDTO): Promise<KeyMaterial> {
    const res = await axiosClient.post<KeyMaterial>(`${BASE_URL}/derive`, dto);
    return res.data;
  },

  // -----------------------------
  // Partage d'une clé avec un autre utilisateur
  // -----------------------------
  async shareKey(dto: KeyShareDTO): Promise<KeyShareDTO> {
    const res = await axiosClient.post<KeyShareDTO>(`${BASE_URL}/share`, dto);
    return res.data;
  },

  // -----------------------------
  // Récupérer tous les partages (par ou pour moi)
  // -----------------------------
  async getAllShares(userId: string): Promise<{
    sharedByMe: KeyShareDTO[]
    sharedWithMe: KeyShareDTO[]
  }> {
    const res = await axiosClient.get(`${BASE_URL}/shares`, { params: { userId } });
    return res.data;
  },

  // -----------------------------
  // Récupérer les clés partagées avec moi
  // -----------------------------
  async getKeysSharedWithMe(userId: string): Promise<KeyShareDTO[]> {
    const res = await axiosClient.get<KeyShareDTO[]>(`${BASE_URL}/shared-with-me/${userId}`);
    return res.data;
  },

  // -----------------------------
  // Récupérer les clés que j'ai partagées
  // -----------------------------
  async getKeysSharedByMe(userId: string): Promise<KeyShareDTO[]> {
    const res = await axiosClient.get<KeyShareDTO[]>(`${BASE_URL}/shared-by-me/${userId}`);
    return res.data;
  },

  // -----------------------------
  // Récupération par ID
  // -----------------------------
  async getKeyById(id: number): Promise<KeyMaterial> {
    const res = await axiosClient.get<KeyMaterial>(`${BASE_URL}/${id}`);
    return res.data;
  },

  // -----------------------------
  // Récupération par keyRef
  // -----------------------------
  async getByKeyRef(keyRef: string): Promise<KeyMaterial> {
    const res = await axiosClient.get<KeyMaterial>(`${BASE_URL}/ref/${keyRef}`);
    return res.data;
  },

  // -----------------------------
  // Liste des clés avec pagination
  // -----------------------------
  async getAll(page: number = 0, size: number = 20): Promise<KeyMaterial[]> {
    const res = await axiosClient.get<KeyMaterial[]>(`${BASE_URL}`, { params: { page, size } });
    return res.data;
  },

  // -----------------------------
  // Récupérer toutes les clés de l'utilisateur courant
  // -----------------------------
  async getAllKeys(): Promise<KeyMaterial[]> {
    const res = await axiosClient.get<KeyMaterial[]>(`${BASE_URL}/all`);
    return res.data;
  },

  // -----------------------------
  // Clés par propriétaire
  // -----------------------------
  async getByOwner(ownerId: string): Promise<KeyMaterial[]> {
    const res = await axiosClient.get<KeyMaterial[]>(`${BASE_URL}/owner/${ownerId}`);
    return res.data;
  },

  // -----------------------------
  // Déprécier une clé
  // -----------------------------
  async deprecate(id: number): Promise<KeyMaterial> {
    const res = await axiosClient.patch<KeyMaterial>(`${BASE_URL}/${id}/deprecate`);
    return res.data;
  },

  // -----------------------------
  // Liste des algorithmes disponibles
  // -----------------------------
  async getAlgorithms(type: string): Promise<string[]> {
    const res = await axiosClient.get<string[]>(`/crypto/algorithms/${type}`);
    return res.data;
  }

}
