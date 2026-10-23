import { useEffect, useState } from 'react'
import type { CSSProperties } from 'react'
import axios from 'axios'
import CustomerForm from '../components/CustomerForm'
import CustomerTable from '../components/CustomerTable'
import { useConfirmDialog } from '../components/ui/ConfirmDialogProvider'
import { useToast } from '../components/ui/ToastProvider'
import {
  createCustomer,
  deleteCustomer,
  getCustomers,
  updateCustomer,
} from '../services/customerService'
import type {
  Customer,
  CustomerFormValues,
  CustomerListResponse,
  CustomerUpsertPayload,
} from '../types/customer'

const emptyCustomerFormValues: CustomerFormValues = {
  name: '',
  email: '',
  phone: '',
  address: '',
}

const emptyCustomerListResponse: CustomerListResponse = {
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

function toCustomerFormValues(customer: Customer): CustomerFormValues {
  return {
    name: customer.name,
    email: customer.email,
    phone: customer.phone,
    address: customer.address,
  }
}

function toCustomerUpsertPayload(values: CustomerFormValues): CustomerUpsertPayload {
  return {
    name: values.name.trim(),
    email: values.email.trim(),
    phone: values.phone.trim(),
    address: values.address.trim(),
  }
}

function Customers() {
  const { confirm } = useConfirmDialog()
  const toast = useToast()
  const [customerList, setCustomerList] =
    useState<CustomerListResponse>(emptyCustomerListResponse)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize] = useState(10)

  async function loadCustomers(nextPage = page, nextSearch = search) {
    try {
      setIsLoading(true)
      setError(null)
      const customers = await getCustomers(
        nextPage,
        pageSize,
        nextSearch.trim() || undefined,
      )
      setCustomerList(customers)
    } catch (error) {
      setError(getErrorMessage(error, 'Unable to load customers.'))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadCustomers(1, '')
  }, [])

  async function handleSubmit(values: CustomerFormValues) {
    try {
      setIsSaving(true)
      setError(null)
      const payload = toCustomerUpsertPayload(values)

      if (selectedCustomer) {
        await updateCustomer(selectedCustomer.id, payload)
        setSelectedCustomer(null)
        toast.success('Customer updated successfully.')
      } else {
        await createCustomer(payload)
        toast.success('Customer created successfully.')
      }

      await loadCustomers(page, search)
    } catch (error) {
      const message = getErrorMessage(error, 'Unable to save customer.')
      setError(message)
      toast.error('Save failed', message)
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDelete(customer: Customer) {
    const isConfirmed = await confirm({
      title: 'Delete customer?',
      description: `Delete customer "${customer.name}"? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      tone: 'danger',
    })

    if (!isConfirmed) {
      return
    }

    try {
      setError(null)
      await deleteCustomer(customer.id)

      if (selectedCustomer?.id === customer.id) {
        setSelectedCustomer(null)
      }

      const nextPage = customerList.items.length === 1 && page > 1 ? page - 1 : page
      setPage(nextPage)
      await loadCustomers(nextPage, search)
      toast.success('Customer deleted successfully.')
    } catch (error) {
      const message = getErrorMessage(error, 'Unable to delete customer.')
      setError(message)
      toast.error('Delete failed', message)
    }
  }

  function handleEdit(customer: Customer) {
    setSelectedCustomer(customer)
    setError(null)
  }

  function handleCancelEdit() {
    setSelectedCustomer(null)
  }

  function handleSearchChange(event: React.ChangeEvent<HTMLInputElement>) {
    setSearch(event.target.value)
  }

  async function handleSearchSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPage(1)
    setSelectedCustomer(null)
    await loadCustomers(1, search)
  }

  async function handlePageChange(nextPage: number) {
    setPage(nextPage)
    await loadCustomers(nextPage, search)
  }

  return (
    <section className="page customers-page">
      <div className="page-hero">
        <div>
          <p className="page-eyebrow">Sales</p>
          <h2>Customers</h2>
          <p className="page-copy">
            Keep customer contacts searchable and ready for sales activity.
          </p>
        </div>
        <div className="page-badge">{customerList.totalCount} total</div>
      </div>

      {error ? <div className="page-state page-state-error">{error}</div> : null}

      <div className="categories-grid">
        <CustomerForm
          initialValues={
            selectedCustomer
              ? toCustomerFormValues(selectedCustomer)
              : emptyCustomerFormValues
          }
          isSubmitting={isSaving}
          onCancel={handleCancelEdit}
          onSubmit={handleSubmit}
        />

        <div style={controlsStyle}>
          <form onSubmit={handleSearchSubmit} style={controlsStyle}>
            <input
              aria-label="Search customers"
              onChange={handleSearchChange}
              placeholder="Search customers..."
              style={searchStyle}
              type="search"
              value={search}
            />
            <button className="button button-secondary" disabled={isLoading} type="submit">
              Search
            </button>
          </form>

          <div className="page-state" style={{ margin: 0 }}>
            Page {customerList.page} of {customerList.totalPages}
          </div>
        </div>

        <CustomerTable
          customers={customerList.items}
          isLoading={isLoading}
          onDelete={handleDelete}
          onEdit={handleEdit}
        />

        <div style={paginationStyle}>
          <button
            className="button button-secondary"
            disabled={isLoading || customerList.page <= 1}
            onClick={() => void handlePageChange(customerList.page - 1)}
            type="button"
          >
            Previous
          </button>
          <span className="page-state" style={{ margin: 0 }}>
            {customerList.totalCount} customers
          </span>
          <button
            className="button button-secondary"
            disabled={isLoading || customerList.page >= customerList.totalPages}
            onClick={() => void handlePageChange(customerList.page + 1)}
            type="button"
          >
            Next
          </button>
        </div>
      </div>
    </section>
  )
}

export default Customers
