import { useEffect, useState } from "react"
import type { KeyMaterial } from "@/types/key-material"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { toast } from "sonner"
import { motion } from "framer-motion"
import { useNavigate } from "react-router-dom"

import symmetricImg from "/symmetric.png"
import asymmetricPubImg from "/pub_cle.jpeg"
import asymmetricPrivImg from "/priv_cle.jpeg"
import { CleService } from "@/services/cle-service"

export default function MyKeysPage() {
    const [keys, setKeys] = useState<KeyMaterial[]>([])
    const navigate = useNavigate()

    useEffect(() => {
        CleService.getAllKeys()
            .then(setKeys)
            .catch(() => toast.error("Erreur chargement des clés"))
    }, [])

    const getColorByType = (type: string) => {
        switch (type) {
            case "SYMMETRIC":
                return "border-slate-500 bg-slate-50 text-slate-700"
            case "ASYMMETRIC_PUBLIC":
                return "border-blue-500 bg-blue-50 text-blue-700"
            case "ASYMMETRIC_PRIVATE":
                return "border-red-500 bg-red-50 text-red-700"
            default:
                return "border-gray-400 bg-gray-50 text-gray-700"
        }
    }

    const getBadgeStyle = (type: string) => {
        switch (type) {
            case "SYMMETRIC":
                return "bg-slate-100 text-slate-700"
            case "ASYMMETRIC_PUBLIC":
                return "bg-blue-100 text-blue-700"
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

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="p-6 space-y-6 max-w-7xl mx-auto"
        >
            {/* Grille dynamique */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {keys.map((key, index) => {
                    const color = getColorByType(key.keyType)
                    const badge = getBadgeStyle(key.keyType)
                    const image = getImageByType(key.keyType)

                    return (
                        <motion.div
                            key={key.id ?? key.keyRef}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            whileHover={{ scale: 1.03 }}
                            onClick={() => navigate(`/crypto/keys/${key.keyRef}`)}
                            className="cursor-pointer"
                        >
                            <Card className={`rounded-xl border-l-4 ${color} hover:shadow-xl transition-shadow p-4`}>
                                <CardHeader className="p-0 mb-2 flex justify-between items-center">
                                    <div className="flex flex-col gap-1">
                                        <h3 className="text-lg font-semibold">{key.name}</h3>
                                        <span
                                            className={`px-2 py-1 text-xs font-medium rounded ${badge}`}
                                            title={`Type : ${key.keyType}`}
                                        >
                                            {key.keyType}
                                        </span>
                                    </div>
                                    <motion.img
                                        src={image}
                                        alt={key.keyType}
                                        className="w-12 h-12 object-contain"
                                        whileHover={{ rotate: 10 }}
                                        transition={{ type: "spring", stiffness: 300 }}
                                    />
                                </CardHeader>

                                <CardContent className="text-sm space-y-1">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600" title="Algorithme utilisé">
                                            ⚙️ {key.algorithm}
                                        </span>
                                        <span
                                            className={`font-semibold ${key.deprecated ? "text-red-600" : "text-green-600"}`}
                                            title={key.deprecated ? "Cette clé est dépréciée" : "Clé active"}
                                        >
                                            {key.deprecated ? "❌ Dépréciée" : "✅ Active"}
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )
                })}
            </div>
        </motion.div>
    )
}
