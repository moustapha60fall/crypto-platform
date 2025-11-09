"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { useCurrentUser } from "@/hooks/useCurrentUser "
import type { KeyShareDTO } from "@/types/Key-share"
import { CleService } from "@/services/cle-service"

export default function SharesPage() {
    const { data: user, isLoading: loadingUser } = useCurrentUser()
    const [sharedByMe, setSharedByMe] = useState<KeyShareDTO[]>([])
    const [sharedWithMe, setSharedWithMe] = useState<KeyShareDTO[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!user) return
            ; (async () => {
                try {
                    const res = await CleService.getAllShares(user.id)
                    setSharedByMe(res.sharedByMe)
                    setSharedWithMe(res.sharedWithMe)
                } catch (err) {
                    console.error(err)
                    setError("Impossible de récupérer les partages.")
                } finally {
                    setLoading(false)
                }
            })()
    }, [user])

    if (loadingUser || loading) {
        return (
            <div className="flex items-center justify-center h-48 text-gray-500">
                <Loader2 className="animate-spin mr-2" /> Chargement des partages…
            </div>
        )
    }

    if (error) {
        return <div className="text-center text-red-500 p-4">{error}</div>
    }

    return (
        <div className="p-6 space-y-6">
            {/* Clés que j’ai partagées */}
            <Card>
                <CardHeader>
                    <CardTitle>🔑 Clés partagées par moi</CardTitle>
                </CardHeader>
                <CardContent>
                    {sharedByMe.length === 0 ? (
                        <p className="text-gray-500">Aucune clé partagée pour le moment.</p>
                    ) : (
                        <ul className="space-y-2">
                            {sharedByMe.map((share) => (
                                <li
                                    key={share.id}
                                    className="border rounded p-2 flex justify-between items-center hover:bg-gray-50 transition"
                                >
                                    <div>
                                        <div className="font-medium">Clé #{share.keyMaterialId}</div>
                                        <div className="text-sm text-gray-600">
                                            Partagée avec <b>{share.sharedWithUserId}</b>
                                        </div>
                                    </div>
                                    <Badge>{share.algorithm ?? "Inconnu"}</Badge>
                                </li>
                            ))}
                        </ul>
                    )}
                </CardContent>
            </Card>

            {/* Clés partagées avec moi */}
            <Card>
                <CardHeader>
                    <CardTitle>📥 Clés partagées avec moi</CardTitle>
                </CardHeader>
                <CardContent>
                    {sharedWithMe.length === 0 ? (
                        <p className="text-gray-500">Aucune clé reçue.</p>
                    ) : (
                        <ul className="space-y-2">
                            {sharedWithMe.map((share) => (
                                <li
                                    key={share.id}
                                    className="border rounded p-2 flex justify-between items-center hover:bg-gray-50 transition"
                                >
                                    <div>
                                        <div className="font-medium">Clé #{share.keyMaterialId}</div>
                                        <div className="text-sm text-gray-600">
                                            Partagée par <b>{share.sharedByUserId}</b>
                                        </div>
                                    </div>
                                    <Badge>{share.algorithm ?? "Inconnu"}</Badge>
                                </li>
                            ))}
                        </ul>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
