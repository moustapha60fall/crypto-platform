"use client"

import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { User, LogOut, LucideSettings, ShieldCheck } from "lucide-react"
import { useKeycloak } from "@react-keycloak/web"
import { useUserRole } from "@/hooks/useUserRole"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { userService } from "@/services/userService"

export function AccountMenu() {
    const { keycloak } = useKeycloak()
    const username = keycloak.tokenParsed?.preferred_username ?? "?"
    const picture = keycloak.tokenParsed?.picture
    const role = useUserRole()

    const handleLogout = async () => {
        try {
            // 🔐 Appel backend (optionnel)
            await userService.logout();

            // 🚪 Déconnexion côté Keycloak + redirection vers la page d'accueil
            keycloak.logout({ redirectUri: window.location.origin });
        } catch (err) {
            console.error("Erreur lors de la déconnexion :", err);
        }
    };

    const roleColors = {
        admin: "border-[#002C3E] text-[#002C3E] hover:bg-[#002C3E] hover:text-white",
        user: "border-emerald-400 text-emerald-400 hover:bg-emerald-500 hover:text-white",
        guest: "border-gray-400 text-gray-400 hover:bg-gray-500 hover:text-white",
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button
                    className={`flex items-center justify-end gap-2 px-1 py-0.25 rounded-full border text-sm font-medium transition-all ${roleColors[role] || roleColors.guest} shadow-sm backdrop-blur-md`}
                >
                    <span className="pl-2">{role}</span>
                    <Avatar className="p-0.5 pr-0">
                        <AvatarImage src={picture} />
                        <AvatarFallback className="bg-[#002C3E] border border-gray-100 text-white">
                            {username[0]?.toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                </button>

            </DropdownMenuTrigger>

            <DropdownMenuContent asChild align="end" className="w-56 mt-2.25 shadow-[0_0_3px_1px]">
                <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.18, ease: "easeOut" }}
                    className="bg-[#fcfcfc] border border-[#c7c7cc] dark:border-gray-700 rounded-[3px]"
                >
                    <span
                        className="absolute right-3 top-0.75 w-2.5 h-2.5 rotate-45 bg-[#fcfcfc] 
            border-l border-t border-gray-900 dark:border-gray-900"
                    />

                    {/* Groupe profil */}

                    <DropdownMenuGroup>
                        <DropdownMenuItem asChild className="p-0 m-0 bg-transparent focus:bg-green-100">
                            <Link to="/user"
                                className="flex items-center focus:border-l-3 focus:border-b-1 border-[#27ccc3] gap-2 px-3 py-2 hover:bg-[#e7fbf9] text-[#009688] rounded-md transition">
                                <User className="h-4 w-4" /> Profil
                            </Link>
                        </DropdownMenuItem>

                        <DropdownMenuItem asChild className="p-0 m-0 bg-transparent focus:bg-green-100">
                            <Link to="/account" className="flex items-center focus:border-l-3 focus:border-b-1 border-[#27ccc3] gap-2 px-3 py-2 hover:bg-[#e7fbf9] text-[#009688] rounded-md transition">
                                <LucideSettings className="h-4 w-4" /> Paramètres
                            </Link>
                        </DropdownMenuItem>

                        {role === "admin" && (
                            <DropdownMenuItem asChild className="p-0 m-0 bg-transparent focus:bg-green-100">
                                <Link to="/admin" className="flex items-center focus:border-l-3 focus:border-b-1 border-[#27ccc3] gap-2 px-3 py-2 hover:bg-[#fdecec] text-[#009688] rounded-md transition">
                                    <ShieldCheck className="h-4 w-4" /> Espace admin
                                </Link>
                            </DropdownMenuItem>
                        )}
                    </DropdownMenuGroup>

                    <DropdownMenuSeparator className="my-1 bg-gray-300 dark:bg-gray-700" />

                    {/* Déconnexion */}
                    <DropdownMenuGroup>
                        <DropdownMenuItem
                            onClick={handleLogout}
                            asChild
                            className="p-0 m-0 bg-transparent focus:bg-red-200"
                        >
                            <Link
                                to="/"
                                className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                            >
                                <LogOut className="h-4 w-4 text-red-500" />
                                Déconnexion
                            </Link>
                        </DropdownMenuItem>
                    </DropdownMenuGroup>
                </motion.div>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
