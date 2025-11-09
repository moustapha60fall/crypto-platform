"use client"

import { useLocation } from "react-router-dom"
import { AnimatePresence, motion } from "framer-motion"
import { Outlet } from "react-router-dom"
import CryptoBreadcrumb from "@/components/CryptoBreadcrumb"
import CryptoNav from "@/components/CryptoNav"

export default function CryptoLayout() {
  const location = useLocation()

  // Détection du service actif
  const service = (() => {
    const path = location.pathname
    if (path.includes("/confidentiality")) return "confidentiality"
    if (path.includes("/integrity")) return "integrity"
    if (path.includes("/authenticity")) return "authenticity"
    if (path.includes("/non-repudiation")) return "non-repudiation"
    if (path.includes("/keys")) return "keys"
    if (path.includes("/algorithmes")) return "algorithmes"
    return null
  })()

  return (
    <div className="flex flex-col min-h-[80vh] gap-6 px-6 py-6">
      <CryptoBreadcrumb />

      <div className="flex flex-1 gap-6">
        {/* === Menu latéral contextuel === */}
        {service && (
          <aside className="w-64 flex-shrink-0">
            <CryptoNav service={service} />
          </aside>
        )}

        {/* === Contenu principal animé === */}
        <AnimatePresence mode="wait">
          <motion.main
            key={location.pathname} // pour animer à chaque changement de page
            layout // <== rend la hauteur dynamique et animée
            className="relative flex-1 border border-[#c7c7cc] bg-[#fcfcfc] rounded-lg shadow-[0px_0px_3px_1px] p-6 p-6 overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          >
            <Outlet />
          </motion.main>
        </AnimatePresence>
      </div>
    </div>
  )
}
