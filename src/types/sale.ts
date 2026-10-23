export type SaleItem = {
  id: number
  productId: number
  productName: string
  quantity: number
  unitPrice: number
  totalPrice: number
}

export type Sale = {
  id: number
  customerId: number
  customerName: string
  saleDate: string
  totalAmount: number
  items: SaleItem[]
  createdAt: string
  updatedAt: string
}

export type SaleListResponse = {
  items: Sale[]
  page: number
  pageSize: number
  totalCount: number
  totalPages: number
}

export type SaleFormItemValues = {
  productId: string
  quantity: string
  unitPrice: string
}

export type SaleFormValues = {
  customerId: string
  saleDate: string
  items: SaleFormItemValues[]
}

export type SaleUpsertItemPayload = {
  productId: number
  quantity: number
  unitPrice: number
}

export type SaleUpsertPayload = {
  customerId: number
  saleDate: string
  items: SaleUpsertItemPayload[]
}