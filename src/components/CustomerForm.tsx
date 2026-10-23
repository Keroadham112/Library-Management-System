import { useEffect, useState } from 'react'
import type { CustomerFormValues } from '../types/customer'

type CustomerFormProps = {
  initialValues: CustomerFormValues
  isSubmitting?: boolean
  onCancel: () => void
  onSubmit: (values: CustomerFormValues) => Promise<void> | void
}

type FormErrors = Partial<Record<keyof CustomerFormValues, string>>

const textareaStyle = {
  border: '1px solid var(--border)',
  borderRadius: '14px',
  background: 'var(--field-bg)',
  color: 'var(--text)',
  padding: '14px 16px',
  outline: 'none',
  resize: 'vertical' as const,
}

function validate(values: CustomerFormValues): FormErrors {
  const errors: FormErrors = {}

  if (!values.name.trim()) {
    errors.name = 'Name is required.'
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

function CustomerForm({
  initialValues,
  isSubmitting = false,
  onCancel,
  onSubmit,
}: CustomerFormProps) {
  const [values, setValues] = useState<CustomerFormValues>(initialValues)
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
          <h3>Customer Details</h3>
          <p>Manage contact information for sales and order workflows.</p>
        </div>
        <div className="form-card-badge">Customer</div>
      </div>

      <form className="form-grid" onSubmit={handleSubmit} noValidate>
        <div className="field-group">
          <label htmlFor="customer-name">Name</label>
          <input
            autoComplete="off"
            id="customer-name"
            name="name"
            onBlur={handleBlur}
            onChange={handleChange}
            placeholder="e.g. Alex Rivera"
            type="text"
            value={values.name}
          />
          {errors.name ? <span className="field-error">{errors.name}</span> : null}
        </div>

        <div className="field-group">
          <label htmlFor="customer-email">Email</label>
          <input
            autoComplete="email"
            id="customer-email"
            name="email"
            onBlur={handleBlur}
            onChange={handleChange}
            placeholder="e.g. alex@example.com"
            type="email"
            value={values.email}
          />
          {errors.email ? <span className="field-error">{errors.email}</span> : null}
        </div>

        <div className="field-group">
          <label htmlFor="customer-phone">Phone</label>
          <input
            autoComplete="tel"
            id="customer-phone"
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
          <label htmlFor="customer-address">Address</label>
          <textarea
            id="customer-address"
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
            {isSubmitting ? 'Saving...' : 'Save Customer'}
          </button>
        </div>
      </form>
    </section>
  )
}

export default CustomerForm
