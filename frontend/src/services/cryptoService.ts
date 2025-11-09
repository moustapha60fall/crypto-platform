//
// 🔍 Crypto Operations
//

import axiosClient from "@/api/axiosClient";
import type { AsymmetricCryptoDTO } from "@/types/asymmetric";
import type { CryptoAlgorithm, HashFunction } from "@/types/crypto";
import type { CryptoResponse } from "@/types/crypto-response";
import type { FileCryptoResponseDTO } from "@/types/file-crypto-response";
import type { FileSignatureResponseDTO } from "@/types/file-signature-response";
import type { KeyMaterial } from "@/types/key-material";
import type { SignatureDTO } from "@/types/signature";
import type { SymmetricCryptoDTO } from "@/types/symmetric";
import type { WrappedKeyDTO } from "@/types/wrapped-key";

const BASE_URL = "/crypto";

export const CryptoService = {

  // -----------------------------
  // Symmetric encryption / decryption (Base64)
  // -----------------------------
  async encryptSymmetric(dto: SymmetricCryptoDTO): Promise<SymmetricCryptoDTO> {
    const res = await axiosClient.post<CryptoResponse<SymmetricCryptoDTO>>(
      "/crypto/symmetric/encrypt",
      dto
    );

    if (!res.data.success) {
      throw new Error(res.data.message || "Erreur de chiffrement");
    }

    return res.data.data!;
  },

  async decryptSymmetric(dto: SymmetricCryptoDTO): Promise<SymmetricCryptoDTO> {
    const res = await axiosClient.post<CryptoResponse<SymmetricCryptoDTO>>(
      `${BASE_URL}/symmetric/decrypt`,
      dto
    );

    if (!res.data.success) {
      throw new Error(res.data.message || "Erreur de déchiffrement");
    }

    // ✅ On renvoie uniquement la donnée utile
    return res.data.data!;
  },

  // -----------------------------
  // Symmetric encryption / decryption (Files)
  // -----------------------------
  async encryptSymmetricFile(
    keyId: number,
    file: File,
    mode: string = "CBC"
  ): Promise<FileCryptoResponseDTO> {
    const formData = new FormData();
    formData.append("keyId", keyId.toString());
    formData.append("mode", mode);
    formData.append("file", file);

    const res = await axiosClient.post<FileCryptoResponseDTO>(
      `${BASE_URL}/symmetric/encryptFile`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );

    return res.data;
  },

  async decryptSymmetricFile(
    keyId: number,
    file: File,
    mode: string = "CBC"
  ): Promise<FileCryptoResponseDTO> {
    const formData = new FormData();
    formData.append("keyId", keyId.toString());
    formData.append("mode", mode);
    formData.append("file", file);

    const res = await axiosClient.post<FileCryptoResponseDTO>(
      `${BASE_URL}/symmetric/decryptFile`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );

    return res.data;
  },

  // -----------------------------
  // Symmetric encryption / decryption (Base64)
  // -----------------------------
  async encryptAsymmetric(dto: AsymmetricCryptoDTO): Promise<AsymmetricCryptoDTO> {
    const res = await axiosClient.post<CryptoResponse<AsymmetricCryptoDTO>>(
      `${BASE_URL}/asymmetric/encrypt`,
      dto
    );

    if (!res.data.success) {
      throw new Error(res.data.message || "Erreur de chiffrement asymétrique");
    }

    return res.data.data!;
  },

  async decryptAsymmetric(dto: AsymmetricCryptoDTO): Promise<AsymmetricCryptoDTO> {
    const res = await axiosClient.post<CryptoResponse<AsymmetricCryptoDTO>>(
      `${BASE_URL}/asymmetric/decrypt`,
      dto
    );

    if (!res.data.success) {
      throw new Error(res.data.message || "Erreur de déchiffrement asymétrique");
    }

    return res.data.data!;
  },

  // ==========================================================
  // 📁 ASYMMETRIC (File mode)
  // ==========================================================
  async encryptAsymmetricFile(
    publicKeyRef: string,
    file: File,
    algorithm: string,
    padding: string
  ): Promise<FileCryptoResponseDTO> {
    const formData = new FormData();
    formData.append("publicKeyRef", publicKeyRef);
    formData.append("file", file);
    formData.append("algorithm", algorithm);
    formData.append("padding", padding);

    const res = await axiosClient.post<FileCryptoResponseDTO>(
      `${BASE_URL}/asymmetric/encryptFile`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );

    return res.data;
  },

  async decryptAsymmetricFile(
    privateKeyRef: string,
    file: File,
    algorithm: string,
    padding: string
  ): Promise<FileCryptoResponseDTO> {
    const formData = new FormData();
    formData.append("privateKeyRef", privateKeyRef);
    formData.append("file", file);
    formData.append("algorithm", algorithm);
    formData.append("padding", padding);

    const res = await axiosClient.post<FileCryptoResponseDTO>(
      `${BASE_URL}/asymmetric/decryptFile`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );

    return res.data;
  },

  // ==========================================================
  // ✍️ SIGNATURES (Messages & Fichiers)
  // ==========================================================
  async signMessage(dto: SignatureDTO): Promise<SignatureDTO> {
    const res = await axiosClient.post<SignatureDTO>(
      `${BASE_URL}/signature/sign`,
      dto
    );
    return res.data;
  },

  // ==========================================================
  // ✅ VERIFICATION - MESSAGE
  // ==========================================================
  async verifyMessage(dto: SignatureDTO): Promise<{ isValid: boolean }> {
    const res = await axiosClient.post<{ isValid: boolean }>(
      `${BASE_URL}/signature/verify`,
      dto
    );
    return res.data;
  },

  // ==========================================================
  // 🗂️ SIGNATURE - FICHIER
  // ==========================================================
  async signFile(
    privateKeyRef: string,
    file: File,
    algorithm: CryptoAlgorithm,
    hashFunction: HashFunction
  ): Promise<FileSignatureResponseDTO> {
    const formData = new FormData();
    formData.append("privateKeyRef", privateKeyRef);
    formData.append("file", file);
    formData.append("algorithm", algorithm);
    formData.append("hashFunction", hashFunction);

    const res = await axiosClient.post<FileSignatureResponseDTO>(
      `${BASE_URL}/signature/signFile`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return res.data;
  },

  // ==========================================================
  // 🔍 VERIFICATION - FICHIER
  // ==========================================================
  async verifyFile(
    publicKeyRef: string,
    file: File,
    providedSignature: string,
    algorithm: CryptoAlgorithm,
    hashFunction: HashFunction
  ): Promise<FileSignatureResponseDTO> {
    const formData = new FormData();
    formData.append("publicKeyRef", publicKeyRef);
    formData.append("file", file);
    formData.append("providedSignature", providedSignature);
    formData.append("algorithm", algorithm);
    formData.append("hashFunction", hashFunction);

    const res = await axiosClient.post<FileSignatureResponseDTO>(
      `${BASE_URL}/signature/verifyFile`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return res.data;
  },

  // -----------------------------
  // HASHING (Text & File)
  // -----------------------------
  async hashMessage(message: string, hashFunction: string): Promise<string> {
    const res = await axiosClient.post<string>(
      `${BASE_URL}/hash/message`,
      null,
      { params: { message, hashFunction } }
    );
    return res.data;
  },

  async hashFile(file: File, hashFunction: string): Promise<FileCryptoResponseDTO> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("hashFunction", hashFunction);

    const res = await axiosClient.post<FileCryptoResponseDTO>(
      `${BASE_URL}/hash/file`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );

    return res.data;
  },

  // -----------------------------
  // HMAC (Text & File)
  // -----------------------------
  async computeHmacMessage(message: string, keyId: number, hashFunction: string): Promise<string> {
    const res = await axiosClient.post<string>(
      `${BASE_URL}/hmac/message`,
      null,
      { params: { message, keyId, hashFunction } }
    );
    return res.data;
  },

  async computeHmacFile(file: File, keyId: number, hashFunction: string): Promise<FileCryptoResponseDTO> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("keyId", keyId.toString());
    formData.append("hashFunction", hashFunction);

    const res = await axiosClient.post<FileCryptoResponseDTO>(
      `${BASE_URL}/hmac/file`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );

    return res.data;
  },

  // -----------------------------
  // Key Wrapping / Unwrapping
  // -----------------------------
  async wrapKey(dto: WrappedKeyDTO): Promise<WrappedKeyDTO> {
    const res = await axiosClient.post<WrappedKeyDTO>(
      `${BASE_URL}/wrap`,
      dto
    );
    return res.data;
  },

  async unwrapKey(dto: WrappedKeyDTO): Promise<WrappedKeyDTO> {
    const res = await axiosClient.post<WrappedKeyDTO>(
      `${BASE_URL}/unwrap`,
      dto
    );
    return res.data;
  },

  // -----------------------------
  // 🔑 Key Exchange - génération
  // -----------------------------
  async generateKeyPair(
    algorithm: string,
    namePrefix: string
  ): Promise<{ public: KeyMaterial; private: KeyMaterial }> {
    const res = await axiosClient.post<{ public: KeyMaterial; private: KeyMaterial }>(
      `${BASE_URL}/keyexchange/generate`,
      null,
      { params: { algorithm, namePrefix } }
    );
    return res.data;
  },

  // -----------------------------
  // 🔄 Key Exchange - dérivation
  // -----------------------------
  async deriveSharedKey(
    privateKeyRef: string,
    peerPublicKeyBase64: string
  ): Promise<{ sharedKey: string }> {
    const res = await axiosClient.post<{ sharedKey: string }>(
      `${BASE_URL}/keyexchange/derive`,
      null,
      { params: { privateKeyRef, peerPublicKeyBase64 } }
    );
    return res.data;
  },

  // -----------------------------
  // 📦 FICHIER (Téléchargement)
  // -----------------------------
  async downloadFile(fileName: string) {
    try {
      const response = await axiosClient.get(
        `${BASE_URL}/files/download/${fileName}`,
        {
          responseType: "blob", // important pour les fichiers
        }
      );

      // Créer une URL temporaire pour le blob
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName); // nom du fichier
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url); // nettoyage
    } catch (error) {
      console.error("Erreur lors du téléchargement :", error);
    }
  },

  // -----------------------------
  // Get available algorithms
  // -----------------------------
  async getAlgorithms(type: string) {
    return axiosClient.get<string[]>(`${BASE_URL}/algorithms/${type}`)
      .then(res => res.data);
  }

}

// -----------------------------
// Liste les clés symétriques de l’utilisateur courant
// -----------------------------
export const getSymmetricKeysForCurrentUser = async (): Promise<KeyMaterial[]> => {
  const response = await axiosClient.get("/keys/keys");
  return response.data;
};

export const getASymmetricKeysPrivForCurrentUser = async (): Promise<KeyMaterial[]> => {
  const response = await axiosClient.get("/keys/priv");
  return response.data;
};

export const getASymmetricKeysPubForCurrentUser = async (): Promise<KeyMaterial[]> => {
  const response = await axiosClient.get("/keys/pub");
  return response.data;
};
