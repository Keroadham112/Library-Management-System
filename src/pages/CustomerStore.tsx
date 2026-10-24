import { useEffect, useMemo, useState } from 'react'
import type { CSSProperties } from 'react'
import axios from 'axios'
import { useToast } from '../components/ui/ToastProvider'
import { getCustomers } from '../services/customerService'
import { getProducts } from '../services/productService'
import { createSale } from '../services/saleService'
import type { Customer } from '../types/customer'
import type { Product } from '../types/product'
import type { SaleUpsertPayload } from '../types/sale'
import { getStorefrontProductImage } from '../utils/storefront'

type CartItem = {
  product: Product
  quantity: number
}

const emptyCart: CartItem[] = []

const numberFormatter = new Intl.NumberFormat('en-EG', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const searchStyle: CSSProperties = {
  border: '1px solid var(--border)',
  borderRadius: '14px',
  background: 'var(--field-bg)',
  color: 'var(--text)',
  padding: '14px 16px',
  outline: 'none',
  width: 'min(100%, 420px)',
}

const selectStyle: CSSProperties = {
  border: '1px solid var(--border)',
  borderRadius: '14px',
  background: 'var(--field-bg)',
  color: 'var(--text)',
  padding: '14px 16px',
  outline: 'none',
  width: 'min(100%, 420px)',
}

const storeGridStyle: CSSProperties = {
  display: 'grid',
  gap: '24px',
  gridTemplateColumns: 'minmax(0, 1fr) minmax(320px, 420px)',
}

const productGridStyle: CSSProperties = {
  display: 'grid',
  gap: '16px',
  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
}

const productCardStyle: CSSProperties = {
  border: '1px solid var(--border)',
  borderRadius: '18px',
  background: 'var(--surface-strong)',
  boxShadow: '0 18px 50px rgba(2, 6, 23, 0.25)',
  display: 'grid',
  gap: '14px',
  padding: '18px',
}

const productImageStyle: CSSProperties = {
  aspectRatio: '4 / 3',
  borderRadius: '14px',
  objectFit: 'cover',
  width: '100%',
}

const cartImageStyle: CSSProperties = {
  borderRadius: '10px',
  height: '58px',
  objectFit: 'cover',
  width: '58px',
}

const cartItemHeaderStyle: CSSProperties = {
  alignItems: 'center',
  display: 'flex',
  gap: '12px',
}

const cartPanelStyle: CSSProperties = {
  alignSelf: 'start',
  border: '1px solid var(--border)',
  borderRadius: '24px',
  background: 'var(--surface-strong)',
  boxShadow: '0 18px 50px rgba(2, 6, 23, 0.25)',
  display: 'grid',
  gap: '16px',
  padding: '24px',
}

const mutedTextStyle: CSSProperties = {
  color: 'var(--text-muted)',
  margin: 0,
}

const cartRowStyle: CSSProperties = {
  borderBottom: '1px solid rgba(148, 163, 184, 0.16)',
  display: 'grid',
  gap: '10px',
  paddingBottom: '14px',
}

const rowActionsStyle: CSSProperties = {
  alignItems: 'center',
  display: 'flex',
  flexWrap: 'wrap',
  gap: '8px',
  justifyContent: 'space-between',
}

function formatPrice(value: number) {
  return `${numberFormatter.format(value)} EGP`
}

function getErrorMessage(error: unknown, fallback: string) {
  if (axios.isAxiosError(error)) {
    const responseData = error.response?.data as
      | { detail?: string; message?: string; title?: string }
      | string
      | undefined

    if (typeof responseData === 'string' && responseData.trim()) {
      return responseData
    }

    if (responseData && typeof responseData === 'object') {
      return responseData.detail ?? responseData.message ?? responseData.title ?? fallback
    }
  }

  return fallback
}

function CustomerStore() {
  const toast = useToast()
  const [products, setProducts] = useState<Product[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [cartItems, setCartItems] = useState<CartItem[]>(emptyCart)
  const [selectedCustomerId, setSelectedCustomerId] = useState('')
  const [search, setSearch] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const visibleProducts = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()

    if (!normalizedSearch) {
      return products
    }

    return products.filter((product) =>
      [product.name, product.sku, product.barcode, product.categoryName].some((value) =>
        value.toLowerCase().includes(normalizedSearch),
      ),
    )
  }, [products, search])

  const cartTotal = cartItems.reduce(
    (total, item) => total + item.product.sellingPrice * item.quantity,
    0,
  )

  async function loadStoreData() {
    try {
      setIsLoading(true)
      setError(null)
      const [productList, customerList] = await Promise.all([
        getProducts(1, 100),
        getCustomers(1, 100),
      ])

      setProducts(productList.items)
      setCustomers(customerList.items)
    } catch (error) {
      setError(getErrorMessage(error, 'Unable to load store data.'))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadStoreData()
  }, [])

  function getCartQuantity(productId: number) {
    return cartItems.find((item) => item.product.id === productId)?.quantity ?? 0
  }

  function addToCart(product: Product) {
    if (product.stockQuantity <= 0) {
      toast.error('Out of stock', `${product.name} is not available right now.`)
      return
    }

    setCartItems((current) => {
      const existingItem = current.find((item) => item.product.id === product.id)

      if (!existingItem) {
        return [...current, { product, quantity: 1 }]
      }

      if (existingItem.quantity >= product.stockQuantity) {
        toast.error('Stock limit reached', `Only ${product.stockQuantity} available.`)
        return current
      }

      return current.map((item) =>
        item.product.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item,
      )
    })
  }

  function decreaseCartItem(productId: number) {
    setCartItems((current) =>
      current
        .map((item) =>
          item.product.id === productId
            ? { ...item, quantity: item.quantity - 1 }
            : item,
        )
        .filter((item) => item.quantity > 0),
    )
  }

  function removeCartItem(productId: number) {
    setCartItems((current) => current.filter((item) => item.product.id !== productId))
  }

  async function handleCheckout() {
    if (!selectedCustomerId) {
      toast.error('Customer required', 'Select a customer before checkout.')
      return
    }

    if (cartItems.length === 0) {
      toast.error('Cart is empty', 'Add at least one product before checkout.')
      return
    }

    const payload: SaleUpsertPayload = {
      customerId: Number(selectedCustomerId),
      saleDate: new Date().toISOString(),
      items: cartItems.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
        unitPrice: item.product.sellingPrice,
      })),
    }

    try {
      setIsSubmitting(true)
      setError(null)
      await createSale(payload)
      setCartItems(emptyCart)
      toast.success('Sale created successfully.')
      await loadStoreData()
    } catch (error) {
      const message = getErrorMessage(error, 'Unable to checkout.')
      setError(message)
      toast.error('Checkout failed', message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="page customer-store-page">
      <div className="page-hero">
        <div>
          <p className="page-eyebrow">Store</p>
          <h2>Customer Store</h2>
          <p className="page-copy">
            Add products to a customer cart and create a sale in one fast flow.
          </p>
        </div>
        <div className="page-badge">{cartItems.length} in cart</div>
      </div>

      {error ? <div className="page-state page-state-error">{error}</div> : null}

      <div style={storeGridStyle}>
        <div className="page">
          <div style={rowActionsStyle}>
            <input
              aria-label="Search store products"
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search products..."
              style={searchStyle}
              type="search"
              value={search}
            />
            <button
              className="button button-secondary"
              disabled={isLoading}
              onClick={() => void loadStoreData()}
              type="button"
            >
              Refresh
            </button>
          </div>

          {isLoading ? (
            <div className="page-state">Loading store...</div>
          ) : visibleProducts.length === 0 ? (
            <div className="page-state">No products available.</div>
          ) : (
            <div style={productGridStyle}>
              {visibleProducts.map((product) => {
                const cartQuantity = getCartQuantity(product.id)
                const isUnavailable = product.stockQuantity <= 0
                const isAtStockLimit = cartQuantity >= product.stockQuantity

                return (
                  <article key={product.id} style={productCardStyle}>
                    <img
                      alt={product.name}
                      loading="lazy"
                      src={getStorefrontProductImage(product)}
                      style={productImageStyle}
                    />
                    <div>
                      <h3 style={{ margin: 0 }}>{product.name}</h3>
                      <p style={mutedTextStyle}>{product.categoryName}</p>
                    </div>
                    <p style={mutedTextStyle}>SKU: {product.sku}</p>
                    <strong>{formatPrice(product.sellingPrice)}</strong>
                    <p style={mutedTextStyle}>Available: {product.stockQuantity}</p>
                    <button
                      className="button button-primary"
                      disabled={isUnavailable || isAtStockLimit}
                      onClick={() => addToCart(product)}
                      type="button"
                    >
                      {isUnavailable ? 'Out of Stock' : 'Add to Cart'}
                    </button>
                  </article>
                )
              })}
            </div>
          )}
        </div>

        <aside style={cartPanelStyle}>
          <div>
            <h3 style={{ margin: 0 }}>Cart</h3>
            <p style={mutedTextStyle}>Choose a customer and complete the sale.</p>
          </div>

          <div className="field-group">
            <label htmlFor="store-customer">Customer</label>
            <select
              id="store-customer"
              onChange={(event) => setSelectedCustomerId(event.target.value)}
              style={selectStyle}
              value={selectedCustomerId}
            >
              <option value="">Select a customer</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name} - {customer.phone}
                </option>
              ))}
            </select>
          </div>

          {cartItems.length === 0 ? (
            <div className="page-state" style={{ margin: 0 }}>
              Cart is empty.
            </div>
          ) : (
            cartItems.map((item) => (
              <div key={item.product.id} style={cartRowStyle}>
                <div style={cartItemHeaderStyle}>
                  <img
                    alt={item.product.name}
                    loading="lazy"
                    src={getStorefrontProductImage(item.product)}
                    style={cartImageStyle}
                  />
                  <div>
                    <strong>{item.product.name}</strong>
                    <p style={mutedTextStyle}>{formatPrice(item.product.sellingPrice)}</p>
                  </div>
                </div>
                <div style={rowActionsStyle}>
                  <button
                    className="button button-secondary button-sm"
                    onClick={() => decreaseCartItem(item.product.id)}
                    type="button"
                  >
                    -
                  </button>
                  <strong>{item.quantity}</strong>
                  <button
                    className="button button-secondary button-sm"
                    disabled={item.quantity >= item.product.stockQuantity}
                    onClick={() => addToCart(item.product)}
                    type="button"
                  >
                    +
                  </button>
                  <button
                    className="button button-danger button-sm"
                    onClick={() => removeCartItem(item.product.id)}
                    type="button"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))
          )}

          <div style={rowActionsStyle}>
            <span>Total</span>
            <strong>{formatPrice(cartTotal)}</strong>
          </div>

          <button
            className="button button-primary"
            disabled={isSubmitting || cartItems.length === 0}
            onClick={() => void handleCheckout()}
            type="button"
          >
            {isSubmitting ? 'Creating Sale...' : 'Checkout'}
          </button>
        </aside>
      </div>
    </section>
  )
}

export default CustomerStore
