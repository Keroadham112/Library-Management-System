import { api } from './api'
import type { Customer, CustomerListResponse, CustomerUpsertPayload } from '../types/customer'

export async function getCustomers(page?: number, pageSize?: number, search?: string) {
  const response = await api.get<CustomerListResponse>('/customers', {
    params: {
      page,
      pageSize,
      search,
    },
  })

  return response.data
}

export async function getCustomer(id: number) {
  const response = await api.get<Customer>(`/customers/${id}`)
  return response.data
}

export async function createCustomer(payload: CustomerUpsertPayload) {
  const response = await api.post<Customer>('/customers', payload)
  return response.data
}

export async function updateCustomer(id: number, payload: CustomerUpsertPayload) {
  const response = await api.put<Customer>(`/customers/${id}`, payload)
  return response.data
}

export async function deleteCustomer(id: number) {
  await api.delete(`/customers/${id}`)
}
