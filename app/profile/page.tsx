import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import MainLayout from "@/components/layout/main-layout"
import ProfileForm from "./profile-form"

export default async function ProfilePage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    return null
  }

  const user = await prisma.user.findUnique({
    where: {
      id: Number.parseInt(session.user.id),
    },
    select: {
      id: true,
      username: true,
      role: true,
      createdAt: true,
    },
  })

  if (!user) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">User Not Found</h1>
            <p className="text-gray-500">The user profile could not be found.</p>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Profile</h1>
        <ProfileForm user={user} />
      </div>
    </MainLayout>
  )
}
