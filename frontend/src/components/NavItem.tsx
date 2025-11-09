"use client";

import { Link } from "react-router-dom";
import { motion } from "framer-motion";

type NavItemProps = {
    to: string;
    label: string;
    active?: boolean;
    icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
};

export function NavItem({ to, label, active = false, icon: Icon }: NavItemProps) {
    return (
        <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
        >
            <Link
                to={to}
                className="flex items-center px-3 py-2 rounded-md text-sm font-medium transition-all"
            >
                {Icon && <Icon className="h-4 w-4 text-white" />}
                <span className={`nav-underline ${active ? "nav-underline-active" : ""}`}>
                    {label}
                </span>
            </Link>
        </motion.div>
    );
}
