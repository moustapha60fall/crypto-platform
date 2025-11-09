import { Badge } from "@/components/ui/badge"
import UsersTabs from "@/components/UsersTabs"
import { useCurrentUser } from "@/hooks/useCurrentUser "

export default function ProfilePage() {
    const { data: profile, isLoading, isError } = useCurrentUser()

    if (isLoading) {
        return <div className="p-6 text-center text-gray-500">Chargement du profil…</div>
    }

    if (isError || !profile) {
        return <div className="p-6 text-center text-red-500">Erreur lors du chargement du profil.</div>
    }

    return (
        <>
            <div className="flex justify-between items-start p-2 pl-6 pr-6 h-[6rem] bg-[#fcfcfc] border border-[#c7c7cc] rounded shadow-[0_0_3px_1px_rgba(0,0,0,0.2)] space-y-6 mb-3">
                {/* Bandeau d'identité */}
                <ul className="space-y-1 text-sm text-gray-700">
                    <li className="font-semibold text-lg">
                        {profile.lastName} {profile.firstName}
                    </li>
                    <li>
                        {profile.email ?? "—"}{profile.phoneNumber && `, ${profile.phoneNumber}`}
                    </li>
                    <li>
                        {[profile.nomRegion, profile.nomVille, profile.address]
                            .filter(Boolean)
                            .join(", ") || "—"}
                    </li>
                </ul>

                <ul className="space-y-1 text-sm text-gray-600 text-right">
                    <li>
                        <small>
                            Connecté pour la première fois le{" "}
                            {profile.sessionStart
                                ? new Intl.DateTimeFormat("fr-FR", {
                                    dateStyle: "medium",
                                    timeStyle: "short",
                                }).format(new Date(profile.sessionStart))
                                : "—"}
                        </small>
                    </li>
                    <li>
                        <small>
                            Vu pour la dernière fois le{" "}
                            {profile.lastLogin
                                ? new Intl.DateTimeFormat("fr-FR", {
                                    dateStyle: "medium",
                                    timeStyle: "short",
                                }).format(new Date(profile.lastLogin))
                                : "—"}
                        </small>
                    </li>
                    <li className="mt-1">
                        <small className="flex items-center justify-end gap-1">
                            Statut :
                            {profile.blocked ? (
                                <Badge variant="destructive">✘ Inactif</Badge>
                            ) : profile.active ? (
                                <Badge className="bg-green-400">✔ Actif</Badge>
                            ) : (
                                <Badge variant="destructive">✘ Inactif</Badge>
                            )}
                        </small>
                    </li>
                </ul>
            </div>
            <UsersTabs />
        </>

    )
}
