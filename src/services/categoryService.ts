import { api } from './api'
import type { Category, CategoryFormValues } from '../types/category'

export async function getCategories() {
  const response = await api.get<Category[]>('/categories')
  return response.data
}

export async function createCategory(payload: CategoryFormValues) {
  const response = await api.post<Category>('/categories', payload)
  return response.data
}

export async function updateCategory(id: number, payload: CategoryFormValues) {
await api.put(`/categories/${id}`, payload)

}

export async function deleteCategory(id: number) {
await api.delete(`/categories/${id}`)
}