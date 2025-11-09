import './App.css'
import { useKeycloak } from "@react-keycloak/web";
import AppRouter from './router/AppRouter';

function App() {
    const { keycloak, initialized } = useKeycloak()

    if (!initialized) return <div>Chargement...</div>

    const clientRoles = keycloak.tokenParsed?.resource_access?.['react-app']?.roles || []

    if (!keycloak.authenticated) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <h2 className="text-xl font-semibold mb-4">Veuillez vous connecter pour accéder à CryptoApp</h2>
                <button onClick={() => keycloak.login()} className="bg-blue-600 text-white px-4 py-2 rounded">
                    Connexion
                </button>
            </div>
        )
    }

    if (!clientRoles.includes('ADMIN') && !clientRoles.includes('USER')) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <h2 className="text-xl font-semibold mb-4 text-red-600">Accès non autorisé</h2>
                <button onClick={() => keycloak.logout()} className="bg-gray-800 text-white px-4 py-2 rounded">
                    Déconnexion
                </button>
            </div>
        )
    }

    return (
        <>
            <AppRouter />
        </>
    )
}

export default App
