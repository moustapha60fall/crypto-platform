"use client"

import { useLocation, Link } from "react-router-dom"
import { SlashIcon } from "lucide-react"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import React from "react"

// 🔍 Alias lisibles pour les segments utilisateur
const labelMap: Record<string, string> = {
    user: "Espace utilisateur",
    status: "Statut du profil",
    preferences: "Préférences",
    notifications: "Notifications",
    security: "Sécurité",
    activity: "Activité récente",
}

export default function UserBreadcrumb() {
    const location = useLocation()
    const segments = location.pathname.split("/").filter(Boolean)

    // Ne pas afficher si hors de l’espace utilisateur
    if (segments.length === 0 || segments[0] !== "user") return null

    return (
        <Breadcrumb>
            <BreadcrumbList>
                {/* Accueil */}
                <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                        <Link to="/">Accueil</Link>
                    </BreadcrumbLink>
                </BreadcrumbItem>

                <BreadcrumbSeparator>
                    <SlashIcon className="w-4 h-4" />
                </BreadcrumbSeparator>

                {segments.map((segment, index) => {
                    const href = "/" + segments.slice(0, index + 1).join("/")
                    const label = labelMap[segment] || segment
                    const isLast = index === segments.length - 1

                    return (
                        <React.Fragment key={href}>
                            <BreadcrumbItem>
                                {isLast ? (
                                    <BreadcrumbPage>{label}</BreadcrumbPage>
                                ) : (
                                    <BreadcrumbLink asChild>
                                        <Link to={href}>{label}</Link>
                                    </BreadcrumbLink>
                                )}
                            </BreadcrumbItem>

                            {!isLast && (
                                <BreadcrumbSeparator>
                                    <SlashIcon className="w-4 h-4" />
                                </BreadcrumbSeparator>
                            )}
                        </React.Fragment>
                    )
                })}
            </BreadcrumbList>
        </Breadcrumb>
    )
}
