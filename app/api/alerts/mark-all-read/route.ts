import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function PUT() {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Mark all alerts as read
    await prisma.alert.updateMany({
      where: {
        isRead: false,
      },
      data: {
        isRead: true,
      },
    })

    return NextResponse.json({ message: "All alerts marked as read successfully" })
  } catch (error) {
    console.error("Error marking all alerts as read:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
