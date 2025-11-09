"use client"

import { Lock, Hash, Signature, KeyRound, Cpu, Key } from "lucide-react"
import { NavLink } from "react-router-dom"
import { motion } from "framer-motion"

export default function CryptoIndex() {
  const sections = [
    {
      title: "Confidentialité",
      description: "Chiffrement, déchiffrement et dérivation de clés.",
      url: "/crypto/confidentiality",
      icon: <Lock className="w-6 h-6 text-gray-500" />,
      cardColor: "bg-[#14b8a6]",
      iconBg: "bg-[#fcfcfc]",
    },
    {
      title: "Intégrité",
      description: "Hashage, HMAC et vérification d’intégrité.",
      url: "/crypto/integrity",
      icon: <Hash className="w-6 h-6 text-gray-500" />,
      cardColor: "bg-[#919293]",
      iconBg: "bg-[#fcfcfc]",
    },
    {
      title: "Authenticité",
      description: "Signatures numériques et vérification.",
      url: "/crypto/authenticity",
      icon: <Signature className="w-6 h-6 text-gray-500" />,
      cardColor: "bg-[#606162]",
      iconBg: "bg-[#fcfcfc]",
    },
    {
      title: "Non-Répudiation",
      description: "Audit, timestamp et PKI (à venir).",
      url: "/crypto/non-repudiation",
      icon: <KeyRound className="w-6 h-6 text-gray-500" />,
      cardColor: "bg-gradient-to-r from-[#ffb340] to-[#ffa740]",
      iconBg: "bg-[#fcfcfc]",
    },
    {
      title: "Gestion des clés",
      description: "Liste, génération et gestion des clés AES/RSA.",
      url: "/crypto/keys",
      icon: <Key className="w-6 h-6 text-gray-500" />,
      cardColor: "bg-[#14b8a6]",
      iconBg: "bg-[#fcfcfc]",
    },
    {
      title: "Algorithmes",
      description: "Consultez et ajoutez des algorithmes supportés.",
      url: "/crypto/algorithmes",
      icon: <Cpu className="w-6 h-6 text-gray-500" />,
      cardColor: "bg-gradient-to-r from-[#ffb340] to-[#ffa740]",
      iconBg: "bg-[#fcfcfc]",
    },
  ]

  return (
    <div className="bg-[#fcfcfc] p-6 border border-[#c7c7cc] rounded-[10px] shadow-[0_0_3px_1px_#c8c8cc]">
      <h1 className="text-[2.5rem] font-bold text-center text-black drop-shadow-[1px_1px_0_#fcfcfc] mb-8">
        🔐 Espace Cryptographie
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sections.map((section, index) => (
          <div
            key={section.title}
            className="cursor-pointer transition-transform duration-300 border border-[#c7c7cc] rounded-[10px] shadow-[0_0_3px_1px]"
          >
            <NavLink to={section.url} className="block">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05, rotate: 2 }}
                className={`p-5 border border-[#c7c7cc] rounded-[10px] shadow-[0_0_3px_1px] ${section.cardColor}`}>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="block text-white text-[1.5rem] font-semibold mb-2 drop-shadow-[1px_1px_0_#fcfcfc]">
                      {section.title}
                    </span>
                    <p className="text-sm text-white">{section.description}</p>
                  </div>
                  <div
                    className={`flex items-center justify-center rounded-full ${section.iconBg}`}
                    style={{ width: "2.5rem", height: "2.5rem" }}
                  >
                    {section.icon}
                  </div>
                </div>
                <span className="text-white font-medium">Explorer →</span>
              </motion.div>
            </NavLink>
          </div>
        ))}
      </div>
    </div>
  )
}
