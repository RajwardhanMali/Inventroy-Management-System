import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import MainLayout from "@/components/layout/main-layout"
import LogsTable from "./logs-table"

export default async function LogsPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    return null
  }

  // Check if user is admin
  if (session.user.role !== "admin") {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
            <p className="text-gray-500">You do not have permission to view this page.</p>
          </div>
        </div>
      </MainLayout>
    )
  }

  const logs = await prisma.activityLog.findMany({
    include: {
      user: true,
      product: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      timestamp: "desc",
    },
  })

  const users = await prisma.user.findMany({
    select: {
      id: true,
      username: true,
    },
    orderBy: {
      username: "asc",
    },
  })

  return (
    <MainLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Activity Logs</h1>
        <LogsTable logs={logs} users={users} />
      </div>
    </MainLayout>
  )
}
