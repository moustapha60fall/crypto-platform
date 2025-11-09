import { useKeycloak } from "@react-keycloak/web"

export function useUserRole(): "admin" | "user" | "guest" {
  const { keycloak } = useKeycloak()
  const roles = keycloak.tokenParsed?.resource_access?.["react-app"]?.roles || []
  if (roles.includes("ADMIN")) return "admin"
  if (roles.includes("USER")) return "user"
  return "guest"
}
