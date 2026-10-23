import { useEffect, useMemo, useState } from 'react'
import type { CSSProperties } from 'react'
import type { Customer } from '../types/customer'
import type { Product } from '../types/product'
import type { SaleFormItemValues, SaleFormValues } from '../types/sale'

type SaleFormProps = {
  initialValues: SaleFormValues
  products: Product[]
  customers: Customer[]
  stockBufferByProductId?: Record<number, number>
  isSubmitting?: boolean
  onCancel: () => void
  onSubmit: (values: SaleFormValues) => Promise<void> | void
}

type ItemError = Partial<Record<keyof SaleFormItemValues, string>>

type FormErrors = {
  customerId?: string
  saleDate?: string
  items?: string
  itemErrors: ItemError[]
}

const selectStyle: CSSProperties = {
  border: '1px solid var(--border)',
  borderRadius: '14px',
  background: 'var(--field-bg)',
  color: 'var(--text)',
  padding: '14px 16px',
  outline: 'none',
}

const rowStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1.8fr) minmax(0, 1fr) minmax(0, 1fr) auto',
  gap: '12px',
  alignItems: 'start',
}

function createEmptyItem(): SaleFormItemValues {
  return {
    productId: '',
    quantity: '',
    unitPrice: '',
  }
}

function validate(
  values: SaleFormValues,
  products: Product[],
  stockBufferByProductId: Record<number, number>,
): FormErrors {
  const errors: FormErrors = { itemErrors: values.items.map(() => ({})) }

  if (!values.customerId) {
    errors.customerId = 'Customer is required.'
  }

  if (!values.saleDate) {
    errors.saleDate = 'Sale date is required.'
  }

  if (values.items.length === 0) {
    errors.items = 'At least one product is required.'
    return errors
  }

  for (const [index, item] of values.items.entries()) {
    if (!item.productId) {
      errors.itemErrors[index].productId = 'Product is required.'
    }

    if (!item.quantity) {
      errors.itemErrors[index].quantity = 'Quantity is required.'
    } else if (Number(item.quantity) <= 0) {
      errors.itemErrors[index].quantity = 'Quantity must be greater than zero.'
    }

    if (!item.unitPrice) {
      errors.itemErrors[index].unitPrice = 'Selling price is required.'
    } else if (Number(item.unitPrice) < 0) {
      errors.itemErrors[index].unitPrice = 'Selling price cannot be negative.'
    }
  }

  const requestedByProduct: Record<number, number> = {}
  for (const item of values.items) {
    const productId = Number(item.productId)
    const quantity = Number(item.quantity)

    if (!Number.isFinite(productId) || productId <= 0 || !Number.isFinite(quantity) || quantity <= 0) {
      continue
    }

    requestedByProduct[productId] = (requestedByProduct[productId] ?? 0) + quantity
  }

  for (const [productIdText, requestedQuantity] of Object.entries(requestedByProduct)) {
    const productId = Number(productIdText)
    const product = products.find((candidate) => candidate.id === productId)

    if (!product) {
      continue
    }

    const available = product.stockQuantity + (stockBufferByProductId[productId] ?? 0)
    if (requestedQuantity > available) {
      const stockError = `Requested quantity exceeds available stock (${available}).`
      values.items.forEach((item, index) => {
        if (Number(item.productId) === productId) {
          errors.itemErrors[index].quantity = stockError
        }
      })
    }
  }

  return errors
}

function hasErrors(errors: FormErrors) {
  return Boolean(
    errors.customerId ||
      errors.saleDate ||
      errors.items ||
      errors.itemErrors.some((itemError) =>
        Boolean(itemError.productId || itemError.quantity || itemError.unitPrice),
      ),
  )
}

