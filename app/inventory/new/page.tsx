import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import MainLayout from "@/components/layout/main-layout"
import InventoryForm from "../inventory-form"

export default async function NewInventoryPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    return null
  }

  const products = await prisma.product.findMany({
    orderBy: {
      name: "asc",
    },
  })

  return (
    <MainLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Add New Inventory</h1>
        <InventoryForm products={products} />
      </div>
    </MainLayout>
  )
}
