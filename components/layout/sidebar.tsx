"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import { LayoutDashboard, Package, Boxes, Bell, ClipboardList, User } from "lucide-react"
import { cn } from "@/lib/utils"

export default function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()

  const isAdmin = session?.user?.role === "admin"

  const routes = [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      href: "/dashboard",
      active: pathname === "/dashboard",
    },
    {
      label: "Products",
      icon: Package,
      href: "/products",
      active: pathname === "/products",
    },
    {
      label: "Inventory",
      icon: Boxes,
      href: "/inventory",
      active: pathname === "/inventory",
    },
    {
      label: "Alerts",
      icon: Bell,
      href: "/alerts",
      active: pathname === "/alerts",
    },
    {
      label: "Logs",
      icon: ClipboardList,
      href: "/logs",
      active: pathname === "/logs",
      adminOnly: true,
    },
    {
      label: "Profile",
      icon: User,
      href: "/profile",
      active: pathname === "/profile",
    },
  ]

  return (
    <div className="hidden md:flex h-full w-64 flex-col bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
      <div className="flex h-14 items-center border-b px-4">
        <h1 className="text-lg font-semibold">Canteen Inventory</h1>
      </div>
      <div className="flex-1 overflow-auto py-2">
        <nav className="grid items-start px-2 gap-1">
          {routes.map((route) => {
            if (route.adminOnly && !isAdmin) return null

            return (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium",
                  route.active
                    ? "bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-gray-50"
                    : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50 hover:bg-gray-100 dark:hover:bg-gray-700",
                )}
              >
                <route.icon className="h-4 w-4" />
                {route.label}
              </Link>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
