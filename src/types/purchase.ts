export type Purchase = {
  id: number
  supplierId: number
  supplierName: string
  productId: number
  productName: string
  quantity: number
  unitCost: number
  totalCost: number
  purchaseDate: string
  createdAt: string
  updatedAt: string
}

export type PurchaseListResponse = {
  items: Purchase[]
  page: number
  pageSize: number
  totalCount: number
  totalPages: number
}

export type PurchaseFormValues = {
  supplierId: string
  productId: string
  quantity: string
  unitCost: string
  purchaseDate: string
}

export type PurchaseUpsertPayload = {
  supplierId: number
  productId: number
  quantity: number
  unitCost: number
  purchaseDate: string
}
