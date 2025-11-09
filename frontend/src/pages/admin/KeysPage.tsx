import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { KeyMaterial } from "@/types/key-material";
import { CleService } from "@/services/cle-service";
import { DataTable } from "@/components/DataTable";

export default function KeysPage() {
    const [keys, setKeys] = useState<KeyMaterial[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        CleService.getAllKeys()
            .then(setKeys)
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">🔑 Clés cryptographiques</h2>
                <Button variant="default">Créer une clé</Button>
            </div>

            <Card className="p-4">
                {loading ? (
                    <p className="text-muted-foreground">Chargement des clés…</p>
                ) : (
                    <DataTable
                        columns={[
                            { header: "Nom", accessor: "name" },
                            { header: "Algorithme", accessor: "algorithm" },
                            {
                                header: "Propriétaire",
                                accessor: "ownerId",
                                cell: (value) => <Badge variant="outline">{value}</Badge>,
                            },
                            {
                                header: "Dépréciée",
                                accessor: "deprecated",
                                cell: (value) =>
                                    value ? (
                                        <Badge variant="destructive">Oui</Badge>
                                    ) : (
                                        <Badge variant="secondary">Non</Badge>
                                    ),
                            },
                        ]}
                        data={keys}
                    />
                )}
            </Card>
        </div>
    );
}
