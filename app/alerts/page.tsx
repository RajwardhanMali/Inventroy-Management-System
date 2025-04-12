import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import MainLayout from "@/components/layout/main-layout"
import AlertsTable from "./alerts-table"

export default async function AlertsPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    return null
  }

  const alerts = await prisma.alert.findMany({
    include: {
      product: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  return (
    <MainLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Alerts</h1>
        <AlertsTable alerts={alerts} />
      </div>
    </MainLayout>
  )
}
