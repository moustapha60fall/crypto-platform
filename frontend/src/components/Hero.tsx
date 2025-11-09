"use client"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Link } from "react-router-dom"

// === Hook personnalisé : effet de frappe (typewriter) ===
function useTypewriter(lines: string[], delay = 50, start = false) {
    const [displayed, setDisplayed] = useState<string[]>([])
    const [lineIndex, setLineIndex] = useState(0)
    const [charIndex, setCharIndex] = useState(0)

    useEffect(() => {
        if (!start || lineIndex >= lines.length) return
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
        }

        return () => clearTimeout(timeout)
    }, [charIndex, lineIndex, lines, displayed, delay, start])

    return displayed
}

export default function Hero() {
    const gifs = ["/gif1.gif", "/gif2.gif", "/gif3.gif"]
    const [currentGif, setCurrentGif] = useState(0)
    const [showTitle, setShowTitle] = useState(false)
    const [showTerminal, setShowTerminal] = useState(false)
    const [showButtons, setShowButtons] = useState(false)
    const [gradientColors, setGradientColors] = useState(["#0077FF", "#00FFD1"])

    // === Gestion des changements dynamiques ===
    useEffect(() => {
        const timings = [
            { delay: 3500, nextGif: 1, colors: ["#00FFD1", "#00CFFF"] },
            { delay: 7000, nextGif: 2, colors: ["#00CFFF", "#0077FF"] },
            { delay: 10500, showTitle: true },
            { delay: 12500, showTerminal: true },
        ]

        const timers = timings.map((t) =>
            setTimeout(() => {
                if (t.nextGif !== undefined) {
                    setCurrentGif(t.nextGif)
                    if (t.colors) setGradientColors(t.colors)
                }
                if (t.showTitle) setShowTitle(true)
                if (t.showTerminal) setShowTerminal(true)
            }, t.delay)
        )

        return () => timers.forEach(clearTimeout)
    }, [])

    // === Terminal texte animé ===
    const lines = [
        "> Initialisation du module cryptographique...",
        "> Chargement des primitives : AES, RSA, SHA256",
        "> Démarrage des services : Confidentialité, Intégrité, Authenticité",
    ]
    const typedLines = useTypewriter(lines, 35, showTerminal)

    // === Quand le terminal est fini → afficher les boutons ===
    useEffect(() => {
        if (typedLines.length === lines.length) {
            const lastLine = lines[lines.length - 1]
            if (typedLines[typedLines.length - 1] === lastLine) {
                const timer = setTimeout(() => setShowButtons(true), 1000)
                return () => clearTimeout(timer)
            }
        }
    }, [typedLines, lines])

    return (
        <section
            className="relative w-full h-[25rem] max-w-screen-rg mx-auto py-6 px-3 flex flex-col items-center justify-center text-white overflow-hidden"
            style={{ backgroundColor: "#002C3E" }}
        >
            {/* === Fond animé (réseau dynamique + changement de couleur) === */}
            <svg
                className="absolute inset-0 w-full h-full -z-10 opacity-40 transition-colors duration-1000"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
            >
                <defs>
                    <linearGradient id="cryptoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor={gradientColors[0]}>
                            <animate
                                attributeName="stop-color"
                                values={`${gradientColors[0]};${gradientColors[1]};${gradientColors[0]}`}
                                dur="6s"
                                repeatCount="indefinite"
                            />
                        </stop>
                        <stop offset="100%" stopColor={gradientColors[1]}>
                            <animate
                                attributeName="stop-color"
                                values={`${gradientColors[1]};${gradientColors[0]};${gradientColors[1]}`}
                                dur="6s"
                                repeatCount="indefinite"
                            />
                        </stop>
                    </linearGradient>
                </defs>

                {[...Array(25)].map((_, i) => (
                    <motion.line
                        key={i}
                        x1={Math.random() * 100}
                        y1={Math.random() * 100}
                        x2={Math.random() * 100}
                        y2={Math.random() * 100}
                        stroke="url(#cryptoGradient)"
                        strokeWidth="0.2"
                        initial={{ opacity: 0, pathLength: 0 }}
                        animate={{ opacity: [0.3, 1, 0.3], pathLength: [0, 1, 0] }}
                        transition={{
                            duration: 6 + Math.random() * 4,
                            delay: Math.random() * 2,
                            repeat: Infinity,
                        }}
                    />
                ))}
            </svg>

            {/* === GIFs puis Titre === */}
            <div className="relative flex flex-col items-center justify-center">
                <AnimatePresence mode="wait">
                    {!showTitle ? (
                        <motion.img
                            key={gifs[currentGif]}
                            src={gifs[currentGif]}
                            alt={`Animation ${currentGif + 1}`}
                            className="w-120 h-120 object-contain mb-10"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.8, ease: "easeInOut" }}
                        />
                    ) : (
                        <motion.h1
                            key="title"
                            className="text-4xl font-bold tracking-tight mb-6"
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 1 }}
                        >
                            Plateforme de Sécurité Cryptographique 🔐
                        </motion.h1>
                    )}
                </AnimatePresence>
            </div>

            {/* === Terminal === */}
            {showTerminal && (
                <motion.div
                    className="bg-black/70 border border-green-400 text-green-400 font-mono text-sm p-6 rounded-md shadow-lg max-w-2xl mx-auto mt-8 mb-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1 }}
                >
                    {typedLines.map((line, i) => (
                        <p key={i} className="whitespace-pre-wrap">{line}</p>
                    ))}
                    {typedLines.length < lines.length && <p className="animate-pulse">▌</p>}
                </motion.div>
            )}

            {/* === Boutons === */}
            <AnimatePresence>
                {showButtons && (
                    <motion.div
                        key="buttons"
                        className="flex justify-center gap-4 mt-10"
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        variants={{
                            hidden: { opacity: 0, scale: 0.8 },
                            visible: {
                                opacity: 1,
                                scale: 1,
                                transition: {
                                    duration: 0.6,
                                    ease: "easeOut",
                                    staggerChildren: 0.3,
                                },
                            },
                        }}
                    >
                        <Link
                            to="/crypto"
                            className={`
      flex items-center gap-2 px-7 py-3 font-semibold 
      text-[#002C3E] hover:ring-indigo-300 bg-white 
      shadow-md hover:ring-2 transition-all border-l-4 
      border-b-4 border-t-1 border-r-1 border-[#27ccc3]
      rounded-full bg-gradient-to-br from-white/80 to-gray-100/60
          `}
                        >

                            Accéder aux services
                        </Link>
                        <Link
                            to="/user"
                            className={`
      flex items-center gap-2 p- sm:p-4 
      px-6 py-3 font-semibold text-[#002C3E]
      hover:ring-indigo-300 bg-white shadow-md 
      hover:ring-2 transition-all border-r-4 
      border-b-4 border-t-1 border-r-1 border-[#27ccc3]
      rounded-full bg-gradient-to-br from-white/80 to-gray-100/60
          `}
                        >
                            Mon espace personel..
                        </Link>
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    )
}
