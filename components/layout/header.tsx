"use client"

import { useSession, signOut } from "next-auth/react"
import { Menu, X } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import MobileSidebar from "./mobile-sidebar"

export default function Header() {
  const { data: session } = useSession()
  const [showMobileMenu, setShowMobileMenu] = useState(false)

  const toggleMobileMenu = () => {
    setShowMobileMenu(!showMobileMenu)
  }

  return (
    <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-white dark:bg-gray-800 px-4 sm:px-6">
      <Button variant="ghost" size="icon" className="md:hidden" onClick={toggleMobileMenu}>
        {showMobileMenu ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>

      {showMobileMenu && <MobileSidebar onClose={toggleMobileMenu} />}

      <div className="ml-auto flex items-center gap-2">
        {session?.user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>{session.user.name?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <a href="/profile">Profile</a>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => signOut()}>Log out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  )
}
