import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { KeyMaterial } from "@/types/key-material";
import type { CryptoOperation } from "@/types/crypto-operation";
import { CleService } from "@/services/cle-service";
import { OperationService } from "@/services/cryptoOperationService";
import { DataTable } from "@/components/DataTable";

export default function KeyDetailsPage() {
    const { id } = useParams();
    const [key, setKey] = useState<KeyMaterial | null>(null);
    const [operations, setOperations] = useState<CryptoOperation[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            const keyId = Number(id);
            Promise.all([
                CleService.getKeyById(keyId),
                OperationService.getCryptoOperationsByKey(keyId),
            ])
                .then(([keyData, ops]) => {
                    setKey(keyData);
                    setOperations(ops);
                })
                .finally(() => setLoading(false));
        }
    }, [id]);

    const handleDeprecate = async () => {
        if (!key) return;
        const updated = await CleService.deprecate(key.id);
        setKey(updated);
    };

    if (loading || !key) return <p className="text-muted-foreground">Chargement…</p>;

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold">🔑 Détails de la clé #{key.id}</h2>

            <Card className="p-4 space-y-4">
                <div>
                    <p><strong>Nom :</strong> {key.name}</p>
                    <p><strong>Algorithme :</strong> {key.algorithm}</p>
                    <p><strong>Référence :</strong> {key.keyRef}</p>
                    <p>
                        <strong>Propriétaire :</strong>{" "}
                        <Link to={`/admin/users/${key.ownerId}`} className="text-primary underline">
                            {key.ownerId}
                        </Link>
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <Badge variant={key.deprecated ? "destructive" : "default"}>
                        {key.deprecated ? "Dépréciée" : "Active"}
                    </Badge>
                    {!key.deprecated && (
                        <Button variant="outline" onClick={handleDeprecate}>
                            Déprécier cette clé
                        </Button>
                    )}
                </div>
            </Card>

            <Card className="p-4">
                <h3 className="text-lg font-semibold mb-2">🔄 Opérations liées</h3>
                <DataTable
                    columns={[
                        { header: "ID", accessor: "id" },
                        { header: "Type", accessor: "primitiveType" },
                        { header: "Service", accessor: "serviceType" },
                        {
                            header: "Utilisateur",
                            accessor: "performedById",
                            cell: (value) => (
                                <Link to={`/admin/users/${value}`} className="text-primary underline">
                                    {value}
                                </Link>
                            ),
                        },
                    ]}
                    data={operations}
                />
            </Card>
        </div>
    );
}
