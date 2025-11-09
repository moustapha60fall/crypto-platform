import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { CryptoOperation } from "@/types/crypto-operation";
import { OperationService } from "@/services/cryptoOperationService";
import { DataTable } from "@/components/DataTable";

export default function OperationsPage() {
    const [operations, setOperations] = useState<CryptoOperation[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        OperationService.getAllCryptoOperations(0, 20)
            .then(res => setOperations(res.content))  // <-- ici
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">🔄 Opérations cryptographiques</h2>
            </div>

            <Card className="p-4">
                {loading ? (
                    <p className="text-muted-foreground">Chargement des opérations…</p>
                ) : (
                    <DataTable
                        columns={[
                            { header: "ID", accessor: "id" },
                            { header: "Type", accessor: "primitiveType" },
                            { header: "Service", accessor: "serviceType" },
                            {
                                header: "Utilisateur",
                                accessor: "performedById",
                                cell: (value) => <Badge variant="secondary">{value}</Badge>,
                            },
                            {
                                header: "Clé",
                                accessor: "performedById",
                                cell: (value) => <span className="text-sm text-muted-foreground">#{value}</span>,
                            },
                        ]}
                        data={operations}
                    />
                )}
            </Card>
        </div>
    );
}
