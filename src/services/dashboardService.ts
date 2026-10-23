import { api } from './api'

export type DashboardStats = {
  totalProducts: number
  totalCategories: number
  totalInventoryQuantity: number
  totalCustomers: number
  totalInventoryCostValue: number
  totalInventorySellingValue: number
  lowStockCount: number
}

export async function getDashboardSummary() {
  const response = await api.get<DashboardStats>('/dashboard')
  return response.data
}