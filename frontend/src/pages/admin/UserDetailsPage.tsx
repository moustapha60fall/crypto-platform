import { useParams } from "react-router-dom"
import { useEffect, useState } from "react"
import { userService } from "@/services/userService"
import type { AppUser } from "@/types/app-user"
import UserDetailsDialogContent from "./UserDetailsDialogContent"

export default function UserDetailsPage() {
    const { id } = useParams()
    const [user, setUser] = useState<AppUser | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (id) {
            userService.getUserById(id)
                .then(setUser)
                .catch(() => setUser(null))
                .finally(() => setLoading(false))
        }
    }, [id])

    if (loading) return <p>Chargement…</p>
    if (!user) return <p>Utilisateur introuvable.</p>

    return <UserDetailsDialogContent user={user} />
}
