import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import MainLayout from "@/components/layout/main-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Package, ShoppingCart, AlertTriangle } from "lucide-react"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    console.log("User not authenticated")
    redirect("/login")
  }
  console.log("authenticated")
  // Get dashboard stats
  const totalProducts = await prisma.product.count()
  const totalInventoryItems = await prisma.inventory.count()

  // Get low stock alerts
  const lowStockAlerts = await prisma.alert.count({
    where: {
      alertType: "low_stock",
      isRead: false,
    },
  })

  // Get near expiry alerts
  const nearExpiryAlerts = await prisma.alert.count({
    where: {
      alertType: "near_expiry",
      isRead: false,
    },
  })

  // Get recent activity logs
  const recentLogs = await prisma.activityLog.findMany({
    take: 5,
    orderBy: {
      timestamp: "desc",
    },
    include: {
      user: true,
      product: true,
    },
  })

  return (
    <MainLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Products</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalProducts}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inventory Items</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalInventoryItems}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Low Stock Alerts</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{lowStockAlerts}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Near Expiry Alerts</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{nearExpiryAlerts}</div>
            </CardContent>
          </Card>
        </div>

        {(lowStockAlerts > 0 || nearExpiryAlerts > 0) && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Attention Required</AlertTitle>
            <AlertDescription>
              {lowStockAlerts > 0 && `${lowStockAlerts} products are low in stock. `}
              {nearExpiryAlerts > 0 && `${nearExpiryAlerts} products are near expiry.`}
            </AlertDescription>
          </Alert>
        )}

        <div>
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          <div className="rounded-md border">
            <div className="p-4">
              {recentLogs.length > 0 ? (
                <div className="divide-y">
                  {recentLogs.map((log) => (
                    <div key={log.id} className="py-3">
                      <p className="text-sm">
                        <span className="font-medium">{log.user.username}</span> {log.action} for product{" "}
                        <span className="font-medium">{log.product.name}</span>
                      </p>
                      <p className="text-xs text-gray-500 mt-1">{new Date(log.timestamp).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No recent activity</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
