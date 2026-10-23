import { useEffect, useState } from 'react'
import type { Category } from '../types/category'
import type { ProductFormValues } from '../types/product'

type ProductFormProps = {
  initialValues: ProductFormValues
  categories: Category[]
  isSubmitting?: boolean
  onCancel: () => void
  onSubmit: (values: ProductFormValues) => Promise<void> | void
}

type FormErrors = Partial<Record<keyof ProductFormValues, string>>

const selectStyle = {
  border: '1px solid var(--border)',
  borderRadius: '14px',
  background: 'var(--field-bg)',
  color: 'var(--text)',
  padding: '14px 16px',
  outline: 'none',
}

function validate(values: ProductFormValues): FormErrors {
  const errors: FormErrors = {}

  if (!values.name.trim()) {
    errors.name = 'Product name is required.'
  }

  if (!values.categoryId) {
    errors.categoryId = 'Category is required.'
  }

  if (!values.sku.trim()) {
    errors.sku = 'SKU is required.'
  }

  if (!values.barcode.trim()) {
    errors.barcode = 'Barcode is required.'
  }

  if (!values.costPrice) {
    errors.costPrice = 'Cost price is required.'
  } else if (Number(values.costPrice) < 0) {
    errors.costPrice = 'Cost price cannot be negative.'
  }

  if (!values.sellingPrice) {
    errors.sellingPrice = 'Selling price is required.'
  } else if (Number(values.sellingPrice) < 0) {
    errors.sellingPrice = 'Selling price cannot be negative.'
  }

  if (!values.stockQuantity) {
    errors.stockQuantity = 'Stock quantity is required.'
  } else if (Number(values.stockQuantity) < 0) {
    errors.stockQuantity = 'Stock quantity cannot be negative.'
  }

  if (!values.lowStockThreshold) {
    errors.lowStockThreshold = 'Low stock threshold is required.'
  } else if (Number(values.lowStockThreshold) < 0) {
    errors.lowStockThreshold = 'Low stock threshold cannot be negative.'
  }

  return errors
}

function ProductForm({
  initialValues,
  categories,
  isSubmitting = false,
  onCancel,
  onSubmit,
}: ProductFormProps) {
  const [values, setValues] = useState<ProductFormValues>(initialValues)
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

    await onSubmit({
      ...values,
      name: values.name.trim(),
      sku: values.sku.trim(),
      barcode: values.barcode.trim(),
    })
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
          <h3>Product Details</h3>
          <p>Add the core product information used across inventory.</p>
        </div>
        <div className="form-card-badge">Product</div>
      </div>

      <form className="form-grid" onSubmit={handleSubmit} noValidate>
        <div className="field-group">
          <label htmlFor="product-name">Product Name</label>
          <input
            autoComplete="off"
            id="product-name"
            name="name"
            onBlur={handleBlur}
            onChange={handleChange}
            placeholder="e.g. Wireless Mouse"
            type="text"
            value={values.name}
          />
          {errors.name ? <span className="field-error">{errors.name}</span> : null}
        </div>

        <div className="field-group">
          <label htmlFor="product-category">Category</label>
          <select
            id="product-category"
            name="categoryId"
            onBlur={handleBlur}
            onChange={handleChange}
            style={selectStyle}
            value={values.categoryId}
          >
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          {errors.categoryId ? <span className="field-error">{errors.categoryId}</span> : null}
        </div>

        <div className="field-group">
          <label htmlFor="product-sku">SKU</label>
          <input
            autoComplete="off"
            id="product-sku"
            name="sku"
            onBlur={handleBlur}
            onChange={handleChange}
            placeholder="e.g. WM-100"
            type="text"
            value={values.sku}
          />
          {errors.sku ? <span className="field-error">{errors.sku}</span> : null}
        </div>

        <div className="field-group">
          <label htmlFor="product-barcode">Barcode</label>
          <input
            autoComplete="off"
            id="product-barcode"
            name="barcode"
            onBlur={handleBlur}
            onChange={handleChange}
            placeholder="e.g. 0123456789012"
            type="text"
            value={values.barcode}
          />
          {errors.barcode ? <span className="field-error">{errors.barcode}</span> : null}
        </div>

        <div className="field-group">
          <label htmlFor="product-cost-price">Cost Price</label>
          <input
            id="product-cost-price"
            min="0"
            name="costPrice"
            onBlur={handleBlur}
            onChange={handleChange}
            placeholder="0.00"
            step="0.01"
            type="number"
            value={values.costPrice}
          />
          {errors.costPrice ? <span className="field-error">{errors.costPrice}</span> : null}
        </div>

        <div className="field-group">
          <label htmlFor="product-selling-price">Selling Price</label>
          <input
            id="product-selling-price"
            min="0"
            name="sellingPrice"
            onBlur={handleBlur}
            onChange={handleChange}
            placeholder="0.00"
            step="0.01"
            type="number"
            value={values.sellingPrice}
          />
          {errors.sellingPrice ? <span className="field-error">{errors.sellingPrice}</span> : null}
        </div>

        <div className="field-group">
          <label htmlFor="product-stock-quantity">Stock Quantity</label>
          <input
            id="product-stock-quantity"
            min="0"
            name="stockQuantity"
            onBlur={handleBlur}
            onChange={handleChange}
            placeholder="0"
            step="1"
            type="number"
            value={values.stockQuantity}
          />
          {errors.stockQuantity ? <span className="field-error">{errors.stockQuantity}</span> : null}
        </div>

        <div className="field-group">
          <label htmlFor="product-low-stock-threshold">Low Stock Threshold</label>
          <input
            id="product-low-stock-threshold"
            min="0"
            name="lowStockThreshold"
            onBlur={handleBlur}
            onChange={handleChange}
            placeholder="0"
            step="1"
            type="number"
            value={values.lowStockThreshold}
          />
          {errors.lowStockThreshold ? (
            <span className="field-error">{errors.lowStockThreshold}</span>
          ) : null}
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
            {isSubmitting ? 'Saving...' : 'Save Product'}
          </button>
        </div>
      </form>
    </section>
  )
}

export default ProductForm
