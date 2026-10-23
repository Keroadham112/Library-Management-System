import { useEffect, useState } from 'react'
import type { CategoryFormValues } from '../types/category'

type CategoryFormProps = {
  initialValues: CategoryFormValues
  isSubmitting?: boolean
  mode: 'create' | 'edit'
  onCancel?: () => void
  onSubmit: (values: CategoryFormValues) => Promise<void> | void
}

type FormErrors = Partial<Record<keyof CategoryFormValues, string>>

const emptyValues: CategoryFormValues = {
  name: '',
}

function validate(values: CategoryFormValues): FormErrors {
  const errors: FormErrors = {}
  const trimmedName = values.name.trim()

  if (!trimmedName) {
    errors.name = 'Name is required.'
  } else if (trimmedName.length < 2) {
    errors.name = 'Name must be at least 2 characters long.'
  } else if (trimmedName.length > 100) {
    errors.name = 'Name cannot exceed 100 characters.'
  }

  return errors
}

function CategoryForm({
  initialValues,
  isSubmitting = false,
  mode,
  onCancel,
  onSubmit,
}: CategoryFormProps) {
  const [values, setValues] = useState<CategoryFormValues>(initialValues)
  const [errors, setErrors] = useState<FormErrors>({})
  const [isTouched, setIsTouched] = useState(false)

  useEffect(() => {
    setValues(initialValues)
    setErrors({})
    setIsTouched(false)
  }, [initialValues, mode])

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
    })

    setValues(emptyValues)
  }

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target

    setValues((current) => ({
      ...current,
      [name]: value,
    }))

    if (isTouched) {
      setErrors(validate({ ...values, [name]: value }))
    }
  }

  function handleBlur() {
    if (!isTouched) {
      setIsTouched(true)
    }

    setErrors(validate(values))
  }

  const title = mode === 'edit' ? 'Edit Category' : 'Add Category'
  const description =
    mode === 'edit'
      ? 'Update the selected category name and save the changes.'
      : 'Create a new category for organizing inventory items.'

  return (
    <section className="form-card">
      <div className="form-card-header">
        <div>
          <h3>{title}</h3>
          <p>{description}</p>
        </div>
        <div className="form-card-badge">
          {mode === 'edit' ? 'Editing' : 'New'}
        </div>
      </div>

      <form className="form-grid" onSubmit={handleSubmit} noValidate>
        <div className="field-group">
          <label htmlFor="category-name">Name</label>
          <input
            autoComplete="off"
            id="category-name"
            name="name"
            onBlur={handleBlur}
            onChange={handleChange}
            placeholder="e.g. Office Supplies"
            type="text"
            value={values.name}
          />
          {errors.name ? <span className="field-error">{errors.name}</span> : null}
        </div>

        <div className="form-actions">
          {mode === 'edit' ? (
            <button
              className="button button-ghost"
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </button>
          ) : null}
          <button className="button button-primary" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : mode === 'edit' ? 'Update Category' : 'Create Category'}
          </button>
        </div>
      </form>
    </section>
  )
}

export default CategoryForm