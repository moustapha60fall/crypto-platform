import axiosClient from "@/api/axiosClient";
import type { CryptoPrimitiveType, CryptoServiceType } from "@/types/crypto";
import type { CryptoOperation } from "@/types/crypto-operation";

const BASE_URL = "/crypto-ops";

export const OperationService = {
    /**
     * 🔐 Crée une opération cryptographique
     */
    createCryptoOperation: async (
        dto: CryptoOperation,
        inputEncrypted?: string,
        outputEncrypted?: string
    ): Promise<CryptoOperation> => {
        const response = await axiosClient.post(BASE_URL, dto, {
            params: { inputEncrypted, outputEncrypted },
        });
        return response.data;
    },

    /**
     * 📄 Récupère toutes les opérations paginées
     */
    getAllCryptoOperations: (page = 0, size = 10): Promise<{
        content: CryptoOperation[],
        totalPages: number,
        totalElements: number,
        number: number,
        size: number
    }> =>
        axiosClient.get(BASE_URL, { params: { page, size } }).then(res => res.data),

    /**
     * 🔍 Récupère une opération par ID
     */
    getCryptoOperationById: async (id: number): Promise<CryptoOperation> => {
        const response = await axiosClient.get(`${BASE_URL}/${id}`);
        return response.data;
    },

    /**
     * 👤 Récupère les opérations d’un utilisateur
     */
    getCryptoOperationsByUser: async (userId: string): Promise<CryptoOperation[]> => {
        const response = await axiosClient.get(`${BASE_URL}/user/${userId}`);
        return response.data;
    },

    /**
     * 🔑 Récupère les opérations liées à une clé spécifique
     */
    getCryptoOperationsByKey: async (keyId: number): Promise<CryptoOperation[]> => {
        const response = await axiosClient.get(`${BASE_URL}/key/${keyId}`);
        return response.data;
    },

    /**
     * 🗑️ Supprime une opération
     */
    deleteCryptoOperation: async (id: number): Promise<void> => {
        await axiosClient.delete(`${BASE_URL}/${id}`);
    },

    /**
     * 📊 Statistiques par primitive
     */
    getPrimitiveStats: async (): Promise<Record<CryptoPrimitiveType, number>> => {
        const response = await axiosClient.get(`${BASE_URL}/stats/primitive`);
        return response.data;
    },

    /**
     * 📊 Statistiques par service
     */
    getServiceStats: async (): Promise<Record<CryptoServiceType, number>> => {
        const response = await axiosClient.get(`${BASE_URL}/stats/service`);
        return response.data;
    },
};
