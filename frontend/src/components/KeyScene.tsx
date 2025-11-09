import { motion, useAnimation, type Variants } from "framer-motion";
import { useEffect, useRef, useState } from "react";

/**
 * KeyScene.tsx
 * Vite + React + TypeScript + Framer Motion
 *
 * Simple SVG-based scene animée :
 * 1) Le personnage regarde les 3 clés
 * 2) Essaie 1 → nothing / Essaie 2 → nothing / Essaie 3 → succès
 * 3) Clé dorée brille, panneau s'illumine et s'ouvre
 * 4) Victoire (bras levés) + texte final (optionnel)
 *
 * Copy-paste-ready.
 */

const sceneVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
};

const keyVariants = {
    idle: { y: 0, rotate: 0, scale: 1 },
    picked: { y: -60, scale: 1.05 },
    wrongClick: { rotate: [0, -8, 8, -6, 6, 0], transition: { duration: 0.8 } },
    rightClick: { rotate: [0, 8, -8, 4, -4, 0], transition: { duration: 0.6 } },
    glow: {
        boxShadow: "0px 0px 24px rgba(255,200,50,0.85)",
        transition: { repeat: Infinity, repeatType: "reverse", duration: 1.2 },
    },
};

const panelVariants = {
    closed: { scaleX: 1, opacity: 1 },
    opening: { scaleX: 1.02, opacity: 1 },
    open: { scaleX: 0, opacity: 0.98, transition: { duration: 0.9, ease: "easeOut" } },
};

