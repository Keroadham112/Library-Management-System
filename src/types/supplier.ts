export type Supplier = {
  id: number
  name: string
  company: string
  email: string
  phone: string
  address: string
  createdAt: string
  updatedAt: string
}

export type SupplierListResponse = {
  items: Supplier[]
  page: number
  pageSize: number
  totalCount: number
  totalPages: number
}

export type SupplierFormValues = {
  name: string
  company: string
  email: string
  phone: string
  address: string
}

export type SupplierUpsertPayload = {
  name: string
  company: string
  email: string
  phone: string
  address: string
}
