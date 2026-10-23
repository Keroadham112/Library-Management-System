import { api } from './api'
import type { Supplier, SupplierListResponse, SupplierUpsertPayload } from '../types/supplier'

export async function getSuppliers(page?: number, pageSize?: number, search?: string) {
  const response = await api.get<SupplierListResponse>('/suppliers', {
    params: {
      page,
      pageSize,
      search,
    },
  })

  return response.data
}

export async function getSupplier(id: number) {
  const response = await api.get<Supplier>(`/suppliers/${id}`)
  return response.data
}

export async function createSupplier(payload: SupplierUpsertPayload) {
  const response = await api.post<Supplier>('/suppliers', payload)
  return response.data
}

export async function updateSupplier(id: number, payload: SupplierUpsertPayload) {
  const response = await api.put<Supplier>(`/suppliers/${id}`, payload)
  return response.data
}

export async function deleteSupplier(id: number) {
  await api.delete(`/suppliers/${id}`)
}