export default function KeyScene() {
    const [step, setStep] = useState<number>(0); // 0 initial, 1 trying keys, 2 success/lighting, 3 victory
    const [selectedKey, setSelectedKey] = useState<number | null>(null);
    const [showText, setShowText] = useState(false);

    const controlsHead = useAnimation();
    const controlsKeys = useAnimation();
    const controlsPanel = useAnimation();
    const controlsCharacter = useAnimation();
    const goldGlowRef = useRef<SVGRectElement | null>(null);

    useEffect(() => {
        // Initial small head-eye glance
        (async () => {
            await controlsHead.start({
                rotate: [0, -5, 5, -2, 0],
                transition: { duration: 1.2 },
            });
            // slight bob of keys to catch attention
            controlsKeys.start({
                y: [0, -6, 0],
                transition: { duration: 1.2, repeat: 1 },
            });
        })();
    }, []);

    // sequence to try the keys (called when user clicks a key)
    const tryKey = async (index: number) => {
        if (step >= 2) return; // if already success, ignore
        setSelectedKey(index);
        // pick animation
        await controlsKeys.start((i) =>
            i === index ? { scale: 1.05, y: -60, transition: { duration: 0.35 } } : {}
        );

        // simulate click feedback
        if (index !== 2) {
            // wrong key
            await controlsKeys.start((i) =>
                i === index ? { rotate: [0, -12, 8, -6, 4, 0], transition: { duration: 0.75 } } : {}
            );
            // short pause, put back
            await controlsKeys.start((i) =>
                i === index ? { y: 0, scale: 1, transition: { duration: 0.35 } } : {}
            );
            // small head shake / disappointed
            await controlsHead.start({ rotate: [0, 6, -6, 3, -2, 0], transition: { duration: 0.9 } });
        } else {
            // right key (index 2)
            await controlsKeys.start((i) =>
                i === index ? { rotate: [0, 10, -10, 6, -4, 0], transition: { duration: 0.6 } } : {}
            );
            // gold key glow + panel reaction
            setStep(2);
            // bring key down and put it in the lock (subtle)
            await controlsKeys.start((i) =>
                i === index ? { y: -18, x: 48, rotate: 8, transition: { duration: 0.6 } } : {}
            );

            // panel illumination
            await controlsPanel.start({ scaleX: 1.02, opacity: 1, transition: { duration: 0.25 } });
            // glow on gold key (we animate a separate element)
            // tiny delay then open panel
            await new Promise((r) => setTimeout(r, 350));
            await controlsPanel.start("open");
            // character victory
            setStep(3);
            await controlsCharacter.start({
                y: [0, -6, 0],
                rotate: [0, 0, 0],
                transition: { duration: 0.5 },
            });
            await controlsCharacter.start({
                rotate: [0, -6, 6, -4, 0],
                transition: { duration: 0.9 },
            });

            // show final text
            setTimeout(() => setShowText(true), 700);
        }
        setSelectedKey(null);
    };

    // small helper to get key color by index
    const keyColor = (i: number) => (i === 2 ? "#E6B422" : i === 1 ? "#7B8CDE" : "#6C6C6C");

    return (
        <motion.div
            className="key-scene-root"
            style={{
                width: "100%",
                maxWidth: 920,
                margin: "32px auto",
                padding: 24,
                background: "#ffffff",
                borderRadius: 14,
                boxShadow: "0 8px 30px rgba(20,20,30,0.06)",
            }}
            variants={sceneVariants}
            initial="hidden"
            animate="visible"
        >
            <div style={{ display: "flex", gap: 40, alignItems: "center", justifyContent: "space-between" }}>
                {/* Left: Character */}
                <div style={{ width: 260, display: "flex", justifyContent: "center" }}>
                    <motion.svg
                        width="220"
                        height="220"
                        viewBox="0 0 220 220"
                        style={{ overflow: "visible" }}
                        animate={controlsCharacter}
                    >
                        {/* shadow */}
                        <ellipse cx="110" cy="190" rx="62" ry="10" fill="rgba(0,0,0,0.06)" />

                        {/* torso */}
                        <motion.g transform="translate(70,70)">
                            <motion.rect
                                x="0"
                                y="40"
                                width="80"
                                height="54"
                                rx="10"
                                fill="#FFB055"
                                stroke="#333"
                                strokeWidth={2}
                            />

                            {/* head group */}
                            <motion.g
                                transform="translate(22,-10)"
                                animate={controlsHead}
                                style={{ originX: "50%", originY: "50%" }}
                            >
                                <circle cx="18" cy="18" r="28" fill="#fff" stroke="#333" strokeWidth={2} />
                                {/* hair */}
                                <path d="M2 2 C10 -8, 36 -8, 44 2" stroke="#333" strokeWidth={3} fill="none" strokeLinecap="round" />
                                {/* eyes */}
                                <circle cx="6" cy="18" r="3" fill="#333" />
                                <circle cx="30" cy="18" r="3" fill="#333" />
                                {/* smile */}
                                <path d="M6 28 Q18 34 30 28" stroke="#333" strokeWidth={2} fill="none" strokeLinecap="round" />
                                {/* small head nod / tilt handled by controlsHead */}
                            </motion.g>

                            {/* arms — left down */}
                            <path d="M-2 55 Q20 70 8 82" stroke="#333" strokeWidth={4} fill="none" strokeLinecap="round" />
                            {/* arms — right */}
                            <motion.path
                                d={step === 3 ? "M82 52 Q100 -8 92 10" : "M82 52 Q100 70 72 80"}
                                stroke="#333"
                                strokeWidth={4}
                                fill="none"
                                strokeLinecap="round"
                            />
                        </motion.g>
                    </motion.svg>
                </div>

                {/* Center: Keys */}
                <div style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center" }}>
                    <svg width="420" height="220" viewBox="0 0 420 220">
                        <defs>
                            <filter id="softglow" x="-50%" y="-50%" width="200%" height="200%">
                                <feGaussianBlur stdDeviation="6" result="coloredBlur" />
                                <feMerge>
                                    <feMergeNode in="coloredBlur" />
                                    <feMergeNode in="SourceGraphic" />
                                </feMerge>
                            </filter>
                        </defs>

                        {/* ground shadow for keys */}
                        <ellipse cx="210" cy="180" rx="160" ry="16" fill="rgba(0,0,0,0.05)" />

                        {/* Key 0 (left) */}
                        <motion.g
                            custom={0}
                            animate={controlsKeys}
                            initial="idle"
                            style={{ cursor: step >= 2 ? "default" : "pointer" }}
                            onClick={() => tryKey(0)}
                            transform="translate(120,110)"
                        >
                            <motion.circle r="10" cx="0" cy="0" fill={keyColor(0)} stroke="#333" strokeWidth={2} />
                            <rect x="12" y="-6" width="46" height="12" rx="3" fill={keyColor(0)} stroke="#333" strokeWidth={2} />
                            <rect x="50" y="-4" width="8" height="4" rx="1" fill="#333" />
                        </motion.g>

                        {/* Key 1 (middle) */}
                        <motion.g
                            custom={1}
                            animate={controlsKeys}
                            initial="idle"
                            style={{ cursor: step >= 2 ? "default" : "pointer" }}
                            onClick={() => tryKey(1)}
                            transform="translate(220,110)"
                        >
                            <circle r="12" cx="0" cy="0" fill={keyColor(1)} stroke="#333" strokeWidth={2} />
                            <rect x="14" y="-7" width="54" height="14" rx="3" fill={keyColor(1)} stroke="#333" strokeWidth={2} />
                            <rect x="60" y="-6" width="10" height="5" rx="1" fill="#333" />
                        </motion.g>

                        {/* Key 2 (gold) - correct key */}
                        <motion.g
                            custom={2}
                            animate={controlsKeys}
                            initial="idle"
                            style={{ cursor: step >= 2 ? "default" : "pointer" }}
                            onClick={() => tryKey(2)}
                            transform="translate(320,110)"
                        >
                            <motion.ellipse
                                cx="0"
                                cy="0"
                                rx="14"
                                ry="12"
                                fill={keyColor(2)}
                                stroke="#6b4f00"
                                strokeWidth={2}
                                // glow when success
                                animate={step === 2 ? { filter: "url(#softglow)" } : {}}
                            />
                            <rect x="16" y="-8" width="66" height="16" rx="4" fill={keyColor(2)} stroke="#6b4f00" strokeWidth={2} />
                            <rect x="78" y="-6" width="12" height="6" rx="1" fill="#6b4f00" />

                            {/* pulsing halo ring */}
                            {step >= 2 && (
                                <motion.circle
                                    cx="0"
                                    cy="0"
                                    r="22"
                                    fill="none"
                                    stroke="rgba(230,180,50,0.28)"
                                    strokeWidth={6}
                                    animate={{ opacity: [0.9, 0.25, 0.9], r: [22, 28, 22] }}
                                    transition={{ repeat: Infinity, duration: 1.6 }}
                                />
                            )}
                        </motion.g>
                    </svg>
                </div>

                {/* Right: Panel with keyhole */}
                <div style={{ width: 220, display: "flex", justifyContent: "center" }}>
                    <motion.svg width="160" height="220" viewBox="0 0 160 220">
                        <defs>
                            <linearGradient id="panelGrad" x1="0" y1="0" x2="1" y2="1">
                                <stop offset="0%" stopColor="#f5f5f7" />
                                <stop offset="100%" stopColor="#eaeaea" />
                            </linearGradient>
                        </defs>

                        <motion.rect
                            x="8"
                            y="24"
                            width="144"
                            height="160"
                            rx="10"
                            fill="url(#panelGrad)"
                            stroke="#333"
                            strokeWidth={2}
                            initial="closed"
                            animate={controlsPanel}
                            style={{ transformOrigin: "left center" }}
                        />

                        {/* keyhole on the panel */}
                        <motion.g transform="translate(86,110)">
                            <rect x="-6" y="-30" width="12" height="20" rx="6" fill="#222" />
                            <circle cx="0" cy="-10" r="8" fill="#222" />
                        </motion.g>

                        {/* panel opening effect — small light burst */}
                        {step >= 2 && (
                            <motion.circle
                                cx="68"
                                cy="40"
                                r="8"
                                fill="rgba(255,210,60,0.95)"
                                initial={{ opacity: 0, scale: 0.6 }}
                                animate={{ opacity: [0.0, 1.0, 0.0], scale: [0.6, 1.4, 2.0] }}
                                transition={{ duration: 1.1 }}
                            />
                        )}
                    </motion.svg>
                </div>
            </div>

            {/* Final message */}
            <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: showText ? 1 : 0, y: showText ? 0 : 6 }}
                transition={{ duration: 0.6 }}
                style={{ textAlign: "center", marginTop: 18 }}
            >
                {showText ? (
                    <div style={{ fontSize: 18, fontWeight: 600, color: "#333" }}>
                        La bonne clé ouvre toutes les portes. 😄
                    </div>
                ) : null}
            </motion.div>
        </motion.div>
    );
}
