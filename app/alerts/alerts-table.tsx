"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertCircle, AlertTriangle, Check } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface Product {
  id: number
  name: string
  category: string
  unit: string
}

interface Alert {
  id: number
  productId: number
  alertType: "low_stock" | "near_expiry"
  message: string
  isRead: boolean
  createdAt: Date
  product: Product
}

interface AlertsTableProps {
  alerts: Alert[]
}

export default function AlertsTable({ alerts }: AlertsTableProps) {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [filter, setFilter] = useState("all")

  const filteredAlerts = alerts.filter((alert) => {
    // Search filter
    const matchesSearch =
      alert.product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.message.toLowerCase().includes(searchTerm.toLowerCase())

    // Status filter
    if (filter === "unread") {
      return matchesSearch && !alert.isRead
    } else if (filter === "low-stock") {
      return matchesSearch && alert.alertType === "low_stock"
    } else if (filter === "near-expiry") {
      return matchesSearch && alert.alertType === "near_expiry"
    }

    return matchesSearch
  })

  const markAsRead = async (id: number) => {
    try {
      const response = await fetch(`/api/alerts/${id}/mark-read`, {
        method: "PUT",
      })

      if (response.ok) {
        router.refresh()
      } else {
        console.error("Failed to mark alert as read")
      }
    } catch (error) {
      console.error("Error marking alert as read:", error)
    }
  }

  const markAllAsRead = async () => {
    try {
      const response = await fetch("/api/alerts/mark-all-read", {
        method: "PUT",
      })

      if (response.ok) {
        router.refresh()
      } else {
        console.error("Failed to mark all alerts as read")
      }
    } catch (error) {
      console.error("Error marking all alerts as read:", error)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <Input
            placeholder="Search alerts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter alerts" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Alerts</SelectItem>
              <SelectItem value="unread">Unread</SelectItem>
              <SelectItem value="low-stock">Low Stock</SelectItem>
              <SelectItem value="near-expiry">Near Expiry</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {alerts.some((alert) => !alert.isRead) && (
          <Button onClick={markAllAsRead}>
            <Check className="mr-2 h-4 w-4" />
            Mark All as Read
          </Button>
        )}
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Message</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[100px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAlerts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-6">
                  No alerts found
                </TableCell>
              </TableRow>
            ) : (
              filteredAlerts.map((alert) => (
                <TableRow key={alert.id} className={!alert.isRead ? "bg-gray-50 dark:bg-gray-800/50" : ""}>
                  <TableCell>
                    {alert.alertType === "low_stock" ? (
                      <div className="flex items-center">
                        <AlertCircle className="mr-2 h-4 w-4 text-red-500" />
                        <span>Low Stock</span>
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <AlertTriangle className="mr-2 h-4 w-4 text-yellow-500" />
                        <span>Near Expiry</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{alert.product.name}</TableCell>
                  <TableCell>{alert.message}</TableCell>
                  <TableCell>{new Date(alert.createdAt).toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge variant={alert.isRead ? "outline" : "default"}>{alert.isRead ? "Read" : "Unread"}</Badge>
                  </TableCell>
                  <TableCell>
                    {!alert.isRead && (
                      <Button variant="ghost" size="sm" onClick={() => markAsRead(alert.id)}>
                        <Check className="mr-2 h-4 w-4" />
                        Mark as Read
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
