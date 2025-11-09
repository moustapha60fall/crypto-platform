"use client"

import { NavLink } from "react-router-dom"

interface SidebarNavItem {
  title: string
  href: string
}

interface SidebarNavProps {
  items: SidebarNavItem[]
}

export function SidebarNav({ items }: SidebarNavProps) {
  return (
    <nav className="space-y-2">
      {items.map((item) => (
        <NavLink
          key={item.href}
          to={item.href}
          className={({ isActive }) =>
            `block px-4 py-2 rounded-md text-sm font-medium transition ${
              isActive
                ? "bg-primary text-white shadow"
                : "text-muted-foreground hover:bg-muted"
            }`
          }
        >
          {item.title}
        </NavLink>
      ))}
    </nav>
  )
}
