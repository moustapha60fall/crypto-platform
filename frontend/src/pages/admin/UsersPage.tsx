"use client"

import { useEffect, useState } from "react"
import { userService } from "@/services/userService"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"

import { DataTable } from "@/components/DataTable"
import type { AppUser } from "@/types/app-user"
import type { RoleResponse } from "@/types/role-response"
import { OperationService } from "@/services/cryptoOperationService"
import { formatRelative } from "@/lib/date"
import UserDetailsDialogContent from "./UserDetailsPage"

export default function UsersPage() {
    const [users, setUsers] = useState<AppUser[]>([])
    const [loading, setLoading] = useState(true)
    const [page, setPage] = useState(0)
    const [totalPages, setTotalPages] = useState(0)
    const pageSize = 10
    const [operationCounts, setOperationCounts] = useState<Record<string, number>>({})

    // 🔄 Charger les utilisateurs + audit
    const fetchUsers = async (pageNumber: number) => {
        setLoading(true)
        try {
            const res = await userService.getAllUsersPaged(pageNumber, pageSize)
            setUsers(res.content)
            setTotalPages(res.totalPages)
            setPage(res.number)

            // Audit des opérations par utilisateur
            const audit: Record<string, number> = {}
            await Promise.all(
                res.content.map(async (user) => {
                    const ops = await OperationService.getCryptoOperationsByUser(user.id)
                    audit[user.id] = ops.length
                })
            )
            setOperationCounts(audit)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchUsers(0)
    }, [])

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">🛡️ Administration des utilisateurs</h2>
                <Button variant="default">Créer un utilisateur</Button>
            </div>

            <Card className="p-4">
                <DataTable
                    columns={[
                        { header: "Nom", accessor: "lastName" },
                        { header: "Email", accessor: "email" },
                        {
                            header: "Rôles",
                            accessor: "roles",
                            cell: (value: RoleResponse[] = []) => (
                                <div className="flex gap-1 flex-wrap">
                                    {value.map((role, i) => (
                                        <Badge key={i} variant="secondary">{role.nomRole}</Badge>
                                    ))}
                                </div>
                            ),
                        },
                        {
                            header: "Dernière connexion",
                            accessor: "lastLogin",
                            cell: (value?: string) =>
                                value ? formatRelative(new Date(value)) : "Jamais connecté",
                        },
                        {
                            header: "Opérations",
                            accessor: "id",
                            cell: (id: string) => (
                                <Badge variant="outline">{operationCounts[id] ?? 0}</Badge>
                            ),
                        },
                        {
                            header: "Statut",
                            accessor: "blocked",
                            cell: (blocked: boolean) =>
                                blocked ? (
                                    <Badge variant="destructive">Bloqué</Badge>
                                ) : (
                                    <Badge variant="default">Actif</Badge>
                                ),
                        },
                        {
                            header: "Détails",
                            accessor: "id",
                            cell: (_: any, row: AppUser) => (
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button variant="outline" size="sm">Voir</Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-md">
                                        <DialogHeader>
                                            <DialogTitle>Détails de l’utilisateur</DialogTitle>
                                        </DialogHeader>
                                        <UserDetailsDialogContent user={row} />
                                        <DialogFooter>
                                            <DialogClose asChild>
                                                <Button variant="secondary">Fermer</Button>
                                            </DialogClose>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            ),
                        },
                    ]}
                    data={users}
                    loading={loading}
                    pageSize={pageSize}
                />

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex justify-between items-center px-4 pb-4 mt-4">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => fetchUsers(page - 1)}
                            disabled={page === 0 || loading}
                        >
                            ← Précédent
                        </Button>
                        <span className="text-sm text-muted-foreground">
                            Page {page + 1} / {totalPages}
                        </span>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => fetchUsers(page + 1)}
                            disabled={page >= totalPages - 1 || loading}
                        >
                            Suivant →
                        </Button>
                    </div>
                )}
            </Card>
        </div>
    )
}
