import { useEffect, useState } from 'react'
import type { CSSProperties } from 'react'
import axios from 'axios'
import SaleForm from '../components/SaleForm'
import SaleTable from '../components/SaleTable'
import { useConfirmDialog } from '../components/ui/ConfirmDialogProvider'
import { useToast } from '../components/ui/ToastProvider'
import { getCustomers } from '../services/customerService'
import { getProducts } from '../services/productService'
import { createSale, deleteSale, getSales, updateSale } from '../services/saleService'
import type { Customer } from '../types/customer'
import type { Product } from '../types/product'
import type {
  Sale,
  SaleFormValues,
  SaleListResponse,
  SaleUpsertPayload,
} from '../types/sale'

function getTodayInputValue() {
  return new Date().toISOString().slice(0, 10)
}

const emptySaleFormValues: SaleFormValues = {
  customerId: '',
  saleDate: getTodayInputValue(),
  items: [
    {
      productId: '',
      quantity: '',
      unitPrice: '',
    },
  ],
}

const emptySaleListResponse: SaleListResponse = {
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

function toSaleFormValues(sale: Sale): SaleFormValues {
  return {
    customerId: String(sale.customerId),
    saleDate: sale.saleDate.slice(0, 10),
    items:
      sale.items.length > 0
        ? sale.items.map((item) => ({
            productId: String(item.productId),
            quantity: String(item.quantity),
            unitPrice: String(item.unitPrice),
          }))
        : [
            {
              productId: '',
              quantity: '',
              unitPrice: '',
            },
          ],
  }
}

function toSaleUpsertPayload(values: SaleFormValues): SaleUpsertPayload {
  return {
    customerId: Number(values.customerId),
    saleDate: values.saleDate,
    items: values.items.map((item) => ({
      productId: Number(item.productId),
      quantity: Number(item.quantity),
      unitPrice: Number(item.unitPrice),
    })),
  }
}

function getStockBufferByProductId(sale: Sale | null) {
  const stockBufferByProductId: Record<number, number> = {}

  if (!sale) {
    return stockBufferByProductId
  }

  for (const item of sale.items) {
    stockBufferByProductId[item.productId] =
      (stockBufferByProductId[item.productId] ?? 0) + item.quantity
  }

  return stockBufferByProductId
}

function Sales() {
  const { confirm } = useConfirmDialog()
  const toast = useToast()
  const [products, setProducts] = useState<Product[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [saleList, setSaleList] = useState<SaleListResponse>(emptySaleListResponse)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize] = useState(10)

  async function loadSales(nextPage = page, nextSearch = search) {
    try {
      setIsLoading(true)
      setError(null)
      const sales = await getSales(nextPage, pageSize, nextSearch.trim() || undefined)
      setSaleList(sales)
    } catch (error) {
      setError(getErrorMessage(error, 'Unable to load sales.'))
    } finally {
      setIsLoading(false)
    }
  }

  async function loadFormOptions() {
    try {
      const [productList, customerList] = await Promise.all([
        getProducts(1, 100),
        getCustomers(1, 100),
      ])

      setProducts(productList.items)
      setCustomers(customerList.items)
    } catch (error) {
      setError(getErrorMessage(error, 'Unable to load sale form options.'))
    }
  }

  useEffect(() => {
    void loadFormOptions()
    void loadSales(1, '')
  }, [])

  async function handleSubmit(values: SaleFormValues) {
    try {
      setIsSaving(true)
      setError(null)
      const payload = toSaleUpsertPayload(values)

      if (selectedSale) {
        await updateSale(selectedSale.id, payload)
        setSelectedSale(null)
        toast.success('Sale updated successfully.')
      } else {
        await createSale(payload)
        toast.success('Sale created successfully.')
      }

      await loadSales(page, search)
      await loadFormOptions()
    } catch (error) {
      const message = getErrorMessage(error, 'Unable to save sale.')
      setError(message)
      toast.error('Save failed', message)
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDelete(sale: Sale) {
    const isConfirmed = await confirm({
      title: 'Delete sale?',
      description: `Delete sale for "${sale.customerName}"? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      tone: 'danger',
    })

    if (!isConfirmed) {
      return
    }

    try {
      setError(null)
      await deleteSale(sale.id)

      if (selectedSale?.id === sale.id) {
        setSelectedSale(null)
      }

      const nextPage = saleList.items.length === 1 && page > 1 ? page - 1 : page
      setPage(nextPage)
      await loadSales(nextPage, search)
      await loadFormOptions()
      toast.success('Sale deleted successfully.')
    } catch (error) {
      const message = getErrorMessage(error, 'Unable to delete sale.')
      setError(message)
      toast.error('Delete failed', message)
    }
  }

  function handleEdit(sale: Sale) {
    setSelectedSale(sale)
    setError(null)
  }

  function handleCancelEdit() {
    setSelectedSale(null)
  }

  function handleSearchChange(event: React.ChangeEvent<HTMLInputElement>) {
    setSearch(event.target.value)
  }

  async function handleSearchSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPage(1)
    setSelectedSale(null)
    await loadSales(1, search)
  }

  async function handlePageChange(nextPage: number) {
    setPage(nextPage)
    await loadSales(nextPage, search)
  }

  return (
    <section className="page sales-page">
      <div className="page-hero">
        <div>
          <p className="page-eyebrow">Selling</p>
          <h2>Sales</h2>
          <p className="page-copy">
            Record customer sales, deduct stock automatically, and track invoice totals.
          </p>
        </div>
        <div className="page-badge">{saleList.totalCount} total</div>
      </div>

      {error ? <div className="page-state page-state-error">{error}</div> : null}

      <div className="categories-grid">
        <SaleForm
          customers={customers}
          initialValues={selectedSale ? toSaleFormValues(selectedSale) : emptySaleFormValues}
          isSubmitting={isSaving}
          onCancel={handleCancelEdit}
          onSubmit={handleSubmit}
          products={products}
          stockBufferByProductId={getStockBufferByProductId(selectedSale)}
        />

        <div style={controlsStyle}>
          <form onSubmit={handleSearchSubmit} style={controlsStyle}>
            <input
              aria-label="Search sales"
              onChange={handleSearchChange}
              placeholder="Search sales..."
              style={searchStyle}
              type="search"
              value={search}
            />
            <button className="button button-secondary" disabled={isLoading} type="submit">
              Search
            </button>
          </form>

          <div className="page-state" style={{ margin: 0 }}>
            Page {saleList.page} of {saleList.totalPages}
          </div>
        </div>

        <SaleTable isLoading={isLoading} onDelete={handleDelete} onEdit={handleEdit} sales={saleList.items} />

        <div style={paginationStyle}>
          <button
            className="button button-secondary"
            disabled={isLoading || saleList.page <= 1}
            onClick={() => void handlePageChange(saleList.page - 1)}
            type="button"
          >
            Previous
          </button>
          <span className="page-state" style={{ margin: 0 }}>
            {saleList.totalCount} sales
          </span>
          <button
            className="button button-secondary"
            disabled={isLoading || saleList.page >= saleList.totalPages}
            onClick={() => void handlePageChange(saleList.page + 1)}
            type="button"
          >
            Next
          </button>
        </div>
      </div>
    </section>
  )
}

export default Sales
