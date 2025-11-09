import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { getASymmetricKeysPrivForCurrentUser, getASymmetricKeysPubForCurrentUser } from "@/services/cryptoService"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { motion } from "framer-motion"

import asymmetricPubImg from "/pub_cle.jpeg"
import asymmetricPrivImg from "/priv_cle.jpeg"
import { toast } from "sonner"
import type { KeyMaterial } from "@/types/key-material"

export default function AsymmetricKeysPage() {
    const [keys, setKeys] = useState<KeyMaterial[]>([])
    const navigate = useNavigate()

    useEffect(() => {
        Promise.all([
            getASymmetricKeysPrivForCurrentUser(),
            getASymmetricKeysPubForCurrentUser()
        ])
            .then(([privKeys, pubKeys]) => setKeys([...privKeys, ...pubKeys]))
            .catch(() => toast.error("Erreur chargement des clés asymétriques"))
    }, [])

    const getImage = (type: string) =>
        type === "ASYMMETRIC_PUBLIC" ? asymmetricPubImg : asymmetricPrivImg

    const getColor = (type: string) =>
        type === "ASYMMETRIC_PUBLIC"
            ? "border-blue-500 bg-blue-50 text-blue-700"
            : "border-red-500 bg-red-50 text-red-700"

    const getBadge = (type: string) =>
        type === "ASYMMETRIC_PUBLIC"
            ? "bg-blue-100 text-blue-700"
            : "bg-red-100 text-red-700"

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="p-6 space-y-6 max-w-7xl mx-auto"
        >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {keys.map((key, index) => {
                    const color = getColor(key.keyType)
                    const badge = getBadge(key.keyType)
                    const image = getImage(key.keyType)

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
                                    <div>
                                        <h3 className="text-lg font-semibold">{key.name}</h3>
                                        <span className={`px-2 py-1 text-xs font-medium rounded ${badge}`}>
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
                                        <span className="text-gray-600">⚙️ {key.algorithm}</span>
                                        <span className={`font-semibold ${key.deprecated ? "text-red-600" : "text-green-600"}`}>
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
