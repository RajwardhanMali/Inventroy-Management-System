import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import MainLayout from "@/components/layout/main-layout"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import ProductsTable from "./products-table"

export default async function ProductsPage() {
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
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Products</h1>
          <Button asChild>
            <a href="/products/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </a>
          </Button>
        </div>

        <ProductsTable products={products} />
      </div>
    </MainLayout>
  )
}
