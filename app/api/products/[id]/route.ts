import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const productId = Number.parseInt(params.id)

    if (isNaN(productId)) {
      return NextResponse.json({ message: "Invalid product ID" }, { status: 400 })
    }

    const product = await prisma.product.findUnique({
      where: {
        id: productId,
      },
    })

    if (!product) {
      return NextResponse.json({ message: "Product not found" }, { status: 404 })
    }

    return NextResponse.json(product)
  } catch (error) {
    console.error("Error fetching product:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const productId = Number.parseInt(params.id)

    if (isNaN(productId)) {
      return NextResponse.json({ message: "Invalid product ID" }, { status: 400 })
    }

    const { name, category, unit } = await req.json()

    // Validate input
    if (!name || !category || !unit) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: {
        id: productId,
      },
    })

    if (!existingProduct) {
      return NextResponse.json({ message: "Product not found" }, { status: 404 })
    }

    // Update product
    const product = await prisma.product.update({
      where: {
        id: productId,
      },
      data: {
        name,
        category,
        unit,
      },
    })

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: Number.parseInt(session.user.id),
        action: `updated product ${name}`,
        productId: product.id,
      },
    })

    return NextResponse.json({ message: "Product updated successfully", productId: product.id })
  } catch (error) {
    console.error("Error updating product:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const productId = Number.parseInt(params.id)

    if (isNaN(productId)) {
      return NextResponse.json({ message: "Invalid product ID" }, { status: 400 })
    }

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: {
        id: productId,
      },
    })

    if (!existingProduct) {
      return NextResponse.json({ message: "Product not found" }, { status: 404 })
    }

    // Delete related inventory items
    await prisma.inventory.deleteMany({
      where: {
        productId,
      },
    })

    // Delete related alerts
    await prisma.alert.deleteMany({
      where: {
        productId,
      },
    })

    // Delete related activity logs
    await prisma.activityLog.deleteMany({
      where: {
        productId,
      },
    })

    // Delete product
    await prisma.product.delete({
      where: {
        id: productId,
      },
    })

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: Number.parseInt(session.user.id),
        action: `deleted product ${existingProduct.name}`,
        productId: 0, // Use 0 as a placeholder since the product is deleted
      },
    })

    return NextResponse.json({ message: "Product deleted successfully" })
  } catch (error) {
    console.error("Error deleting product:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
