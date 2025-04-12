import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Function to check if a product is low in stock
export function isLowStock(quantity: number, threshold = 10): boolean {
  return quantity < threshold
}

// Function to check if a product is near expiry
export function isNearExpiry(expiryDate: Date): boolean {
  const today = new Date()
  const sevenDaysFromNow = new Date()
  sevenDaysFromNow.setDate(today.getDate() + 7)

  return expiryDate <= sevenDaysFromNow && expiryDate >= today
}

// Function to check if a product is expired
export function isExpired(expiryDate: Date): boolean {
  const today = new Date()
  return expiryDate < today
}
