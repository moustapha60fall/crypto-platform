// src/components/UserCard.tsx
import { Button } from "@/components/ui/button"
import type { AppUser } from "@/types/app-user"
import { NavLink } from "react-router-dom"

export function UserCard({ user }: { user: AppUser }) {
    return (
        <div className="border p-4 rounded-md bg-white shadow-sm space-y-2">
            <h3 className="font-semibold">{user.username}</h3>
            <p>{user.email}</p>
            <p>Rôle : {user.roles}</p>
            <NavLink to={`/admin/users/${user.id}`}>
                <Button size="sm">Voir détails</Button>
            </NavLink>
        </div>
    )
}
