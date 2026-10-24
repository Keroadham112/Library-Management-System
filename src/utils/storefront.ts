import { apiOrigin } from '../services/api'
import type { Product } from '../types/product'

const localFallbackImage = '/images/products/fallback-product.jpg'

export function getStorefrontProductImage(product: Product) {
  if (product.imageUrl?.startsWith('/')) {
    return `${apiOrigin}${product.imageUrl}`
  }

  return `${apiOrigin}${localFallbackImage}`
}

export function formatStorefrontPrice(value: number) {
  return new Intl.NumberFormat('en-EG', {
    style: 'currency',
    currency: 'EGP',
    maximumFractionDigits: 2,
  }).format(value)
}