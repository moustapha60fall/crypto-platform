import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import keycloak from "@/keycloak.ts"
import { ReactKeycloakProvider } from "@react-keycloak/web"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import "./index.css"
import App from "./App.tsx"

// ⚡️ crée une seule instance de QueryClient
const queryClient = new QueryClient()

createRoot(document.getElementById("root")!).render(
  <ReactKeycloakProvider
    authClient={keycloak}
    initOptions={{
      onLoad: "login-required",
      checkLoginIframe: false, // désactive l'iframe de refresh
      pkceMethod: "S256", // meilleure sécurité OAuth2
    }}
  >
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </StrictMode>
  </ReactKeycloakProvider>
)