function SaleForm({
  initialValues,
  products,
  customers,
  stockBufferByProductId = {},
  isSubmitting = false,
  onCancel,
  onSubmit,
}: SaleFormProps) {
  const [values, setValues] = useState<SaleFormValues>(initialValues)
  const [errors, setErrors] = useState<FormErrors>({ itemErrors: initialValues.items.map(() => ({})) })
  const [isTouched, setIsTouched] = useState(false)

  useEffect(() => {
    setValues(initialValues)
    setErrors({ itemErrors: initialValues.items.map(() => ({})) })
    setIsTouched(false)
  }, [initialValues])

  const lineTotals = useMemo(
    () =>
      values.items.map((item) => {
        const quantity = Number(item.quantity)
        const unitPrice = Number(item.unitPrice)

        if (!Number.isFinite(quantity) || !Number.isFinite(unitPrice) || quantity < 0 || unitPrice < 0) {
          return 0
        }

        return quantity * unitPrice
      }),
    [values.items],
  )

  const grandTotal = lineTotals.reduce((sum, lineTotal) => sum + lineTotal, 0)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const nextErrors = validate(values, products, stockBufferByProductId)
    setErrors(nextErrors)
    setIsTouched(true)

    if (hasErrors(nextErrors)) {
      return
    }

    await onSubmit(values)
  }

  function handleRootChange(event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = event.target
    const nextValues = {
      ...values,
      [name]: value,
    }

    setValues(nextValues)

    if (isTouched) {
      setErrors(validate(nextValues, products, stockBufferByProductId))
    }
  }

  function handleItemChange(
    itemIndex: number,
    key: keyof SaleFormItemValues,
    value: string,
  ) {
    const nextItems = values.items.map((item, index) =>
      index === itemIndex
        ? {
            ...item,
            [key]: value,
          }
        : item,
    )

    const nextValues = {
      ...values,
      items: nextItems,
    }

    setValues(nextValues)

    if (isTouched) {
      setErrors(validate(nextValues, products, stockBufferByProductId))
    }
  }

  function handleAddItem() {
    const nextValues = {
      ...values,
      items: [...values.items, createEmptyItem()],
    }

    setValues(nextValues)

    if (isTouched) {
      setErrors(validate(nextValues, products, stockBufferByProductId))
    }
  }

  function handleRemoveItem(itemIndex: number) {
    const nextItems = values.items.filter((_, index) => index !== itemIndex)
    const nextValues = {
      ...values,
      items: nextItems,
    }

    setValues(nextValues)

    if (isTouched) {
      setErrors(validate(nextValues, products, stockBufferByProductId))
    }
  }

  function handleBlur() {
    if (!isTouched) {
      setIsTouched(true)
    }

    setErrors(validate(values, products, stockBufferByProductId))
  }

  return (
    <section className="form-card">
      <div className="form-card-header">
        <div>
          <h3>Sale Details</h3>
          <p>Record customer sales with multiple products and automatic total calculation.</p>
        </div>
        <div className="form-card-badge">Sale</div>
      </div>

      <form className="form-grid" onSubmit={handleSubmit} noValidate>
        <div className="field-group">
          <label htmlFor="sale-customer">Customer</label>
          <select
            id="sale-customer"
            name="customerId"
            onBlur={handleBlur}
            onChange={handleRootChange}
            style={selectStyle}
            value={values.customerId}
          >
            <option value="">Select a customer</option>
            {customers.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.name}
              </option>
            ))}
          </select>
          {errors.customerId ? <span className="field-error">{errors.customerId}</span> : null}
        </div>

        <div className="field-group">
          <label htmlFor="sale-date">Sale Date</label>
          <input
            id="sale-date"
            name="saleDate"
            onBlur={handleBlur}
            onChange={handleRootChange}
            type="date"
            value={values.saleDate}
          />
          {errors.saleDate ? <span className="field-error">{errors.saleDate}</span> : null}
        </div>

        <div className="field-group" style={{ gap: '12px' }}>
          <div style={{ alignItems: 'center', display: 'flex', justifyContent: 'space-between' }}>
            <label style={{ margin: 0 }}>Products</label>
            <button className="button button-secondary button-sm" onClick={handleAddItem} type="button">
              Add Product
            </button>
          </div>

          {errors.items ? <span className="field-error">{errors.items}</span> : null}

          {values.items.map((item, index) => {
            const itemError = errors.itemErrors[index] ?? {}
            const selectedProduct = products.find((product) => product.id === Number(item.productId))
            const availableStock =
              selectedProduct
                ? selectedProduct.stockQuantity + (stockBufferByProductId[selectedProduct.id] ?? 0)
                : null

            return (
              <div key={`${index}-${item.productId}`} style={rowStyle}>
                <div>
                  <select
                    aria-label={`Product ${index + 1}`}
                    onBlur={handleBlur}
                    onChange={(event) => handleItemChange(index, 'productId', event.target.value)}
                    style={{ ...selectStyle, width: '100%' }}
                    value={item.productId}
                  >
                    <option value="">Select a product</option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name} (Stock: {product.stockQuantity})
                      </option>
                    ))}
                  </select>
                  {availableStock !== null ? (
                    <span className="page-state" style={{ margin: '8px 0 0 0' }}>
                      Available: {availableStock}
                    </span>
                  ) : null}
                  {itemError.productId ? <span className="field-error">{itemError.productId}</span> : null}
                </div>

                <div>
                  <input
                    aria-label={`Quantity ${index + 1}`}
                    min="1"
                    onBlur={handleBlur}
                    onChange={(event) => handleItemChange(index, 'quantity', event.target.value)}
                    placeholder="0"
                    step="1"
                    type="number"
                    value={item.quantity}
                  />
                  {itemError.quantity ? <span className="field-error">{itemError.quantity}</span> : null}
                </div>

                <div>
                  <input
                    aria-label={`Selling price ${index + 1}`}
                    min="0"
                    onBlur={handleBlur}
                    onChange={(event) => handleItemChange(index, 'unitPrice', event.target.value)}
                    placeholder="0.00"
                    step="0.01"
                    type="number"
                    value={item.unitPrice}
                  />
                  {itemError.unitPrice ? <span className="field-error">{itemError.unitPrice}</span> : null}
                </div>

                <div style={{ display: 'grid', gap: '8px' }}>
                  <span className="page-state" style={{ margin: 0, textAlign: 'right' }}>
                    {(lineTotals[index] ?? 0).toFixed(2)} EGP
                  </span>
                  <button
                    className="button button-danger button-sm"
                    disabled={values.items.length === 1}
                    onClick={() => handleRemoveItem(index)}
                    type="button"
                  >
                    Remove
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        <div className="page-state" style={{ margin: 0, textAlign: 'right' }}>
          Total: {grandTotal.toFixed(2)} EGP
        </div>

        <div className="form-actions">
          <button
            className="button button-ghost"
            disabled={isSubmitting}
            onClick={onCancel}
            type="button"
          >
            Cancel
          </button>
          <button className="button button-primary" disabled={isSubmitting} type="submit">
            {isSubmitting ? 'Saving...' : 'Save Sale'}
          </button>
        </div>
      </form>
    </section>
  )
}

export default SaleForm
