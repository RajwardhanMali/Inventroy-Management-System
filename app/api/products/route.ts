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

    const products = await prisma.product.findMany({
      orderBy: {
        name: "asc",
      },
    })

    return NextResponse.json(products)
  } catch (error) {
    console.error("Error fetching products:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { name, category, unit } = await req.json()

    // Validate input
    if (!name || !category || !unit) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }

    // Create product
    const product = await prisma.product.create({
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
        action: `added product ${name}`,
        productId: product.id,
      },
    })

    return NextResponse.json({ message: "Product created successfully", productId: product.id }, { status: 201 })
  } catch (error) {
    console.error("Error creating product:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
