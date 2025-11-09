import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { motion } from "framer-motion"
import { toast } from "sonner"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { OperationService } from "@/services/cryptoOperationService"
import type { CryptoOperation } from "@/types/crypto-operation"
import { useCurrentUser } from "@/hooks/useCurrentUser "

export default function UserOperationsPage() {
  const { userId } = useParams<{ userId: string }>();
  const [operations, setOperations] = useState<CryptoOperation[]>([]);
  const { data: currentUser, isLoading, isError } = useCurrentUser();

  useEffect(() => {
    const effectiveUserId = userId || currentUser?.id;
    if (!effectiveUserId) return;

    OperationService.getCryptoOperationsByUser(effectiveUserId)
      .then(setOperations)
      .catch(() => toast.error("Erreur lors du chargement des opérations"));
  }, [userId, currentUser?.id]);

  if (isLoading)
    return (
      <div className="p-6 text-center text-gray-500 animate-pulse">
        Chargement des opérations...
      </div>
    );

  if (isError)
    return (
      <div className="p-6 text-center text-red-500">
        Erreur lors du chargement des données utilisateur.
      </div>
    );

  if (!operations.length)
    return (
      <div className="p-6 text-center text-gray-500">
        Aucune opération trouvée pour cet utilisateur.
      </div>
    );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="p-6 space-y-6 max-w-6xl mx-auto"
    >
      {/* En-tête */}
      <Card className="p-6 border border-gray-300 rounded-lg shadow-sm bg-[#fcfcfc]">
        <h1 className="text-3xl font-bold text-center text-gray-900 mb-2">
          🧑‍💻 Opérations cryptographiques de l’utilisateur
        </h1>
        <p className="text-center text-sm text-gray-600">
          Liste de toutes les opérations réalisées par{" "}
          <span className="font-semibold text-gray-800">
            {currentUser?.username || userId}
          </span>
          .
        </p>
      </Card>

      {/* Liste des opérations */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {operations.map((op, index) => (
          <motion.div
            key={op.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="cursor-pointer"
          >
            <Card className="rounded-lg border border-gray-200 shadow hover:shadow-lg transition-shadow p-4 bg-white">
              <CardHeader className="p-0 mb-3 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-800">
                  {op.primitiveType}
                </h3>
                <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-600">
                  {op.serviceType}
                </span>
              </CardHeader>

              <CardContent className="text-sm space-y-2">
                <div>
                  <strong>⚙️ Algorithme :</strong> {op.algorithm}
                </div>
                <div>
                  <strong>📅 Date :</strong>{" "}
                  {op.createdAt
                    ? new Intl.DateTimeFormat("fr-FR", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      }).format(new Date(op.createdAt))
                    : "—"}
                </div>
                <div>
                  <strong>📊 Statut :</strong>{" "}
                  <span
                    className={`font-semibold ${
                      op.status === "SUCCESS"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {op.status || "Inconnu"}
                  </span>
                </div>
                {op.metadata && (
                  <div className="truncate">
                    <strong>🧾 Métadonnées :</strong> {op.metadata}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
