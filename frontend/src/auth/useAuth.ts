import keycloak from "@/keycloak";

export function useAuth() {
    const isAuthenticated = keycloak.authenticated;
    const token = keycloak.token;

    const realmRoles = keycloak.tokenParsed?.realm_access?.roles || [];

    const clientRoles = Object.values(
        keycloak.tokenParsed?.resource_access || {}
    )
        .map((r: any) => r?.roles || [])
        .flat();

    const roles = [...new Set([...realmRoles, ...clientRoles])];

    return { isAuthenticated, token, roles };
}
