import { useEffect, useState } from "react"
import { userService } from "@/services/userService"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import RoleCombobox from "@/components/RoleCombobox"
import type { AppUser } from "@/types/app-user"
import type { RoleResponse } from "@/types/role-response"

type Props = {
    user: AppUser
    onClose?: () => void
}

export default function UserDetailsDialogContent({ user }: Props) {
    const [currentUser, setCurrentUser] = useState<AppUser>(user)
    const [blocked, setBlocked] = useState(user.blocked)
    const [availableRoles, setAvailableRoles] = useState<RoleResponse[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        userService.getRolesByEmail(user.email ?? "").then(setAvailableRoles).finally(() => setLoading(false))
    }, [user.email])

    const toggleBlocked = async () => {
        const updated = await userService.blockUser(currentUser.id, !blocked)
        setBlocked(updated.blocked)
        setCurrentUser(updated)
    }

    const updateRoles = async (roles: RoleResponse[]) => {
        const roleNames = roles.map((r) => r.nomRole)
        const updated = await userService.updateRoles(currentUser.id, roleNames)
        setCurrentUser(updated)
    }

    const resetRoles = async () => {
        await updateRoles([{ idRole: 0, nomRole: "USER" }])
    }

    if (loading) return <p className="text-muted-foreground">Chargement…</p>

    return (
        <div className="space-y-4">
            <div>
                <p><strong>Nom :</strong> {currentUser.lastName}</p>
                <p><strong>Email :</strong> {currentUser.email}</p>
            </div>

            <div className="flex items-center gap-4">
                <Label htmlFor="blocked">Bloqué :</Label>
                <Switch id="blocked" checked={blocked} onCheckedChange={toggleBlocked} />
                <Badge variant={blocked ? "destructive" : "default"}>
                    {blocked ? "Bloqué" : "Actif"}
                </Badge>
            </div>

            <div>
                <p className="font-semibold mb-2">Rôles :</p>
                <div className="flex gap-2 flex-wrap mb-2">
                    {currentUser.roles?.map((role) => (
                        <Badge key={role.idRole} variant="secondary">{role.nomRole}</Badge>
                    ))}
                </div>

                <RoleCombobox
                    availableRoles={availableRoles}
                    currentRoles={currentUser.roles ?? []}
                    onUpdate={updateRoles}
                />
            </div>

            <Button variant="outline" onClick={resetRoles}>
                Réinitialiser les rôles
            </Button>
        </div>
    )
}
