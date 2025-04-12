import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

async function createTestUser() {
  const hashedPassword = await bcrypt.hash("admin123", 10)

  await prisma.user.create({
    data: {
      username: "admin",
      passwordHash: hashedPassword,
      role: "admin",
    },
  })

  console.log("Test user created!")
}
