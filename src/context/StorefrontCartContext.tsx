import { createContext, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react'
import type { Product } from '../types/product'

export type StorefrontCartItem = {
  product: Product
  quantity: number
}

type StorefrontCartContextValue = {
  items: StorefrontCartItem[]
  itemCount: number
  subtotal: number
  addItem: (product: Product) => void
  decreaseItem: (productId: number) => void
  removeItem: (productId: number) => void
  clearCart: () => void
  getQuantity: (productId: number) => number
}

const cartStorageKey = 'inventory-storefront-cart'
const StorefrontCartContext = createContext<StorefrontCartContextValue | null>(null)

function readStoredCart() {
  const rawCart = window.localStorage.getItem(cartStorageKey)

  if (!rawCart) {
    return [] as StorefrontCartItem[]
  }

  try {
    return JSON.parse(rawCart) as StorefrontCartItem[]
  } catch {
    return [] as StorefrontCartItem[]
  }
}

export function StorefrontCartProvider({ children }: PropsWithChildren) {
  const [items, setItems] = useState<StorefrontCartItem[]>(readStoredCart)

  useEffect(() => {
    window.localStorage.setItem(cartStorageKey, JSON.stringify(items))
  }, [items])

  function addItem(product: Product) {
    setItems((current) => {
      const existing = current.find((item) => item.product.id === product.id)

      if (!existing) {
        return [...current, { product, quantity: 1 }]
      }

      if (existing.quantity >= product.stockQuantity) {
        return current
      }

      return current.map((item) =>
        item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item,
      )
    })
  }

  function decreaseItem(productId: number) {
    setItems((current) =>
      current
        .map((item) =>
          item.product.id === productId ? { ...item, quantity: item.quantity - 1 } : item,
        )
        .filter((item) => item.quantity > 0),
    )
  }

  function removeItem(productId: number) {
    setItems((current) => current.filter((item) => item.product.id !== productId))
  }

  const value = useMemo<StorefrontCartContextValue>(
    () => ({
      items,
      itemCount: items.reduce((total, item) => total + item.quantity, 0),
      subtotal: items.reduce(
        (total, item) => total + item.product.sellingPrice * item.quantity,
        0,
      ),
      addItem,
      decreaseItem,
      removeItem,
      clearCart: () => setItems([]),
      getQuantity: (productId) =>
        items.find((item) => item.product.id === productId)?.quantity ?? 0,
    }),
    [items],
  )

  return <StorefrontCartContext.Provider value={value}>{children}</StorefrontCartContext.Provider>
}

export function useStorefrontCart() {
  const context = useContext(StorefrontCartContext)

  if (!context) {
    throw new Error('useStorefrontCart must be used within StorefrontCartProvider.')
  }

  return context
}