import { NextResponse } from "next/server"
import { hash } from "bcrypt"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function POST(req: Request) {
  try {
    // Check if user is authenticated and is an admin
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { username, password, role } = await req.json()

    // Validate input
    if (!username || !password || !role) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }

    // Check if username already exists
    const existingUser = await prisma.user.findUnique({
      where: {
        username,
      },
    })

    if (existingUser) {
      return NextResponse.json({ message: "Username already exists" }, { status: 400 })
    }

    // Hash password
    const hashedPassword = await hash(password, 10)

    // Create user
    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        role: role === "admin" ? "admin" : "staff",
      },
    })

    return NextResponse.json({ message: "User created successfully", userId: user.id }, { status: 201 })
  } catch (error) {
    console.error("Error creating user:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
