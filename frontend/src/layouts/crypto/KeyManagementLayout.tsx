"use client"

import { motion } from "framer-motion"
import { Outlet } from "react-router-dom"

export default function KeyManagementLayout() {
  return (
    <motion.div
      className="gap-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="md:col-span-3">
        <Outlet /> {/* ✅ C’est ici que React Router injectera tes sous-routes */}
      </div>
    </motion.div>
  )
}
