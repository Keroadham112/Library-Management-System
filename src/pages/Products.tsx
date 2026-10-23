import { useEffect, useState } from 'react'
import type { CSSProperties } from 'react'
import axios from 'axios'
import ProductForm from '../components/ProductForm'
import ProductTable from '../components/ProductTable'
import { useConfirmDialog } from '../components/ui/ConfirmDialogProvider'
import { useToast } from '../components/ui/ToastProvider'
import { getCategories } from '../services/categoryService'
import {
  createProduct,
  deleteProduct,
  getProducts,
  updateProduct,
} from '../services/productService'
import type { Category } from '../types/category'
import type { Product, ProductFormValues, ProductListResponse, ProductUpsertPayload } from '../types/product'

const emptyProductFormValues: ProductFormValues = {
  name: '',
  categoryId: '',
  stockQuantity: '',
  costPrice: '',
  sellingPrice: '',
  barcode: '',
  sku: '',
  lowStockThreshold: '',
}

const emptyProductListResponse: ProductListResponse = {
  items: [],
  page: 1,
  pageSize: 10,
  totalCount: 0,
  totalPages: 1,
}

const searchStyle: CSSProperties = {
  border: '1px solid var(--border)',
  borderRadius: '14px',
  background: 'var(--field-bg)',
  color: 'var(--text)',
  padding: '14px 16px',
  outline: 'none',
  width: 'min(100%, 420px)',
}

const controlsStyle: CSSProperties = {
  alignItems: 'center',
  display: 'flex',
  flexWrap: 'wrap',
  gap: '12px',
  justifyContent: 'space-between',
}

const paginationStyle: CSSProperties = {
  alignItems: 'center',
  display: 'flex',
  flexWrap: 'wrap',
  gap: '12px',
  justifyContent: 'flex-end',
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

function toProductFormValues(product: Product): ProductFormValues {
  return {
    name: product.name,
    categoryId: String(product.categoryId),
    stockQuantity: String(product.stockQuantity),
    costPrice: String(product.costPrice),
    sellingPrice: String(product.sellingPrice),
    barcode: product.barcode,
    sku: product.sku,
    lowStockThreshold: String(product.lowStockThreshold),
  }
}

function toProductUpsertPayload(values: ProductFormValues): ProductUpsertPayload {
  return {
    name: values.name.trim(),
    categoryId: Number(values.categoryId),
    stockQuantity: Number(values.stockQuantity),
    costPrice: Number(values.costPrice),
    sellingPrice: Number(values.sellingPrice),
    barcode: values.barcode.trim(),
    sku: values.sku.trim(),
    lowStockThreshold: Number(values.lowStockThreshold),
  }
}

function Products() {
  const { confirm } = useConfirmDialog()
  const toast = useToast()
  const [categories, setCategories] = useState<Category[]>([])
  const [productList, setProductList] = useState<ProductListResponse>(emptyProductListResponse)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize] = useState(10)

  async function loadProducts(nextPage = page, nextSearch = search) {
    try {
      setIsLoading(true)
      setError(null)
      const products = await getProducts(nextPage, pageSize, nextSearch.trim() || undefined)
      setProductList(products)
    } catch (error) {
      setError(getErrorMessage(error, 'Unable to load products.'))
    } finally {
      setIsLoading(false)
    }
  }

  async function loadCategories() {
    try {
      const categoryList = await getCategories()
      setCategories(categoryList)
    } catch (error) {
      setError(getErrorMessage(error, 'Unable to load categories.'))
    }
  }

  useEffect(() => {
    void loadCategories()
    void loadProducts(1, '')
  }, [])

  async function handleSubmit(values: ProductFormValues) {
    try {
      setIsSaving(true)
      setError(null)
      const payload = toProductUpsertPayload(values)

      if (selectedProduct) {
        await updateProduct(selectedProduct.id, payload)
        setSelectedProduct(null)
        toast.success('Product updated successfully.')
      } else {
        await createProduct(payload)
        toast.success('Product created successfully.')
      }

      await loadProducts(page, search)
    } catch (error) {
      const message = getErrorMessage(error, 'Unable to save product.')
      setError(message)
      toast.error('Save failed', message)
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDelete(product: Product) {
    const isConfirmed = await confirm({
      title: 'Delete product?',
      description: `Delete product "${product.name}"? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      tone: 'danger',
    })

    if (!isConfirmed) {
      return
    }

    try {
      setError(null)
      await deleteProduct(product.id)

      if (selectedProduct?.id === product.id) {
        setSelectedProduct(null)
      }

      const nextPage =
        productList.items.length === 1 && page > 1 ? page - 1 : page
      setPage(nextPage)
      await loadProducts(nextPage, search)
      toast.success('Product deleted successfully.')
    } catch (error) {
      const message = getErrorMessage(error, 'Unable to delete product.')
      setError(message)
      toast.error('Delete failed', message)
    }
  }

  function handleEdit(product: Product) {
    setSelectedProduct(product)
    setError(null)
  }

  function handleCancelEdit() {
    setSelectedProduct(null)
  }

  function handleSearchChange(event: React.ChangeEvent<HTMLInputElement>) {
    setSearch(event.target.value)
  }

  async function handleSearchSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPage(1)
    setSelectedProduct(null)
    await loadProducts(1, search)
  }

  async function handlePageChange(nextPage: number) {
    setPage(nextPage)
    await loadProducts(nextPage, search)
  }

  return (
    <section className="page products-page">
      <div className="page-hero">
        <div>
          <p className="page-eyebrow">Inventory</p>
          <h2>Products</h2>
          <p className="page-copy">
            Create, update, search, and monitor catalog items from one workspace.
          </p>
        </div>
        <div className="page-badge">{productList.totalCount} total</div>
      </div>

      {error ? <div className="page-state page-state-error">{error}</div> : null}

      <div className="categories-grid">
        <ProductForm
          categories={categories}
          initialValues={
            selectedProduct ? toProductFormValues(selectedProduct) : emptyProductFormValues
          }
          isSubmitting={isSaving}
          onCancel={handleCancelEdit}
          onSubmit={handleSubmit}
        />

        <div style={controlsStyle}>
          <form onSubmit={handleSearchSubmit} style={controlsStyle}>
            <input
              aria-label="Search products"
              onChange={handleSearchChange}
              placeholder="Search products..."
              style={searchStyle}
              type="search"
              value={search}
            />
            <button className="button button-secondary" disabled={isLoading} type="submit">
              Search
            </button>
          </form>

          <div className="page-state" style={{ margin: 0 }}>
            Page {productList.page} of {productList.totalPages}
          </div>
        </div>

        <ProductTable
          isLoading={isLoading}
          onDelete={handleDelete}
          onEdit={handleEdit}
          products={productList.items}
        />

        <div style={paginationStyle}>
          <button
            className="button button-secondary"
            disabled={isLoading || productList.page <= 1}
            onClick={() => void handlePageChange(productList.page - 1)}
            type="button"
          >
            Previous
          </button>
          <span className="page-state" style={{ margin: 0 }}>
            {productList.totalCount} products
          </span>
          <button
            className="button button-secondary"
            disabled={isLoading || productList.page >= productList.totalPages}
            onClick={() => void handlePageChange(productList.page + 1)}
            type="button"
          >
            Next
          </button>
        </div>
      </div>
    </section>
  )
}

export default Products
