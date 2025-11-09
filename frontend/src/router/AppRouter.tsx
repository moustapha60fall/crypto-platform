import NotFoundPage from "@/pages/NotFoundPage"
import {
    createBrowserRouter,
    RouterProvider,
} from "react-router-dom"
import RequireRole from "@/auth/RequireRoles"
import PbeDeriveForm from "@/pages/crypto/confidentiality/PbeDeriveForm.tsx";
import AProposPage from "@/pages/about/AProposPage.tsx";
import AboutLayout from "@/layouts/AboutLayout";
import AppLayout from "@/layouts/AppLayout";
import HomePage from "@/pages/HomePage.tsx";
import UserLayout from "@/layouts/UserLayout";
import AdminLayout from "@/layouts/AdminLayout.tsx";
import CryptoLayout from "@/layouts/CryptoLayout.tsx";
import ProfilePage from "@/pages/user/ProfilePage.tsx";
import UsersPage from "@/pages/admin/UsersPage.tsx";
import UserDetailsPage from "@/pages/admin/UserDetailsPage.tsx";
import CryptoIndex from "@/pages/crypto/CryptoIndex.tsx";
import AuthenticityIndex from "@/pages/crypto/authenticity/AuthenticityIndex";
import IntegrityIndex from "@/pages/crypto/integrity/IntegrityIndex";
import ConfidentialityIndex from "@/pages/crypto/confidentiality/ConfidentialityIndex";
import NonRepudiationIndex from "@/pages/crypto/NonRepudiation/NonRepudiationIndex";
import IntegrityLayout from "@/layouts/crypto/IntegrityLayout";
import AuthenticityLayout from "@/layouts/crypto/AuthenticityLayout";
import NonRepudiationLayout from "@/layouts/crypto/NonRepudiationLayout";
import KeyManagementLayout from "@/layouts/crypto/KeyManagementLayout";
import ConfidentialityLayout from "@/layouts/crypto/ConfidentialityLayout";
import CryptoTabs from "@/components/CryptoTabs";
import AsymmetricCryptoTabs from "@/components/AsymmetricCryptoTabs";
import VerifyCryptoTabs from "@/components/VerifyCryptoTabs";
import SignCryptoTabs from "@/components/SignCryptoTabs";
import HashCryptoTabs from "@/components/HashCryptoTabs";
import WrappingTabs from "@/components/WrappingTabs";
import UnWrappingTabs from "@/components/UnWrappingTabs";
import SharedTabs from "@/components/SharedTabs";
import GenerateKeyTabs from "@/components/GenerateKeyTabs";
import ListKeysTabs from "@/components/ListKeysTabs";
import KeyDetailPage from "@/pages/crypto/keys/KeyDetailPage";
import UserOperationsPage from "@/pages/crypto/keys/UserOperationsPage";
import UsersTabs from "@/components/UsersTabs";
import MyKeysPage from "@/pages/crypto/keys/MyKeysPage";
import SharesPage from "@/pages/crypto/keys/SharesPage";
import KeysPage from "@/pages/admin/KeysPage";
import StatsPage from "@/pages/admin/StatsPage";
import KeyDetailsPage from "@/pages/admin/KeyDetailsPage";
import OperationsPage from "@/pages/admin/OperationsPage";
import OperationDetailsPage from "@/pages/admin/OperationDetailsPage";
import ShareKeyPage from "@/pages/admin/ShareKeyPage";
import Dashboard from "@/pages/admin/Dashboard";

