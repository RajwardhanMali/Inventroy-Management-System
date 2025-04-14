import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const inventory = await prisma.inventory.findMany({
      include: {
        product: true,
      },
      orderBy: {
        addedOn: "desc",
      },
    })

    return NextResponse.json(inventory)
  } catch (error) {
    console.error("Error fetching inventory:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { productId, quantity, expiryDate } = await req.json()

    // Validate input
    if (!productId || !quantity || !expiryDate) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
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

    // Use transaction to ensure all operations succeed or fail together
    const inventoryItem = await prisma.$transaction(async (tx) => {
      // Create inventory item
      const item = await tx.inventory.create({
        data: {
          productId,
          quantity,
          expiryDate: new Date(expiryDate),
        },
      })

      // Log activity
      await tx.activityLog.create({
        data: {
          userId: Number.parseInt(session.user.id),
          action: `added ${quantity} of ${product.unit} to inventory`,
          productId,
        },
      })

      // Check for low stock and create alert if needed
      const totalQuantity = await tx.inventory.aggregate({
        where: {
          productId,
        },
        _sum: {
          quantity: true,
        },
      })

      if ((totalQuantity._sum.quantity || 0) < 10) {
        await tx.alert.create({
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
        await tx.alert.create({
          data: {
            productId,
            alertType: "near_expiry",
            message: `Near expiry alert: ${product.name} will expire on ${expiryDateObj.toLocaleDateString()}.`,
          },
        })
      }

      return item
    })

    return NextResponse.json(
      { message: "Inventory added successfully", inventoryId: inventoryItem.id },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error creating inventory:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
