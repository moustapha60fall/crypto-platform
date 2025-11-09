export interface AuditLog {
    id?: number; // Généré automatiquement
    action: string;
    verified: boolean;
    details?: string; // JSON string sans PII
    actorId: string;
    requestId: string;
    createdAt?: string; // ISO 8601 timestamp
}