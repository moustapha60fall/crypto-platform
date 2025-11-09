// src/components/Footer.tsx
"use client"

export function Footer() {
    return (
        <footer className="bg-gray-900 text-gray-300 text-sm py-4 mt-8">
            <div className="max-w-7xl mx-auto text-center">
                © {new Date().getFullYear()} CryptoApp — Tous droits réservés.
            </div>
        </footer>
    )
}
