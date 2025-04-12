import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

async function createTestUser(username: string, password: string) {
  try {
    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: {
        username: username,
        password: hashedPassword,  // make sure this matches your schema field name
        role: "admin",
      },
    })

    console.log("Test user created successfully:", user.username)
    await prisma.$disconnect()
  } catch (error) {
    console.error("Error creating test user:", error)
    await prisma.$disconnect()
    process.exit(1)
  }
}

// Self-executing function to run the code
createTestUser("admin", "admin123")
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })