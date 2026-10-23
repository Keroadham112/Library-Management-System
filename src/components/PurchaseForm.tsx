import { useEffect, useState } from 'react'
import type { CSSProperties } from 'react'
import type { Product } from '../types/product'
import type { PurchaseFormValues } from '../types/purchase'
import type { Supplier } from '../types/supplier'

type PurchaseFormProps = {
  initialValues: PurchaseFormValues
  products: Product[]
  suppliers: Supplier[]
  isSubmitting?: boolean
  onCancel: () => void
  onSubmit: (values: PurchaseFormValues) => Promise<void> | void
}

type FormErrors = Partial<Record<keyof PurchaseFormValues, string>>

const selectStyle: CSSProperties = {
  border: '1px solid var(--border)',
  borderRadius: '14px',
  background: 'var(--field-bg)',
  color: 'var(--text)',
  padding: '14px 16px',
  outline: 'none',
}

function validate(values: PurchaseFormValues): FormErrors {
  const errors: FormErrors = {}

  if (!values.supplierId) {
    errors.supplierId = 'Supplier is required.'
  }

  if (!values.productId) {
    errors.productId = 'Product is required.'
  }

  if (!values.quantity) {
    errors.quantity = 'Quantity is required.'
  } else if (Number(values.quantity) <= 0) {
    errors.quantity = 'Quantity must be greater than zero.'
  }

  if (!values.unitCost) {
    errors.unitCost = 'Unit cost is required.'
  } else if (Number(values.unitCost) < 0) {
    errors.unitCost = 'Unit cost cannot be negative.'
  }

  if (!values.purchaseDate) {
    errors.purchaseDate = 'Purchase date is required.'
  }

  return errors
}

function PurchaseForm({
  initialValues,
  products,
  suppliers,
  isSubmitting = false,
  onCancel,
  onSubmit,
}: PurchaseFormProps) {
  const [values, setValues] = useState<PurchaseFormValues>(initialValues)
  const [errors, setErrors] = useState<FormErrors>({})
  const [isTouched, setIsTouched] = useState(false)

  useEffect(() => {
    setValues(initialValues)
    setErrors({})
    setIsTouched(false)
  }, [initialValues])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const nextErrors = validate(values)
    setErrors(nextErrors)
    setIsTouched(true)

    if (Object.keys(nextErrors).length > 0) {
      return
    }

    await onSubmit(values)
  }

  function handleChange(event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = event.target
    const nextValues = {
      ...values,
      [name]: value,
    }

    setValues(nextValues)

    if (isTouched) {
      setErrors(validate(nextValues))
    }
  }

  function handleBlur() {
    if (!isTouched) {
      setIsTouched(true)
    }

    setErrors(validate(values))
  }

  return (
    <section className="form-card">
      <div className="form-card-header">
        <div>
          <h3>Purchase Details</h3>
          <p>Record incoming inventory from suppliers and update stock quantities.</p>
        </div>
        <div className="form-card-badge">Purchase</div>
      </div>

      <form className="form-grid" onSubmit={handleSubmit} noValidate>
        <div className="field-group">
          <label htmlFor="purchase-supplier">Supplier</label>
          <select
            id="purchase-supplier"
            name="supplierId"
            onBlur={handleBlur}
            onChange={handleChange}
            style={selectStyle}
            value={values.supplierId}
          >
            <option value="">Select a supplier</option>
            {suppliers.map((supplier) => (
              <option key={supplier.id} value={supplier.id}>
                {supplier.name} - {supplier.company}
              </option>
            ))}
          </select>
          {errors.supplierId ? <span className="field-error">{errors.supplierId}</span> : null}
        </div>

        <div className="field-group">
          <label htmlFor="purchase-product">Product</label>
          <select
            id="purchase-product"
            name="productId"
            onBlur={handleBlur}
            onChange={handleChange}
            style={selectStyle}
            value={values.productId}
          >
            <option value="">Select a product</option>
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name}
              </option>
            ))}
          </select>
          {errors.productId ? <span className="field-error">{errors.productId}</span> : null}
        </div>

        <div className="field-group">
          <label htmlFor="purchase-quantity">Quantity</label>
          <input
            id="purchase-quantity"
            min="1"
            name="quantity"
            onBlur={handleBlur}
            onChange={handleChange}
            placeholder="0"
            step="1"
            type="number"
            value={values.quantity}
          />
          {errors.quantity ? <span className="field-error">{errors.quantity}</span> : null}
        </div>

        <div className="field-group">
          <label htmlFor="purchase-unit-cost">Unit Cost</label>
          <input
            id="purchase-unit-cost"
            min="0"
            name="unitCost"
            onBlur={handleBlur}
            onChange={handleChange}
            placeholder="0.00"
            step="0.01"
            type="number"
            value={values.unitCost}
          />
          {errors.unitCost ? <span className="field-error">{errors.unitCost}</span> : null}
        </div>

        <div className="field-group">
          <label htmlFor="purchase-date">Purchase Date</label>
          <input
            id="purchase-date"
            name="purchaseDate"
            onBlur={handleBlur}
            onChange={handleChange}
            type="date"
            value={values.purchaseDate}
          />
          {errors.purchaseDate ? <span className="field-error">{errors.purchaseDate}</span> : null}
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
            {isSubmitting ? 'Saving...' : 'Save Purchase'}
          </button>
        </div>
      </form>
    </section>
  )
}

export default PurchaseForm
