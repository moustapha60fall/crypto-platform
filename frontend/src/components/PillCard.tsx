import { Link } from "react-router-dom";
import { motion } from "framer-motion";

type PillCardProps = {
    title: string;
    to: string;
    color: string;
    icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    sectionTitle?: string; // 🔹 On ajoute cette prop pour savoir de quelle section vient la carte
};


import { useState } from "react";
import { getRandomDirection } from "@/data/data";

export default function PillCard({ title, to, color, icon: Icon, sectionTitle }: PillCardProps) {
    const { initial, animate } = getRandomDirection(sectionTitle);
    const [hovered, setHovered] = useState(false);

    return (
        <motion.div
            initial={initial}
            animate={animate}
            transition={{
                duration: 0.9,
                ease: "easeOut",
                delay: Math.random() * 0.1,
            }}
        >
            <Link
                to={to}
                aria-label={`Naviguer vers ${title}`}
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
                className={`
          flex items-center justify-center gap-2 px-4 py-2 rounded-full border
          w-full max-w-[350px] h-[50px]
          transition-all duration-500 ease-in-out
          relative overflow-hidden
        `}
                style={{
                    backgroundImage: hovered
                        ? `linear-gradient(to right, ${color} 0%, ${color} 25%)`
                        : `linear-gradient(to right, white 0%, white 25%)`,
                    backgroundSize: hovered ? "100% 100%" : "0% 100%",
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "left center",
                    color: hovered ? "#fff" : color,
                    transform: hovered ? "scale(1.05)" : "scale(1)",
                    borderLeft: `2px solid ${color}`,
                    borderBottom: `4px solid ${color}`,
                    borderRight: `2px solid ${color}`,
                    borderTop: `2.5px solid ${color}`,
                }}
            >
                {Icon && (
                    <span className="shrink-0">
                        <Icon className="w-5 h-5 text-gray-700 hover:text-white" />
                    </span>

                )}
                <span className="text-sm font-medium">{title}</span>
            </Link>
        </motion.div>
    );
}

