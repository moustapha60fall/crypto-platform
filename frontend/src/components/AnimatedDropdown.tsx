"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import PillCard from "./PillCard";
import { getSectionWidth, navSections } from "../data/data";

export default function AnimatedDropdown() {
    const [openSection, setOpenSection] = useState<string | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const toggleSection = (title: string) => {
        setOpenSection((prev) => (prev === title ? null : title));
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                containerRef.current &&
                !containerRef.current.contains(event.target as Node)
            ) {
                setOpenSection(null);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <div
            ref={containerRef}
            className="relative flex items-center justify-center gap-6 select-none"
        >
            {navSections.map((section) => (
                <div key={section.title} className="relative flex flex-col items-center">
                    {/* === Bouton principal === */}
                    <button
                        onClick={() => toggleSection(section.title)}
                        aria-expanded={openSection === section.title}
                        className="flex items-center gap-1 text-white/90 font-medium text-sm hover:text-white transition cursor-pointer"
                    >
                        <span
                            className={`nav-underline ${openSection === section.title ? "nav-underline-active" : ""
                                }`}
                        >
                            {section.title}
                        </span>

                        <motion.div
                            animate={{ rotate: openSection === section.title ? 180 : 0 }}
                            transition={{ duration: 0.3 }}
                            className="h-4 w-4 flex items-center justify-center cursor-pointer"
                        >
                            <ChevronDown className="w-5 h-5 text-white" />
                        </motion.div>
                    </button>

                    {/* === OFFCANVAS TOP === */}
                    <AnimatePresence>
                        {openSection === section.title && (
                            <>
                                {/* Overlay semi-transparent */}
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 0.4 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.3 }}
                                    onClick={() => setOpenSection(null)}
                                    className="fixed inset-0 bg-transparent z-40 cursor-pointer"
                                />

                                {/* Panneau Offcanvas */}
                                <motion.div
                                    exit={{ opacity: 0, y: -100 }}
                                    transition={{ duration: 0.4, ease: "easeOut" }}
                                    className={`fixed top-15 left-0 right-0 z-50 bg-[#fcfcfc] py-6 px-10`}
                                >
                                    <div
                                        className={`${getSectionWidth(
                                            section.title
                                        )} flex flex-wrap items-center justify-center gap-2 mx-auto`}
                                    >
                                        {section.items.map(({ title, to, color, icon: Icon }) => (
                                            <div
                                                key={to}
                                                onClick={() => setOpenSection(null)}
                                                className="cursor-pointer"
                                            >
                                                <PillCard title={title} to={to} color={color} icon={Icon} />
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            </>
                        )}
                    </AnimatePresence>
                </div>
            ))}
        </div>
    );
}
