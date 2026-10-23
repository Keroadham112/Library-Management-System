export type Customer = {
  id: number
  name: string
  email: string
  phone: string
  address: string
  createdAt: string
  updatedAt: string
}

export type CustomerListResponse = {
  items: Customer[]
  page: number
  pageSize: number
  totalCount: number
  totalPages: number
}

export type CustomerFormValues = {
  name: string
  email: string
  phone: string
  address: string
}

export type CustomerUpsertPayload = {
  name: string
  email: string
  phone: string
  address: string
}
