"use client"

import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"

export default function NotFoundPage() {
    const navigate = useNavigate()

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 text-center px-4">
            {/* Illustration */}
            <svg
                className="w-32 h-32 mb-6 text-blue-600 animate-bounce"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                viewBox="0 0 24 24"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
            </svg>

            {/* Message */}
            <h1 className="text-3xl font-bold mb-2">Oups ! Page introuvable</h1>
            <p className="text-gray-600 mb-6">
                La page que vous cherchez n’existe pas ou a été déplacée.
            </p>

            {/* Bouton retour */}
            <Button onClick={() => navigate("/")}>🏠 Retour à l’accueil</Button>
        </div>
    )
}
