import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import MainLayout from "@/components/layout/main-layout"
import ProductForm from "../product-form"

export default async function NewProductPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    return null
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Add New Product</h1>
        <ProductForm />
      </div>
    </MainLayout>
  )
}
