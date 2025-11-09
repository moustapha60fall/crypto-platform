import { useEffect, useState } from "react";
import { OperationService } from "@/services/cryptoOperationService";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import type { CryptoOperation } from "@/types/crypto-operation";

// 🎨 Icônes simples pour différencier les types de primitives
const primitiveIcons: Record<string, string> = {
    ENCRYPTION: "🧩",
    DECRYPTION: "🔓",
    HASHING: "🔁",
    SIGNATURE: "✍️",
    KEY_DERIVATION: "🧠",
};

// 🟢 Couleurs par type de service
const serviceColors: Record<string, string> = {
    CONFIDENTIALITY: "bg-blue-100 text-blue-800",
    INTEGRITY: "bg-green-100 text-green-800",
    AUTHENTICITY: "bg-purple-100 text-purple-800",
    NON_REPUDIATION: "bg-orange-100 text-orange-800",
};

export default function KeyOperationsPage({ keyId }: { keyId: number }) {
    const [operations, setOperations] = useState<CryptoOperation[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!keyId) return;
        OperationService.getCryptoOperationsByKey(keyId)
            .then(setOperations)
            .catch(() => toast.error("Erreur lors du chargement des opérations"))
            .finally(() => setLoading(false));
    }, [keyId]);

    if (loading) {
        return <div className="text-center text-gray-500">Chargement des opérations…</div>;
    }

    if (operations.length === 0) {
        return (
            <div className="text-center text-gray-400 text-sm italic">
                Aucune opération enregistrée pour cette clé.
            </div>
        );
    }

    // 🧮 Regroupement des opérations par type de primitive (ex: ENCRYPTION, SIGNATURE)
    const grouped = operations.reduce<Record<string, CryptoOperation[]>>((acc, op) => {
        if (!acc[op.primitiveType]) acc[op.primitiveType] = [];
        acc[op.primitiveType].push(op);
        return acc;
    }, {});

    return (
        <div className="space-y-6">
            {Object.entries(grouped).map(([primitiveType, ops]) => (
                <Card
                    key={primitiveType}
                    className="bg-green-100 dark:bg-[#1a1a1a] shadow-[0_0_3px_1px] dark:border-gray-700 rounded-[3px] transition"
                >
                    <CardHeader className="flex items-center justify-between p-4 border-b">
                        <CardTitle className="text-lg font-semibold flex items-center gap-2">
                            <span className="text-2xl">{primitiveIcons[primitiveType] || "🔐"}</span>
                            {primitiveType}
                        </CardTitle>
                        <span className="text-sm text-gray-500">{ops.length} opération(s)</span>
                    </CardHeader>

                    <CardContent className="divide-y">
                        {ops.map((op) => (
                            <div
                                key={op.id}
                                className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-3"
                            >
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span
                                            className={`px-2 py-1 text-xs rounded font-medium ${serviceColors[op.serviceType] || "bg-gray-100 text-gray-700"
                                                }`}
                                        >
                                            {op.serviceType}
                                        </span>
                                        <span className="text-gray-500 text-xs">{op.algorithm}</span>
                                    </div>

                                    <div className="text-xs text-gray-500">
                                        {op.createdAt
                                            ? new Intl.DateTimeFormat("fr-FR", {
                                                dateStyle: "medium",
                                                timeStyle: "short",
                                            }).format(new Date(op.createdAt))
                                            : "Date inconnue"}
                                    </div>

                                    {op.metadata && (
                                        <div className="text-[13px] text-gray-700 mt-1 truncate max-w-md">
                                            🧾 {op.metadata}
                                        </div>
                                    )}
                                </div>

                                <div className="mt-2 sm:mt-0 text-xs font-medium text-gray-700">
                                    {op.status === "SUCCESS" ? (
                                        <span className="text-green-600">✅ Succès</span>
                                    ) : (
                                        <span className="text-red-600">❌ Échec</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
