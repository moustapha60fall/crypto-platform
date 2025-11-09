"use client"

import { motion } from "framer-motion"
import { Outlet } from "react-router-dom"

export default function ConfidentialityLayout() {
  return (
    <motion.div
      className="gap-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div>
        <Outlet />
      </div>
    </motion.div>
  )
}

