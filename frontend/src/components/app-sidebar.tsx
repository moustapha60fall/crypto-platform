// src/components/app-sidebar.tsx
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
} from "@/components/ui/sidebar"
import {
    Home,
    Users,
    Key,
    Activity,
    BarChart3,
    Shield,
    Lock,
    Info,
    Hash,
    KeyRound,
    Cpu,
    KeyIcon,
} from "lucide-react"
import { Link, useLocation } from "react-router-dom"

type SidebarItem = {
    title: string
    icon: React.ElementType
    to: string
}

type SidebarSectionProps = {
    label: string
    items: SidebarItem[]
    currentPath: string
}

function SidebarSection({ label, items, currentPath }: SidebarSectionProps) {
    return (
        <SidebarGroup>
            <SidebarGroupLabel>{label}</SidebarGroupLabel>
            <SidebarGroupContent>
                <SidebarMenu>
                    {items.map((item) => (
                        <SidebarMenuItem key={item.to}>
                            <SidebarMenuButton
                                asChild
                                isActive={currentPath.startsWith(item.to)}
                            >
                                <Link to={item.to}>
                                    <item.icon className="shrink-0" />
                                    <span>{item.title}</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    ))}
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    )
}

export function AppSidebar() {
    const location = useLocation()
    const path = location.pathname

    const adminMenu = [
        { title: "Dashboard", icon: Home, to: "/admin" },
        { title: "Utilisateurs", icon: Users, to: "/admin/users" },
        { title: "Clés", icon: Key, to: "/admin/keys" },
        { title: "Opérations", icon: Activity, to: "/admin/operations" },
        { title: "Statistiques", icon: BarChart3, to: "/admin/stats" },
    ]

    const cryptoMenu = [
        { title: "Confidentialité", icon: Lock, to: "/crypto/confidentiality" },
        { title: "Authenticité", icon: Shield, to: "/crypto/authenticity" },
        { title: "Intégrité", icon: Hash, to: "/crypto/integrity" },
        { title: "Non-Répudiation", icon: KeyRound, to: "/crypto/integrity" },
        { title: "Algorithmes", icon: Cpu, to: "/crypto/algorithmes" },
        { title: "Gestion des clés", icon: KeyIcon, to: "/crypto/keys" },

    ]

    const aboutMenu = [
        { title: "À propos", icon: Info, to: "/a-propos" },
    ]

    return (
        <Sidebar collapsible="icon" variant="sidebar" className="h-[91.1%] border-[1px] border-[#c7c7cc] shadow-[0_0_3px_1px_#c8c8cc] bg-[#fcfcfc] rounded-[1px] mt-15.5 ml-0.5">
            <SidebarContent>
                <SidebarSection label="Administration" items={adminMenu} currentPath={path} />
                <SidebarSection label="Crypto" items={cryptoMenu} currentPath={path} />
                <SidebarSection label="Autres" items={aboutMenu} currentPath={path} />
            </SidebarContent>
        </Sidebar>
    )
}
