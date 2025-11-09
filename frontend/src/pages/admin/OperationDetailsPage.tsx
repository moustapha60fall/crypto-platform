"use client";

import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

import { OperationService } from "@/services/cryptoOperationService";
import type { CryptoOperation } from "@/types/crypto-operation";

export default function OperationDetailsPage() {
    const { id } = useParams<{ id: string }>();
    const [operation, setOperation] = useState<CryptoOperation | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;

        const fetchOperation = async () => {
            try {
                const data = await OperationService.getCryptoOperationById(Number(id));
                setOperation(data);
            } catch (err) {
                console.error(err);
                toast.error("Erreur lors du chargement de l’opération.");
            } finally {
                setLoading(false);
            }
        };

        fetchOperation();
    }, [id]);

    if (loading) {
        return <p className="text-muted-foreground">Chargement des détails…</p>;
    }

    if (!operation) {
        return <p className="text-destructive">Aucune opération trouvée.</p>;
    }

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold">
                🔍 Détails de l’opération #{operation.id}
            </h2>

            <Card className="p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <p>
                            <strong>Type :</strong>{" "}
                            <Badge variant="secondary">{operation.primitiveType}</Badge>
                        </p>
                        <p>
                            <strong>Service :</strong>{" "}
                            <Badge variant="outline">{operation.serviceType}</Badge>
                        </p>
                        <p>
                            <strong>Algorithme :</strong>{" "}
                            <Badge variant="outline">{operation.algorithm}</Badge>
                        </p>
                    </div>

                    <div>
                        <p>
                            <strong>Utilisateur :</strong>{" "}
                            <Link
                                to={`/admin/users/${operation.performedById}`}
                                className="text-primary underline"
                            >
                                {operation.performedById}
                            </Link>
                        </p>
                        <p>
                            <strong>Clé associée :</strong>{" "}
                            <Link
                                to={`/admin/keys/${operation.keyMaterialId}`}
                                className="text-primary underline"
                            >
                                #{operation.keyMaterialId}
                            </Link>
                        </p>
                    </div>
                </div>

                <div>
                    {operation.createdAt && (
                        <p>
                            <strong>Date :</strong>{" "}
                            {new Date(operation.createdAt).toLocaleString()}
                        </p>
                    )}
                    {operation.status && (
                        <p>
                            <strong>Statut :</strong>{" "}
                            <Badge
                                variant={
                                    operation.status === "SUCCESS"
                                        ? "secondary"
                                        : operation.status === "FAILED"
                                            ? "destructive"
                                            : "outline"
                                }
                            >
                                {operation.status}
                            </Badge>
                        </p>
                    )}
                </div>

                {operation.metadata && (
                    <div>
                        <strong>Métadonnées :</strong>
                        <pre className="bg-muted p-2 rounded text-sm overflow-x-auto">
                            {operation.metadata}
                        </pre>
                    </div>
                )}

                {operation.inputDataEncrypted && (
                    <div>
                        <strong>Entrée chiffrée :</strong>
                        <pre className="bg-muted p-2 rounded text-sm overflow-x-auto">
                            {operation.inputDataEncrypted}
                        </pre>
                    </div>
                )}

                {operation.outputDataEncrypted && (
                    <div>
                        <strong>Sortie chiffrée :</strong>
                        <pre className="bg-muted p-2 rounded text-sm overflow-x-auto">
                            {operation.outputDataEncrypted}
                        </pre>
                    </div>
                )}
            </Card>
        </div>
    );
}
