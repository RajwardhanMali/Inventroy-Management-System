#!/usr/bin/env node
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function createTestUser(username: string, password: string) {
  try {
    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: {
        username: username,
        password: hashedPassword,
        role: "admin",
      },
    })

    console.log("Test user created successfully:", user.username)
  } catch (error) {
    console.error("Error creating test user:", error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the script
createTestUser("admin", "admin123")
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })