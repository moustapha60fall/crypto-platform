import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { motion } from "framer-motion"
import symmetricImg from "/symmetric.png";
import { toast } from "sonner"
import { getSymmetricKeysForCurrentUser } from "@/services/cryptoService"
import type { KeyMaterial } from "@/types/key-material"

export default function SymmetricKeysPage() {
    const [keys, setKeys] = useState<KeyMaterial[]>([])
    const navigate = useNavigate()

    useEffect(() => {
        getSymmetricKeysForCurrentUser()
            .then(setKeys)
            .catch(() => toast.error("Erreur chargement des clés symétriques"))
    }, [])

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="p-6 space-y-6 max-w-7xl mx-auto"
        >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {keys.map((key, index) => (
                    <motion.div
                        key={key.id ?? key.keyRef}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ scale: 1.03 }}
                        onClick={() => navigate(`/crypto/keys/${key.keyRef}`)}
                        className="cursor-pointer"
                    >
                        <Card className="rounded-xl border-l-4 border-slate-500 bg-slate-100 text-slate-700 hover:shadow-xl transition-shadow p-4">
                            <CardHeader className="p-0 mb-2 flex justify-between items-center">
                                <div>
                                    <h3 className="text-lg font-semibold">{key.name}</h3>
                                    <span className="px-2 py-1 text-xs font-medium rounded bg-slate-100 text-slate-700">
                                        SYMMETRIC
                                    </span>
                                </div>
                                <motion.img
                                    src={symmetricImg}
                                    alt="SYMMETRIC"
                                    className="w-12 h-12 object-contain"
                                    whileHover={{ rotate: 10 }}
                                    transition={{ type: "spring", stiffness: 300 }}
                                />
                            </CardHeader>
                            <CardContent className="text-sm space-y-1">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">⚙️ {key.algorithm}</span>
                                    <span className={`font-semibold ${key.deprecated ? "text-red-600" : "text-green-600"}`}>
                                        {key.deprecated ? "❌ Dépréciée" : "✅ Active"}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>
        </motion.div>
    )
}