const router = createBrowserRouter([
    {
        path: "/",
        element: <AppLayout />,
        children: [
            { index: true, element: <HomePage /> },

            // 👤 Espace utilisateur
            {
                path: "user",
                element: (
                    <RequireRole roles={["ADMIN", "USER"]} mode="OR">
                        <UserLayout />
                    </RequireRole>
                ),
                children: [
                    { index: true, element: <UsersTabs /> },
                    { path: "status", element: <ProfilePage /> },
                    { path: "keys", element: <MyKeysPage /> },
                    { path: "operations", element: <UserOperationsPage /> },
                    { path: "shares", element: <SharesPage /> }
                ],
            },

            // 🔑 Espace admin
            {
                path: "admin",
                element: (
                    <RequireRole roles={["ADMIN", "USER", "AUDITOR"]} mode="AND">
                        <AdminLayout />
                    </RequireRole>
                ),
                children: [
                    // 👤 Utilisateurs
                    { index: true, element: <Dashboard /> },
                    { path: "users", element: <UsersPage /> },
                    { path: "users/:id", element: <UserDetailsPage /> },
                    // { path: "users/create", element: <CreateUserPage /> },

                    // 🔑 Clés
                    { path: "keys", element: <KeysPage /> },
                    { path: "keys/:id", element: <KeyDetailsPage /> },
                    { path: "keys/share", element: <ShareKeyPage /> },

                    // 🔄 Opérations
                    { path: "operations", element: <OperationsPage /> },
                    { path: "operations/:id", element: <OperationDetailsPage /> },

                    // 📊 Statistiques
                    { path: "stats", element: <StatsPage /> },
                ],
            },

            // 🔒 Espace Crypto
            {
                path: "crypto",
                element: (
                    <RequireRole roles={["ADMIN", "USER"]} mode="OR">
                        <CryptoLayout />
                    </RequireRole>
                ),
                children: [
                    { index: true, element: <CryptoIndex /> },

                    // 🔐 Confidentialité
                    {
                        path: "confidentiality",
                        element: <ConfidentialityLayout />,
                        children: [
                            { index: true, element: <ConfidentialityIndex /> },
                            { path: "pair", element: <AsymmetricCryptoTabs /> },
                            { path: "aes", element: <CryptoTabs /> },
                            { path: "wrap", element: <WrappingTabs /> },
                            { path: "unwrap", element: <UnWrappingTabs /> },
                        ],
                    },

                    // 🧬 Intégrité
                    {
                        path: "integrity",
                        element: <IntegrityLayout />,
                        children: [
                            { index: true, element: <IntegrityIndex /> },
                            { path: "hash", element: <HashCryptoTabs /> },
                            { path: "hmac", element: <HashCryptoTabs /> },
                        ],
                    },

                    // ✅ Authenticité
                    {
                        path: "authenticity",
                        element: <AuthenticityLayout />,
                        children: [
                            { index: true, element: <AuthenticityIndex /> },
                            { path: "sign", element: <SignCryptoTabs /> },
                            { path: "verify", element: <VerifyCryptoTabs /> },
                        ],
                    },

                    // 🛑 Non-répudiation
                    {
                        path: "non-repudiation",
                        element: <NonRepudiationLayout />,
                        children: [
                            { index: true, element: <NonRepudiationIndex /> },
                            // futur : audit, timestamp, pki
                        ],
                    },

                    // 🔑 Gestion des clés
                    {
                        path: "keys",
                        element: <KeyManagementLayout />,
                        children: [
                            { index: true, element: <ListKeysTabs /> },
                            { path: "list", element: <ListKeysTabs /> },
                            { path: ":keyRef", element: <KeyDetailPage /> },
                            { path: ":userId", element: <UserOperationsPage /> },

                            { path: "pbe", element: <PbeDeriveForm /> },
                            { path: "generate", element: <GenerateKeyTabs /> },
                            { path: "shared", element: <SharedTabs /> },

                        ],
                    },
                ],
            },


            // ℹ️ À propos
            {
                path: "a-propos",
                element: <AboutLayout />,
                children: [{ index: true, element: <AProposPage /> }],
            },

            // ❌ Not found
            { path: "*", element: <NotFoundPage /> },
        ],
    },
])

export default function AppRouter() {
    return <RouterProvider router={router} />
}
