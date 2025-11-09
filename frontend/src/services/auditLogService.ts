import axiosClient from "@/api/axiosClient";
import type { AuditLog } from "@/types/audit-log.ts";

/**
 * 📄 Récupère tous les logs paginés
 */
export const getAllAuditLogs = async (
    page = 0,
    size = 10
): Promise<any> => {
    const response = await axiosClient.get("/audit", {
        params: { page, size },
    });
    return response.data;
};

/**
 * 👤 Récupère les logs d’un utilisateur
 */
export const getAuditLogsByActor = async (
    actorId: string
): Promise<AuditLog[]> => {
    const response = await axiosClient.get(`/audit/user/${actorId}`);
    return response.data;
};

/**
 * 🏷️ Récupère les logs par action
 */
export const getAuditLogsByAction = async (
    action: string
): Promise<AuditLog[]> => {
    const response = await axiosClient.get(`/audit/action/${action}`);
    return response.data;
};

/**
 * 📆 Récupère les logs entre deux dates
 */
export const getAuditLogsBetween = async (
    start: string,
    end: string
): Promise<AuditLog[]> => {
    const response = await axiosClient.get("/audit/between", {
        params: { start, end },
    });
    return response.data;
};

/**
 * 📝 Crée un log d’audit
 */
export const createAuditLog = async (
    dto: AuditLog
): Promise<AuditLog> => {
    const response = await axiosClient.post("/audit", dto);
    return response.data;
};

/**
 * 📊 Statistiques par action
 */
export const getAuditActionStats = async (): Promise<Record<string, number>> => {
    const response = await axiosClient.get("/audit/stats/actions");
    return response.data;
};
