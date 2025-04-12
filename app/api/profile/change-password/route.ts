import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { compare, hash } from "bcrypt"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { currentPassword, newPassword } = await req.json()

    // Validate input
    if (!currentPassword || !newPassword) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: {
        id: Number.parseInt(session.user.id),
      },
    })

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    // Verify current password
    const isPasswordValid = await compare(currentPassword, user.password)

    if (!isPasswordValid) {
      return NextResponse.json({ message: "Current password is incorrect" }, { status: 400 })
    }

    // Hash new password
    const hashedPassword = await hash(newPassword, 10)

    // Update password
    await prisma.user.update({
      where: {
        id: Number.parseInt(session.user.id),
      },
      data: {
        password: hashedPassword,
      },
    })

    return NextResponse.json({ message: "Password changed successfully" })
  } catch (error) {
    console.error("Error changing password:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
