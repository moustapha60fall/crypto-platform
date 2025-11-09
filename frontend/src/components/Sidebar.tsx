import { useState, type JSX } from "react"
import { NavLink, useLocation } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { Separator } from "@/components/ui/separator"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import {
    Home, Users, Shield, Key, Hash, Lock, FileCheck,
    ChevronDown, ChevronRight, Menu,
} from "lucide-react"
import { cn } from "@/lib/utils"

type MenuItem = {
    label: string
    icon?: JSX.Element
    to?: string
    items?: MenuItem[]
}

const menuBySection: Record<string, MenuItem[]> = {
    admin: [
        {
            label: "Tableau de bord",
            items: [{ label: "Dashboard", icon: <Home size={18} />, to: "/admin/dashboard" }],
        },
        {
            label: "Utilisateurs",
            items: [
                { label: "Utilisateurs", icon: <Users size={18} />, to: "/admin/users" },
                { label: "Clés", icon: <Key size={18} />, to: "/admin/keys" },
                { label: "Opérations", icon: <Shield size={18} />, to: "/admin/operations" },
                { label: "Statistiques", icon: <FileCheck size={18} />, to: "/admin/stats" },
            ],
        },
    ],
    crypto: [
        {
            label: "Cryptographie",
            items: [
                {
                    label: "Confidentialité",
                    icon: <Lock size={18} />,
                    items: [
                        { label: "AES (Symétrique)", to: "/crypto/confidentiality/aes" },
                        { label: "RSA (Asymétrique)", to: "/crypto/confidentiality/pair" },
                        { label: "Key Wrapping", to: "/crypto/confidentiality/wrap" },
                    ],
                },
                {
                    label: "Intégrité",
                    icon: <Hash size={18} />,
                    items: [
                        { label: "Hachage", to: "/crypto/integrity/hash" },
                        { label: "HMAC", to: "/crypto/integrity/hmac" },
                    ],
                },
                {
                    label: "Authenticité",
                    icon: <FileCheck size={18} />,
                    items: [
                        { label: "Signer", to: "/crypto/authenticity/sign" },
                        { label: "Vérifier", to: "/crypto/authenticity/verify" },
                    ],
                },
                {
                    label: "Non-répudiation",
                    icon: <Shield size={18} />,
                    items: [{ label: "Journalisation", to: "/crypto/non-repudiation" }],
                },
            ],
        },
    ],
    user: [
        {
            label: "Espace Utilisateur",
            items: [
                { label: "Profil", icon: <Users size={18} />, to: "/user/status" },
                { label: "Mes Clés", icon: <Key size={18} />, to: "/user/keys" },
                { label: "Opérations", icon: <Shield size={18} />, to: "/user/operations" },
                { label: "Partages", icon: <FileCheck size={18} />, to: "/user/shares" },
            ],
        },
    ],
}

export default function Sidebar() {
    useLocation() // Gardé si tu veux détecter la route active
    const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({})
    const [compact, setCompact] = useState(false)

    // Menu complet sans section
    const menu: MenuItem[] = [
        ...menuBySection.admin,
        ...menuBySection.crypto,
        ...menuBySection.user,
    ]

    const toggleMenu = (label: string) =>
        setOpenMenus((prev) => ({ ...prev, [label]: !prev[label] }))

    const renderMenu = (items: MenuItem[], depth = 0): JSX.Element => (
        <ul className={cn("flex flex-col gap-1", depth > 0 && "ml-4 border-l pl-3")}>
            {items.map(({ label, icon, to, items: subItems }) => {
                const isOpen = openMenus[label] || false

                if (subItems) {
                    return (
                        <li key={label}>
                            <div
                                onClick={() => toggleMenu(label)}
                                className={cn(
                                    "flex items-center justify-between px-3 py-2 rounded-md cursor-pointer text-sm font-medium transition-colors",
                                    "hover:bg-accent text-muted-foreground"
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    {icon}
                                    {!compact && <span>{label}</span>}
                                </div>
                                {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                            </div>
                            <AnimatePresence initial={false}>
                                {isOpen && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.25, ease: "easeInOut" }}
                                        className="overflow-hidden"
                                    >
                                        {renderMenu(subItems, depth + 1)}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </li>
                    )
                }

                return (
                    <li key={label}>
                        <Tooltip delayDuration={300}>
                            <TooltipTrigger asChild>
                                <NavLink
                                    to={to ?? "#"}
                                    className={({ isActive }) =>
                                        cn(
                                            "flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-sm font-medium",
                                            isActive
                                                ? "bg-primary text-white"
                                                : "hover:bg-accent text-muted-foreground",
                                            compact && "justify-center"
                                        )
                                    }
                                >
                                    {icon}
                                    {!compact && <span>{label}</span>}
                                </NavLink>
                            </TooltipTrigger>
                            {compact && <TooltipContent side="right">{label}</TooltipContent>}
                        </Tooltip>
                    </li>
                )
            })}
        </ul>
    )

    return (
        <aside
            className={cn(
                "fixed z-[999] top-[7.125rem] left-3 w-[260px] h-[calc(100vh-8rem)]",
                "bg-[#fcfcfc] border-[3px] border-[#c7c7cc] rounded-[3px]",
                "shadow-[0_0_3px_1px_#c8c8cc] overflow-y-auto",
                "transition-[transform,left] duration-200",
                "select-none p-2 px-6",
                compact ? "w-20" : "w-64"
            )}
        >

            <div className="flex items-center justify-between">
                {!compact && <h1 className="text-xl font-bold text-primary">Administration</h1>}
                <button
                    onClick={() => setCompact((prev) => !prev)}
                    className="p-2 rounded-md hover:bg-accent"
                    aria-label="Toggle compact mode"
                >
                    <Menu size={20} />
                </button>
            </div>
            <Separator />
            <nav>{renderMenu(menu)}</nav>
        </aside>
    )
}
