import { useEffect, useState } from 'react'
import type { SupplierFormValues } from '../types/supplier'

type SupplierFormProps = {
  initialValues: SupplierFormValues
  isSubmitting?: boolean
  onCancel: () => void
  onSubmit: (values: SupplierFormValues) => Promise<void> | void
}

type FormErrors = Partial<Record<keyof SupplierFormValues, string>>

const textareaStyle = {
  border: '1px solid var(--border)',
  borderRadius: '14px',
  background: 'var(--field-bg)',
  color: 'var(--text)',
  padding: '14px 16px',
  outline: 'none',
  resize: 'vertical' as const,
}

function validate(values: SupplierFormValues): FormErrors {
  const errors: FormErrors = {}

  if (!values.name.trim()) {
    errors.name = 'Name is required.'
  }

  if (!values.company.trim()) {
    errors.company = 'Company is required.'
  }

  if (!values.email.trim()) {
    errors.email = 'Email is required.'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
    errors.email = 'Enter a valid email address.'
  }

  if (!values.phone.trim()) {
    errors.phone = 'Phone is required.'
  }

  if (!values.address.trim()) {
    errors.address = 'Address is required.'
  }

  return errors
}

function SupplierForm({
  initialValues,
  isSubmitting = false,
  onCancel,
  onSubmit,
}: SupplierFormProps) {
  const [values, setValues] = useState<SupplierFormValues>(initialValues)
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
      name: values.name.trim(),
      company: values.company.trim(),
      email: values.email.trim(),
      phone: values.phone.trim(),
      address: values.address.trim(),
    })
  }

  function handleChange(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
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
          <h3>Supplier Details</h3>
          <p>Manage contact and company information for purchasing workflows.</p>
        </div>
        <div className="form-card-badge">Supplier</div>
      </div>

      <form className="form-grid" onSubmit={handleSubmit} noValidate>
        <div className="field-group">
          <label htmlFor="supplier-name">Name</label>
          <input
            autoComplete="off"
            id="supplier-name"
            name="name"
            onBlur={handleBlur}
            onChange={handleChange}
            placeholder="e.g. Sarah Johnson"
            type="text"
            value={values.name}
          />
          {errors.name ? <span className="field-error">{errors.name}</span> : null}
        </div>

        <div className="field-group">
          <label htmlFor="supplier-company">Company</label>
          <input
            autoComplete="organization"
            id="supplier-company"
            name="company"
            onBlur={handleBlur}
            onChange={handleChange}
            placeholder="e.g. Northwind Supplies"
            type="text"
            value={values.company}
          />
          {errors.company ? <span className="field-error">{errors.company}</span> : null}
        </div>

        <div className="field-group">
          <label htmlFor="supplier-email">Email</label>
          <input
            autoComplete="email"
            id="supplier-email"
            name="email"
            onBlur={handleBlur}
            onChange={handleChange}
            placeholder="e.g. sarah@example.com"
            type="email"
            value={values.email}
          />
          {errors.email ? <span className="field-error">{errors.email}</span> : null}
        </div>

        <div className="field-group">
          <label htmlFor="supplier-phone">Phone</label>
          <input
            autoComplete="tel"
            id="supplier-phone"
            name="phone"
            onBlur={handleBlur}
            onChange={handleChange}
            placeholder="e.g. +1 555 123 4567"
            type="tel"
            value={values.phone}
          />
          {errors.phone ? <span className="field-error">{errors.phone}</span> : null}
        </div>

        <div className="field-group">
          <label htmlFor="supplier-address">Address</label>
          <textarea
            id="supplier-address"
            name="address"
            onBlur={handleBlur}
            onChange={handleChange}
            placeholder="Street, city, region"
            rows={4}
            style={textareaStyle}
            value={values.address}
          />
          {errors.address ? <span className="field-error">{errors.address}</span> : null}
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
            {isSubmitting ? 'Saving...' : 'Save Supplier'}
          </button>
        </div>
      </form>
    </section>
  )
}

export default SupplierForm
