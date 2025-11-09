import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { toast } from "sonner"
import { Share2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
    Tooltip,
    TooltipTrigger,
    TooltipContent,
} from "@/components/ui/tooltip"
import symmetricImg from "/symmetric.png";
import asymmetricPubImg from "/pub_cle.jpeg";
import asymmetricPrivImg from "/priv_cle.jpeg";

import KeyOperationsPage from "./KeyOperationsPage"
import { CleService } from "@/services/cle-service"
import type { KeyMaterial } from "@/types/key-material"
import { CryptoPrimitiveTypes, type CryptoPrimitiveType } from "@/types/crypto"

export default function KeyDetailPage() {
    const { keyRef } = useParams()
    const [key, setKey] = useState<KeyMaterial | null>(null)

    useEffect(() => {
        if (!keyRef) return
        CleService.getByKeyRef(keyRef)
            .then(setKey)
            .catch(() => toast.error("Erreur lors du chargement de la clé"))
    }, [keyRef])

    const getBadgeStyle = (type: string) => {
        switch (type) {
            case "SYMMETRIC":
                return "bg-gray-100 text-blue-700"
            case "ASYMMETRIC_PUBLIC":
                return "bg-blue-100 text-bleu-700"
            case "ASYMMETRIC_PRIVATE":
                return "bg-red-100 text-red-700"
            default:
                return "bg-gray-200 text-gray-700"
        }
    }

    const getImageByType = (type: string) => {
        switch (type) {
            case "SYMMETRIC":
                return symmetricImg
            case "ASYMMETRIC_PUBLIC":
                return asymmetricPubImg
            case "ASYMMETRIC_PRIVATE":
                return asymmetricPrivImg
            default:
                return symmetricImg
        }
    }

    const getSupportedPrimitives = (keyType: string): CryptoPrimitiveType[] => {
        switch (keyType) {
            case "SYMMETRIC":
                return [
                    CryptoPrimitiveTypes.ENCRYPTION,
                    CryptoPrimitiveTypes.DECRYPTION,
                    CryptoPrimitiveTypes.HASHING,
                    CryptoPrimitiveTypes.KEY_DERIVATION,
                ]
            case "ASYMMETRIC_PUBLIC":
                return [CryptoPrimitiveTypes.ENCRYPTION, CryptoPrimitiveTypes.SIGNATURE]
            case "ASYMMETRIC_PRIVATE":
                return [CryptoPrimitiveTypes.DECRYPTION, CryptoPrimitiveTypes.SIGNATURE]
            default:
                return []
        }
    }


    if (!key)
        return <div className="p-6 text-center text-gray-500">Chargement…</div>

    return (
        <main className="flex-1 w-full mx-auto">
            <motion.section
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="bg-[#fcfcfc] rounded-2xl"
            >
                <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                    {/* === Colonne gauche : Infos === */}
                    <div className="md:col-span-2">

                        {/* Type + Actions */}
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <span
                                    className={`border px-3 py-1 rounded-full text-xs uppercase tracking-wide inline-block mb-2 ${getBadgeStyle(
                                        key.keyType
                                    )}`}
                                >
                                    {key.keyType}
                                </span>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {getSupportedPrimitives(key.keyType).map((primitive) => (
                                        <Badge key={primitive} variant="secondary" className="cursor-pointer">
                                            #{primitive.toLowerCase()}
                                        </Badge>
                                    ))}
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <button aria-label="Partager">
                                            <Share2 size={20} className="cursor-pointer" />
                                        </button>
                                    </TooltipTrigger>
                                    <TooltipContent>Partager</TooltipContent>
                                </Tooltip>
                            </div>
                        </div>

                        {/* Séparateur */}
                        <Separator className="bg-black/20 shadow-[0_0_3px_1px]" />

                        {/* Nom + Catégorie */}
                        <motion.h1
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.6, ease: "easeOut" }}
                            className="text-4xl font-extrabold m-2 text-gray-900"
                        >
                            {key.name}
                        </motion.h1>

                        <p className="text-gray-500 mb-4">
                            {key.algorithm} | {key.keyType}
                        </p>

                        {/* Purpose (nouveau champ) */}
                        {key.purpose && (
                            <Badge
                                variant="outline"
                                className="text-sm font-medium text-indigo-700 border-indigo-400 mb-4"
                            >
                                Objectif : {key.purpose}
                            </Badge>
                        )}

                        {/* Description */}
                        <p className="text-gray-600 mb-25">
                            {key.deprecated
                                ? "Cette clé est dépréciée et ne doit plus être utilisée pour de nouvelles opérations."
                                : "Clé active et opérationnelle pour les services cryptographiques en cours."}
                        </p>

                        {/* Détails supplémentaires */}
                        <div className="text-sm text-gray-700 space-y-2">
                            <div>
                                <strong>Référence :</strong> {key.keyRef}
                            </div>
                            <div className="flex justify-between items-start">
                                <div>
                                    <strong>Créée le :</strong>{" "}
                                    {new Intl.DateTimeFormat("fr-FR", {
                                        dateStyle: "medium",
                                        timeStyle: "short",
                                    }).format(new Date(key.createdAt))}
                                </div>
                                <div>
                                    <strong>État :</strong>{" "}
                                    <span
                                        className={`font-semibold ${key.deprecated ? "text-red-600" : "text-green-600"
                                            }`}
                                    >
                                        {key.deprecated ? "❌ Dépréciée" : "✅ Active"}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* === Colonne droite : Illustration === */}
                    <div className="md:col-span-1 relative">
                        {getImageByType(key.keyType) ? (
                            <img
                                src={getImageByType(key.keyType)}
                                alt={key.keyType}
                                className="rounded-xl shadow-[0_0_3px_1px] w-full object-contain bg-[#fcfcfc] p-0.5"
                            />
                        ) : (
                            <div className="bg-gray-200 rounded-xl h-64 flex items-center justify-center text-gray-500 italic">
                                Pas d’image disponible
                            </div>
                        )}

                        {/* Badge d’état en overlay */}
                        <div
                            className={`absolute top-4 right-4 text-xs px-2 py-1 rounded-full font-bold shadow ${key.deprecated
                                ? "bg-red-500 text-white"
                                : "bg-green-400 text-white"
                                }`}
                        >
                            {key.deprecated ? "Dépréciée" : "Active"}
                        </div>
                    </div>
                </div>
            </motion.section>

            {/* === Section des opérations liées === */}
            <div className="mt-10">
                <KeyOperationsPage keyId={key.id} />
            </div>
        </main>
    )
}
