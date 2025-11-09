"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Lock, Fingerprint, ShieldCheck, PenLine } from "lucide-react"
import { Link } from "react-router-dom"
import gif1 from "/gif1.gif"
import gif2 from "/gif2.gif"
import gif3 from "/gif3.gif"

// Hook : frappe lettre par lettre
function useTypewriter(lines: string[], delay = 40) {
  const [displayed, setDisplayed] = useState<string[]>([])
  const [lineIndex, setLineIndex] = useState(0)
  const [charIndex, setCharIndex] = useState(0)
  const [step, setStep] = useState(0)

  useEffect(() => {
    if (lineIndex >= lines.length) return
    const line = lines[lineIndex]

    const timeout = setTimeout(() => {
      const updated = [...displayed]
      updated[lineIndex] = (updated[lineIndex] || "") + line[charIndex]
      setDisplayed(updated)
      setCharIndex((c) => c + 1)
    }, delay)

    if (charIndex >= line.length) {
      setLineIndex((l) => l + 1)
      setCharIndex(0)
      setStep(lineIndex + 1)
    }

    return () => clearTimeout(timeout)
  }, [charIndex, lineIndex, lines, displayed, delay])

  return { displayed, step }
}

// Hook : position du curseur
function useMousePosition() {
  const [pos, setPos] = useState({ x: 50, y: 50 })

  useEffect(() => {
    const move = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 100
      const y = (e.clientY / window.innerHeight) * 100
      setPos({ x, y })
    }
    window.addEventListener("mousemove", move)
    return () => window.removeEventListener("mousemove", move)
  }, [])

  return pos
}

// Composant principal
export default function HeroTerminal({
  lines = [
    "Initialisation du module cryptographique...",
    "Chargement des primitives : AES, RSA, SHA-256...",
    "Activation des services : Confidentialité ✅, Intégrité ✅, Authenticité ✅",
    "Bienvenue sur CryptoSecure 🔐",
  ],
  children,
}: {
  lines?: string[]
  children?: React.ReactNode
}) {
  const { displayed: typedLines, step } = useTypewriter(lines)
  const { x, y } = useMousePosition()

  return (
    <div className="relative overflow-hidden">
      {/* Fond SVG dynamique */}
      <svg className="absolute inset-0 w-full h-full -z-10" viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs>
          <radialGradient id="grad" cx={`${x}%`} cy={`${y}%`} r="50%">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#1e3a8a" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#grad)" />
      </svg>

      {/* Contenu principal en deux colonnes */}
      <div className="flex flex-col md:flex-row items-start justify-center gap-8 mt-16 mb-12 px-4">
        {/* GIFs à gauche */}
        <div className="flex flex-col gap-4 w-full md:w-1/2">
          {[gif1, gif2, gif3].map((gif, i) => (
            <img
              key={i}
              src={gif}
              alt={`Étape ${i + 1}`}
              className={`rounded-lg shadow-md transition-opacity duration-500 ${step > i ? "opacity-100" : "opacity-0"
                }`}
            />
          ))}
        </div>

        {/* Terminal à droite */}
        <motion.div
          className="bg-black text-green-400 font-mono p-6 rounded-lg shadow-lg w-full md:w-1/2"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.3 },
            },
          }}
        >
          {typedLines.map((line, i) => (
            <motion.p
              key={i}
              className="flex"
              variants={{
                hidden: { opacity: 0, y: 10 },
                visible: { opacity: 1, y: 0 },
              }}
            >
              {line}
              {i === typedLines.length - 1 && <span className="animate-pulse ml-1">|</span>}
            </motion.p>
          ))}
        </motion.div>
      </div>

      {/* Icônes des services cryptographiques */}
      <div className="flex justify-center gap-6 mb-8 text-blue-600">
        <div className="flex flex-col items-center">
          <Lock size={32} />
          <span className="text-sm mt-1">Confidentialité</span>
        </div>
        <div className="flex flex-col items-center">
          <Fingerprint size={32} />
          <span className="text-sm mt-1">Intégrité</span>
        </div>
        <div className="flex flex-col items-center">
          <PenLine size={32} />
          <span className="text-sm mt-1">Authenticité</span>
        </div>
        <div className="flex flex-col items-center">
          <ShieldCheck size={32} />
          <span className="text-sm mt-1">Non-répudiation</span>
        </div>
      </div>

      {/* Bouton d’action */}
      <div className="flex justify-center mb-12">
        <Link to="/primitives">
          <button className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
            Explorer les primitives
          </button>
        </Link>
      </div>

      {/* Contenu injecté */}
      <motion.div
        className="max-w-4xl mx-auto pb-16"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        {children}
      </motion.div>
    </div>
  )
}
