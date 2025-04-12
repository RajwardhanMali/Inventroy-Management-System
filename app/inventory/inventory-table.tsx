"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Edit, MoreHorizontal, Trash } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { cn } from "@/lib/utils"

interface Product {
  id: number
  name: string
  category: string
  unit: string
}

interface InventoryItem {
  id: number
  productId: number
  quantity: number
  expiryDate: Date
  addedOn: Date
  product: Product
}

interface InventoryTableProps {
  inventory: InventoryItem[]
}

export default function InventoryTable({ inventory }: InventoryTableProps) {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [filter, setFilter] = useState("all")
  const [deleteItemId, setDeleteItemId] = useState<number | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const today = new Date()
  const sevenDaysFromNow = new Date()
  sevenDaysFromNow.setDate(today.getDate() + 7)

  const filteredInventory = inventory.filter((item) => {
    // Search filter
    const matchesSearch =
      item.product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.product.category.toLowerCase().includes(searchTerm.toLowerCase())

    // Status filter
    const expiryDate = new Date(item.expiryDate)

    if (filter === "expired") {
      return matchesSearch && expiryDate < today
    } else if (filter === "near-expiry") {
      return matchesSearch && expiryDate >= today && expiryDate <= sevenDaysFromNow
    } else if (filter === "low-stock") {
      return matchesSearch && item.quantity < 10
    } else if (filter === "recent") {
      const addedDate = new Date(item.addedOn)
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(today.getDate() - 30)
      return matchesSearch && addedDate >= thirtyDaysAgo
    }

    return matchesSearch
  })

  const handleEdit = (id: number) => {
    router.push(`/inventory/${id}/edit`)
  }

  const handleDelete = async () => {
    if (!deleteItemId) return

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/inventory/${deleteItemId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        router.refresh()
      } else {
        console.error("Failed to delete inventory item")
      }
    } catch (error) {
      console.error("Error deleting inventory item:", error)
    } finally {
      setIsDeleting(false)
      setDeleteItemId(null)
    }
  }

  const getRowClassName = (item: InventoryItem) => {
    const expiryDate = new Date(item.expiryDate)

    if (expiryDate < today) {
      return "bg-red-50 dark:bg-red-900/20"
    } else if (expiryDate <= sevenDaysFromNow) {
      return "bg-yellow-50 dark:bg-yellow-900/20"
    } else if (item.quantity < 10) {
      return "bg-orange-50 dark:bg-orange-900/20"
    }

    return ""
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <Input
          placeholder="Search inventory..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Items</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
            <SelectItem value="near-expiry">Near Expiry</SelectItem>
            <SelectItem value="low-stock">Low Stock</SelectItem>
            <SelectItem value="recent">Recently Added</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Unit</TableHead>
              <TableHead>Expiry Date</TableHead>
              <TableHead>Added On</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredInventory.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-6">
                  No inventory items found
                </TableCell>
              </TableRow>
            ) : (
              filteredInventory.map((item) => (
                <TableRow key={item.id} className={getRowClassName(item)}>
                  <TableCell className="font-medium">{item.product.name}</TableCell>
                  <TableCell>{item.product.category}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>{item.product.unit}</TableCell>
                  <TableCell
                    className={cn(
                      new Date(item.expiryDate) < today
                        ? "text-red-600 dark:text-red-400"
                        : new Date(item.expiryDate) <= sevenDaysFromNow
                          ? "text-yellow-600 dark:text-yellow-400"
                          : "",
                    )}
                  >
                    {new Date(item.expiryDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{new Date(item.addedOn).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(item.id)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600" onClick={() => setDeleteItemId(item.id)}>
                          <Trash className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={deleteItemId !== null} onOpenChange={(open) => !open && setDeleteItemId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the inventory item.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-red-600 hover:bg-red-700">
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
