import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { notFound } from "next/navigation"
import MainLayout from "@/components/layout/main-layout"
import InventoryForm from "../../inventory-form"

interface EditInventoryPageProps {
  params: {
    id: string
  }
}

export default async function EditInventoryPage({ params }: EditInventoryPageProps) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return null
  }

  const inventoryId = Number.parseInt(params.id)

  if (isNaN(inventoryId)) {
    notFound()
  }

  const inventory = await prisma.inventory.findUnique({
    where: {
      id: inventoryId,
    },
  })

  if (!inventory) {
    notFound()
  }

  const products = await prisma.product.findMany({
    orderBy: {
      name: "asc",
    },
  })

  return (
    <MainLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Edit Inventory</h1>
        <InventoryForm inventory={inventory} products={products} />
      </div>
    </MainLayout>
  )
}
