"use client"

import { Navbar } from "@/components/Navbar.tsx";
import { Footer } from "@/components/Footer"
import { Outlet, useLocation } from "react-router-dom"
import { Toaster } from "sonner"

export default function AppLayout() {
    const location = useLocation()

    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />
            <Toaster richColors position="top-right" />

            <main className="flex-1">
                <Outlet key={location.pathname} />
            </main>
            <Footer />
        </div>
    )
}
