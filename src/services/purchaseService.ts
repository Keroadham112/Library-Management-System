import { api } from './api'
import type { Purchase, PurchaseListResponse, PurchaseUpsertPayload } from '../types/purchase'

export async function getPurchases(page?: number, pageSize?: number, search?: string) {
  const response = await api.get<PurchaseListResponse>('/purchases', {
    params: {
      page,
      pageSize,
      search,
    },
  })

  return response.data
}

export async function getPurchase(id: number) {
  const response = await api.get<Purchase>(`/purchases/${id}`)
  return response.data
}

export async function createPurchase(payload: PurchaseUpsertPayload) {
  const response = await api.post<Purchase>('/purchases', payload)
  return response.data
}

export async function updatePurchase(id: number, payload: PurchaseUpsertPayload) {
  const response = await api.put<Purchase>(`/purchases/${id}`, payload)
  return response.data
}

export async function deletePurchase(id: number) {
  await api.delete(`/purchases/${id}`)
}
