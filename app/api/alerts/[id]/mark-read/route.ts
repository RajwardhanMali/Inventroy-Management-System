import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const alertId = Number.parseInt(params.id)

    if (isNaN(alertId)) {
      return NextResponse.json({ message: "Invalid alert ID" }, { status: 400 })
    }

    // Check if alert exists
    const existingAlert = await prisma.alert.findUnique({
      where: {
        id: alertId,
      },
    })

    if (!existingAlert) {
      return NextResponse.json({ message: "Alert not found" }, { status: 404 })
    }

    // Mark alert as read
    const alert = await prisma.alert.update({
      where: {
        id: alertId,
      },
      data: {
        isRead: true,
      },
    })

    return NextResponse.json({ message: "Alert marked as read successfully" })
  } catch (error) {
    console.error("Error marking alert as read:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
