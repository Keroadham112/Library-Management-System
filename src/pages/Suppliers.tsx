import { useEffect, useState } from 'react'
import type { CSSProperties } from 'react'
import axios from 'axios'
import SupplierForm from '../components/SupplierForm'
import SupplierTable from '../components/SupplierTable'
import { useConfirmDialog } from '../components/ui/ConfirmDialogProvider'
import { useToast } from '../components/ui/ToastProvider'
import {
  createSupplier,
  deleteSupplier,
  getSuppliers,
  updateSupplier,
} from '../services/supplierService'
import type {
  Supplier,
  SupplierFormValues,
  SupplierListResponse,
  SupplierUpsertPayload,
} from '../types/supplier'

const emptySupplierFormValues: SupplierFormValues = {
  name: '',
  company: '',
  email: '',
  phone: '',
  address: '',
}

const emptySupplierListResponse: SupplierListResponse = {
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

function toSupplierFormValues(supplier: Supplier): SupplierFormValues {
  return {
    name: supplier.name,
    company: supplier.company,
    email: supplier.email,
    phone: supplier.phone,
    address: supplier.address,
  }
}

function toSupplierUpsertPayload(values: SupplierFormValues): SupplierUpsertPayload {
  return {
    name: values.name.trim(),
    company: values.company.trim(),
    email: values.email.trim(),
    phone: values.phone.trim(),
    address: values.address.trim(),
  }
}

function Suppliers() {
  const { confirm } = useConfirmDialog()
  const toast = useToast()
  const [supplierList, setSupplierList] =
    useState<SupplierListResponse>(emptySupplierListResponse)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize] = useState(10)

  async function loadSuppliers(nextPage = page, nextSearch = search) {
    try {
      setIsLoading(true)
      setError(null)
      const suppliers = await getSuppliers(
        nextPage,
        pageSize,
        nextSearch.trim() || undefined,
      )
      setSupplierList(suppliers)
    } catch (error) {
      setError(getErrorMessage(error, 'Unable to load suppliers.'))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadSuppliers(1, '')
  }, [])

  async function handleSubmit(values: SupplierFormValues) {
    try {
      setIsSaving(true)
      setError(null)
      const payload = toSupplierUpsertPayload(values)

      if (selectedSupplier) {
        await updateSupplier(selectedSupplier.id, payload)
        setSelectedSupplier(null)
        toast.success('Supplier updated successfully.')
      } else {
        await createSupplier(payload)
        toast.success('Supplier created successfully.')
      }

      await loadSuppliers(page, search)
    } catch (error) {
      const message = getErrorMessage(error, 'Unable to save supplier.')
      setError(message)
      toast.error('Save failed', message)
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDelete(supplier: Supplier) {
    const isConfirmed = await confirm({
      title: 'Delete supplier?',
      description: `Delete supplier "${supplier.name}"? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      tone: 'danger',
    })

    if (!isConfirmed) {
      return
    }

    try {
      setError(null)
      await deleteSupplier(supplier.id)

      if (selectedSupplier?.id === supplier.id) {
        setSelectedSupplier(null)
      }

      const nextPage = supplierList.items.length === 1 && page > 1 ? page - 1 : page
      setPage(nextPage)
      await loadSuppliers(nextPage, search)
      toast.success('Supplier deleted successfully.')
    } catch (error) {
      const message = getErrorMessage(error, 'Unable to delete supplier.')
      setError(message)
      toast.error('Delete failed', message)
    }
  }

  function handleEdit(supplier: Supplier) {
    setSelectedSupplier(supplier)
    setError(null)
  }

  function handleCancelEdit() {
    setSelectedSupplier(null)
  }

  function handleSearchChange(event: React.ChangeEvent<HTMLInputElement>) {
    setSearch(event.target.value)
  }

  async function handleSearchSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPage(1)
    setSelectedSupplier(null)
    await loadSuppliers(1, search)
  }

  async function handlePageChange(nextPage: number) {
    setPage(nextPage)
    await loadSuppliers(nextPage, search)
  }

  return (
    <section className="page suppliers-page">
      <div className="page-hero">
        <div>
          <p className="page-eyebrow">Purchasing</p>
          <h2>Suppliers</h2>
          <p className="page-copy">
            Keep vendor contacts searchable and ready for purchasing activity.
          </p>
        </div>
        <div className="page-badge">{supplierList.totalCount} total</div>
      </div>

      {error ? <div className="page-state page-state-error">{error}</div> : null}

      <div className="categories-grid">
        <SupplierForm
          initialValues={
            selectedSupplier
              ? toSupplierFormValues(selectedSupplier)
              : emptySupplierFormValues
          }
          isSubmitting={isSaving}
          onCancel={handleCancelEdit}
          onSubmit={handleSubmit}
        />

        <div style={controlsStyle}>
          <form onSubmit={handleSearchSubmit} style={controlsStyle}>
            <input
              aria-label="Search suppliers"
              onChange={handleSearchChange}
              placeholder="Search suppliers..."
              style={searchStyle}
              type="search"
              value={search}
            />
            <button className="button button-secondary" disabled={isLoading} type="submit">
              Search
            </button>
          </form>

          <div className="page-state" style={{ margin: 0 }}>
            Page {supplierList.page} of {supplierList.totalPages}
          </div>
        </div>

        <SupplierTable
          isLoading={isLoading}
          onDelete={handleDelete}
          onEdit={handleEdit}
          suppliers={supplierList.items}
        />

        <div style={paginationStyle}>
          <button
            className="button button-secondary"
            disabled={isLoading || supplierList.page <= 1}
            onClick={() => void handlePageChange(supplierList.page - 1)}
            type="button"
          >
            Previous
          </button>
          <span className="page-state" style={{ margin: 0 }}>
            {supplierList.totalCount} suppliers
          </span>
          <button
            className="button button-secondary"
            disabled={isLoading || supplierList.page >= supplierList.totalPages}
            onClick={() => void handlePageChange(supplierList.page + 1)}
            type="button"
          >
            Next
          </button>
        </div>
      </div>
    </section>
  )
}

export default Suppliers
