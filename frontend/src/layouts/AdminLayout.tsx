// src/layouts/AdminLayout.tsx
"use client"

import { Outlet } from "react-router-dom"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"

export default function AdminLayout() {
    return (
        <SidebarProvider>
            <div className="flex min-h-screen w-full">
                {/* Sidebar à gauche */}
                <AppSidebar />

                {/* Contenu principal */}
                <main className="flex-1 p-6">
                    <div className="flex items-center mt-[-15px]">
                        <SidebarTrigger className="mr-2" />
                        <h1
                            className="text-[1.5rem] font-bold text-white mt-[-2px]"
                            style={{
                                textShadow: "1px 1px 0 #000000",
                                fontFamily: "'Dancing Script', cursive",
                            }}
                        >
                            Tableau de Bord Administrateur
                        </h1>
                    </div>
                    <Outlet />
                </main>
            </div>
        </SidebarProvider>
    )
}
