"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Navigate } from "react-router-dom";
import keycloak from "@/keycloak";
import { useAuth } from "./useAuth";

interface RequireRolesProps {
    roles: string[];
    mode?: "OR" | "AND";
    children: ReactNode;
}

export default function RequireRoles({
                                         roles,
                                         mode = "OR",
                                         children,
                                     }: RequireRolesProps) {
    const { roles: userRoles } = useAuth();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!keycloak.authenticated) {
            keycloak.init({ onLoad: "login-required" }).then(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, []);

    if (loading) return <div>Chargement...</div>;

    const hasAccess =
        mode === "OR"
            ? roles.some((r) => userRoles.includes(r))
            : roles.every((r) => userRoles.includes(r));

    return hasAccess ? <>{children}</> : <Navigate to="/" />;
}
