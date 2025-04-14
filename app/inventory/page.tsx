import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import MainLayout from "@/components/layout/main-layout"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import InventoryTable from "./inventory-table"

export default async function InventoryPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    return null
  }

  const inventory = await prisma.inventory.findMany({
    include: {
      product: true,
    },
    orderBy: {
      addedOn: "desc",
    },
  })

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Inventory</h1>
          <Button asChild>
            <a href="/inventory/new">
              <Plus className="mr-2 h-4 w-4" />
              Add To Inventory
            </a>
          </Button>
        </div>

        <InventoryTable inventory={inventory} />
      </div>
    </MainLayout>
  )
}
