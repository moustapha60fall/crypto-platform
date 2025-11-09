"use client"

import { NavLink } from "react-router-dom"
import { motion } from "framer-motion"
import { AccountMenu } from "./AccountMenu"
import AnimatedDropdown from "./AnimatedDropdown"

export function Navbar() {

  return (
    <motion.header
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 100, damping: 18 }}
      className="relative z-50 w-full bg-green-300 text-white backdrop-blur-md border-b border-white"
    >

      <div className="w-full mx-auto flex items-center justify-between px-5 py-3">
        <NavLink
          to="/"
          className="text-2xl font-extrabold tracking-wide bg-gradient-to-r from-white to-[#002C3E] text-transparent bg-clip-text hover:opacity-90 transition"
        >
          CryptoApp
        </NavLink>

        {/* === Menu principal au centre === */}
        <nav
          className="hidden md:flex gap-6 items-center text-sm"
          role="navigation"
          aria-label="Menu principal"
        >
          <AnimatedDropdown />
        </nav>

        {/* === Compte utilisateur === */}
        <AccountMenu />
      </div>
    </motion.header>
  )
}
