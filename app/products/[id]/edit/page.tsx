import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { notFound } from "next/navigation"
import MainLayout from "@/components/layout/main-layout"
import ProductForm from "../../product-form"

interface EditProductPageProps {
  params: {
    id: string
  }
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return null
  }

  const productId = Number.parseInt(params.id)

  if (isNaN(productId)) {
    notFound()
  }

  const product = await prisma.product.findUnique({
    where: {
      id: productId,
    },
  })

  if (!product) {
    notFound()
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Edit Product</h1>
        <ProductForm product={product} />
      </div>
    </MainLayout>
  )
}
