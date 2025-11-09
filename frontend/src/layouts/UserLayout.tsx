"use client"

import { Outlet, useLocation } from "react-router-dom"
import { AnimatePresence, motion } from "framer-motion"
import UserNav from "@/components/UserNav"
import UserBreadcrumb from "@/components/UserBreadcrumb"

export default function UserLayout() {
    const location = useLocation()

    return (
        <div className="flex flex-col min-h-[80vh] gap-6 px-6 py-6">
            {/* En-tête ou breadcrumb si nécessaire */}
            <UserBreadcrumb />

            <div className="flex flex-1 gap-6">
                {/* === Menu latéral utilisateur === */}
                <aside className="w-64 flex-shrink-0">
                    <UserNav />
                </aside>

                {/* === Contenu principal animé === */}
                <AnimatePresence mode="wait">
                    <motion.main
                        key={location.pathname}
                        layout
                        className="relative flex-1 border border-[#c7c7cc] bg-[#fcfcfc] rounded-lg shadow-[0px_0px_3px_1px] p-6 overflow-hidden"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                    >
                        <Outlet />
                    </motion.main>
                </AnimatePresence>
            </div>
        </div>
    )
}
