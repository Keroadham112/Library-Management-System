import { api } from './api'
import type { Sale, SaleListResponse, SaleUpsertPayload } from '../types/sale'

export async function getSales(page?: number, pageSize?: number, search?: string) {
  const response = await api.get<SaleListResponse>('/sales', {
    params: {
      page,
      pageSize,
      search,
    },
  })

  return response.data
}

export async function getSale(id: number) {
  const response = await api.get<Sale>(`/sales/${id}`)
  return response.data
}

export async function createSale(payload: SaleUpsertPayload) {
  const response = await api.post<Sale>('/sales', payload)
  return response.data
}

export async function updateSale(id: number, payload: SaleUpsertPayload) {
  const response = await api.put<Sale>(`/sales/${id}`, payload)
  return response.data
}

export async function deleteSale(id: number) {
  await api.delete(`/sales/${id}`)
}