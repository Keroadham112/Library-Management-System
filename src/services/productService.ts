import { api } from './api'
import type { Product, ProductListResponse, ProductUpsertPayload } from '../types/product'

export async function getProducts(page?: number, pageSize?: number, search?: string) {
  const response = await api.get<ProductListResponse>('/products', {
    params: {
      page,
      pageSize,
      search,
    },
  })

  return response.data
}

export async function getProduct(id: number) {
  const response = await api.get<Product>(`/products/${id}`)
  return response.data
}

export async function createProduct(payload: ProductUpsertPayload) {
  const response = await api.post<Product>('/products', payload)
  return response.data
}

export async function updateProduct(id: number, payload: ProductUpsertPayload) {
  const response = await api.put<Product>(`/products/${id}`, payload)
  return response.data
}

export async function deleteProduct(id: number) {
  await api.delete(`/products/${id}`)
}
