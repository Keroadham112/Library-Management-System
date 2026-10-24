export type Product = {
  id: number
  name: string
  description?: string | null
  imageUrl?: string | null
  categoryId: number
  categoryName: string
  stockQuantity: number
  costPrice: number
  sellingPrice: number
  barcode: string
  sku: string
  lowStockThreshold: number
  createdAt: string
  updatedAt: string
}

export type ProductListResponse = {
  items: Product[]
  page: number
  pageSize: number
  totalCount: number
  totalPages: number
}

export type ProductFormValues = {
  name: string
  categoryId: string
  stockQuantity: string
  costPrice: string
  sellingPrice: string
  barcode: string
  sku: string
  lowStockThreshold: string
}

export type ProductUpsertPayload = {
  name: string
  categoryId: number
  stockQuantity: number
  costPrice: number
  sellingPrice: number
  barcode: string
  sku: string
  lowStockThreshold: number
}