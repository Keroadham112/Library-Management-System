import { useEffect, useState } from 'react'
import type { CSSProperties } from 'react'
import axios from 'axios'
import PurchaseForm from '../components/PurchaseForm'
import PurchaseTable from '../components/PurchaseTable'
import { useConfirmDialog } from '../components/ui/ConfirmDialogProvider'
import { useToast } from '../components/ui/ToastProvider'
import { getProducts } from '../services/productService'
import {
  createPurchase,
  deletePurchase,
  getPurchases,
  updatePurchase,
} from '../services/purchaseService'
import { getSuppliers } from '../services/supplierService'
import type { Product } from '../types/product'
import type {
  Purchase,
  PurchaseFormValues,
  PurchaseListResponse,
  PurchaseUpsertPayload,
} from '../types/purchase'
import type { Supplier } from '../types/supplier'

function getTodayInputValue() {
  return new Date().toISOString().slice(0, 10)
}

const emptyPurchaseFormValues: PurchaseFormValues = {
  supplierId: '',
  productId: '',
  quantity: '',
  unitCost: '',
  purchaseDate: getTodayInputValue(),
}

const emptyPurchaseListResponse: PurchaseListResponse = {
  items: [],
  page: 1,
  pageSize: 10,
  totalCount: 0,
  totalPages: 0,
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

function toPurchaseFormValues(purchase: Purchase): PurchaseFormValues {
  return {
    supplierId: String(purchase.supplierId),
    productId: String(purchase.productId),
    quantity: String(purchase.quantity),
    unitCost: String(purchase.unitCost),
    purchaseDate: purchase.purchaseDate.slice(0, 10),
  }
}

function toPurchaseUpsertPayload(values: PurchaseFormValues): PurchaseUpsertPayload {
  return {
    supplierId: Number(values.supplierId),
    productId: Number(values.productId),
    quantity: Number(values.quantity),
    unitCost: Number(values.unitCost),
    purchaseDate: values.purchaseDate,
  }
}

function Purchases() {
  const { confirm } = useConfirmDialog()
  const toast = useToast()
  const [products, setProducts] = useState<Product[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [purchaseList, setPurchaseList] =
    useState<PurchaseListResponse>(emptyPurchaseListResponse)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize] = useState(10)

  async function loadPurchases(nextPage = page, nextSearch = search) {
    try {
      setIsLoading(true)
      setError(null)
      const purchases = await getPurchases(
        nextPage,
        pageSize,
        nextSearch.trim() || undefined,
      )
      setPurchaseList(purchases)
    } catch (error) {
      setError(getErrorMessage(error, 'Unable to load purchases.'))
    } finally {
      setIsLoading(false)
    }
  }

  async function loadFormOptions() {
    try {
      const [productList, supplierList] = await Promise.all([
        getProducts(1, 100),
        getSuppliers(1, 100),
      ])

      setProducts(productList.items)
      setSuppliers(supplierList.items)
    } catch (error) {
      setError(getErrorMessage(error, 'Unable to load purchase form options.'))
    }
  }

  useEffect(() => {
    void loadFormOptions()
    void loadPurchases(1, '')
  }, [])

  async function handleSubmit(values: PurchaseFormValues) {
    try {
      setIsSaving(true)
      setError(null)
      const payload = toPurchaseUpsertPayload(values)

      if (selectedPurchase) {
        await updatePurchase(selectedPurchase.id, payload)
        setSelectedPurchase(null)
        toast.success('Purchase updated successfully.')
      } else {
        await createPurchase(payload)
        toast.success('Purchase created successfully.')
      }

      await loadPurchases(page, search)
      await loadFormOptions()
    } catch (error) {
      const message = getErrorMessage(error, 'Unable to save purchase.')
      setError(message)
      toast.error('Save failed', message)
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDelete(purchase: Purchase) {
    const isConfirmed = await confirm({
      title: 'Delete purchase?',
      description: `Delete purchase for "${purchase.productName}"? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      tone: 'danger',
    })

    if (!isConfirmed) {
      return
    }

    try {
      setError(null)
      await deletePurchase(purchase.id)

      if (selectedPurchase?.id === purchase.id) {
        setSelectedPurchase(null)
      }

      const nextPage = purchaseList.items.length === 1 && page > 1 ? page - 1 : page
      setPage(nextPage)
      await loadPurchases(nextPage, search)
      await loadFormOptions()
      toast.success('Purchase deleted successfully.')
    } catch (error) {
      const message = getErrorMessage(error, 'Unable to delete purchase.')
      setError(message)
      toast.error('Delete failed', message)
    }
  }

  function handleEdit(purchase: Purchase) {
    setSelectedPurchase(purchase)
    setError(null)
  }

  function handleCancelEdit() {
    setSelectedPurchase(null)
  }

  function handleSearchChange(event: React.ChangeEvent<HTMLInputElement>) {
    setSearch(event.target.value)
  }

  async function handleSearchSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPage(1)
    setSelectedPurchase(null)
    await loadPurchases(1, search)
  }

  async function handlePageChange(nextPage: number) {
    setPage(nextPage)
    await loadPurchases(nextPage, search)
  }

  return (
    <section className="page purchases-page">
      <div className="page-hero">
        <div>
          <p className="page-eyebrow">Purchasing</p>
          <h2>Purchases</h2>
          <p className="page-copy">
            Record supplier purchases and keep product stock levels up to date.
          </p>
        </div>
        <div className="page-badge">{purchaseList.totalCount} total</div>
      </div>

      {error ? <div className="page-state page-state-error">{error}</div> : null}

      <div className="categories-grid">
        <PurchaseForm
          initialValues={
            selectedPurchase
              ? toPurchaseFormValues(selectedPurchase)
              : emptyPurchaseFormValues
          }
          isSubmitting={isSaving}
          onCancel={handleCancelEdit}
          onSubmit={handleSubmit}
          products={products}
          suppliers={suppliers}
        />

        <div style={controlsStyle}>
          <form onSubmit={handleSearchSubmit} style={controlsStyle}>
            <input
              aria-label="Search purchases"
              onChange={handleSearchChange}
              placeholder="Search purchases..."
              style={searchStyle}
              type="search"
              value={search}
            />
            <button className="button button-secondary" disabled={isLoading} type="submit">
              Search
            </button>
          </form>

          <div className="page-state" style={{ margin: 0 }}>
            Page {purchaseList.page} of {purchaseList.totalPages}
          </div>
        </div>

        <PurchaseTable
          isLoading={isLoading}
          onDelete={handleDelete}
          onEdit={handleEdit}
          purchases={purchaseList.items}
        />

        <div style={paginationStyle}>
          <button
            className="button button-secondary"
            disabled={isLoading || purchaseList.page <= 1}
            onClick={() => void handlePageChange(purchaseList.page - 1)}
            type="button"
          >
            Previous
          </button>
          <span className="page-state" style={{ margin: 0 }}>
            {purchaseList.totalCount} purchases
          </span>
          <button
            className="button button-secondary"
            disabled={isLoading || purchaseList.page >= purchaseList.totalPages}
            onClick={() => void handlePageChange(purchaseList.page + 1)}
            type="button"
          >
            Next
          </button>
        </div>
      </div>
    </section>
  )
}

export default Purchases
