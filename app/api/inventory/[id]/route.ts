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

    const inventoryId = Number.parseInt(params.id)

    if (isNaN(inventoryId)) {
      return NextResponse.json({ message: "Invalid inventory ID" }, { status: 400 })
    }

    const inventoryItem = await prisma.inventory.findUnique({
      where: {
        id: inventoryId,
      },
      include: {
        product: true,
      },
    })

    if (!inventoryItem) {
      return NextResponse.json({ message: "Inventory item not found" }, { status: 404 })
    }

    return NextResponse.json(inventoryItem)
  } catch (error) {
    console.error("Error fetching inventory item:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const inventoryId = Number.parseInt(params.id)

    if (isNaN(inventoryId)) {
      return NextResponse.json({ message: "Invalid inventory ID" }, { status: 400 })
    }

    const { productId, quantity, expiryDate } = await req.json()

    // Validate input
    if (!productId || !quantity || !expiryDate) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }

    // Check if inventory item exists
    const existingItem = await prisma.inventory.findUnique({
      where: {
        id: inventoryId,
      },
    })

    if (!existingItem) {
      return NextResponse.json({ message: "Inventory item not found" }, { status: 404 })
    }

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: {
        id: productId,
      },
    })

    if (!product) {
      return NextResponse.json({ message: "Product not found" }, { status: 404 })
    }

    // Update inventory item
    const inventoryItem = await prisma.inventory.update({
      where: {
        id: inventoryId,
      },
      data: {
        productId,
        quantity,
        expiryDate: new Date(expiryDate),
      },
    })

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: Number.parseInt(session.user.id),
        action: `updated inventory for ${product.name}`,
        productId,
      },
    })

    // Check for low stock and create alert if needed
    const totalQuantity = await prisma.inventory.aggregate({
      where: {
        productId,
      },
      _sum: {
        quantity: true,
      },
    })

    if ((totalQuantity._sum.quantity || 0) < 10) {
      await prisma.alert.create({
        data: {
          productId,
          alertType: "low_stock",
          message: `Low stock alert: ${product.name} has less than 10 ${product.unit} in inventory.`,
        },
      })
    }

    // Check for near expiry and create alert if needed
    const expiryDateObj = new Date(expiryDate)
    const sevenDaysFromNow = new Date()
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7)

    if (expiryDateObj <= sevenDaysFromNow) {
      await prisma.alert.create({
        data: {
          productId,
          alertType: "near_expiry",
          message: `Near expiry alert: ${product.name} will expire on ${expiryDateObj.toLocaleDateString()}.`,
        },
      })
    }

    return NextResponse.json({ message: "Inventory updated successfully", inventoryId: inventoryItem.id })
  } catch (error) {
    console.error("Error updating inventory:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const inventoryId = Number.parseInt(params.id)

    if (isNaN(inventoryId)) {
      return NextResponse.json({ message: "Invalid inventory ID" }, { status: 400 })
    }

    // Check if inventory item exists
    const existingItem = await prisma.inventory.findUnique({
      where: {
        id: inventoryId,
      },
      include: {
        product: true,
      },
    })

    if (!existingItem) {
      return NextResponse.json({ message: "Inventory item not found" }, { status: 404 })
    }

    // Delete inventory item
    await prisma.inventory.delete({
      where: {
        id: inventoryId,
      },
    })

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: Number.parseInt(session.user.id),
        action: `deleted inventory item for ${existingItem.product.name}`,
        productId: existingItem.productId,
      },
    })

    return NextResponse.json({ message: "Inventory item deleted successfully" })
  } catch (error) {
    console.error("Error deleting inventory item:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
