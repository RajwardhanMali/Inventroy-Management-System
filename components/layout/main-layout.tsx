import type { ReactNode } from "react"
import Sidebar from "@/components/layout/sidebar"
import Header from "@/components/layout/header"

interface MainLayoutProps {
  children: ReactNode
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50 dark:bg-gray-900">{children}</main>
      </div>
    </div>
  )
}
