import { useEffect, useState } from 'react'
import axios from 'axios'
import CategoryForm from '../components/CategoryForm'
import CategoryTable from '../components/CategoryTable'
import { useConfirmDialog } from '../components/ui/ConfirmDialogProvider'
import { useToast } from '../components/ui/ToastProvider'
import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
} from '../services/categoryService'
import type { Category, CategoryFormValues } from '../types/category'

const emptyCategoryFormValues: CategoryFormValues = {
  name: '',
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

function Categories() {
  const { confirm } = useConfirmDialog()
  const toast = useToast()
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)

  async function loadCategories() {
    try {
      setIsLoading(true)
      setError(null)
      const categoryList = await getCategories()
      setCategories(categoryList)
    } catch (error) {
      setError(getErrorMessage(error, 'Unable to load categories.'))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadCategories()
  }, [])

  async function handleSubmit(values: CategoryFormValues) {
    try {
      setIsSaving(true)
      setError(null)

      if (selectedCategory) {
        await updateCategory(selectedCategory.id, values)
        setSelectedCategory(null)
        toast.success('Category updated successfully.')
      } else {
        await createCategory(values)
        toast.success('Category created successfully.')
      }

      await loadCategories()
    } catch (error) {
      const message = getErrorMessage(error, 'Unable to save category.')
      setError(message)
      toast.error('Save failed', message)
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDelete(category: Category) {
    const isConfirmed = await confirm({
      title: 'Delete category?',
      description: `Delete category "${category.name}"? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      tone: 'danger',
    })

    if (!isConfirmed) {
      return
    }

    try {
      setError(null)
      await deleteCategory(category.id)

      if (selectedCategory?.id === category.id) {
        setSelectedCategory(null)
      }

      await loadCategories()
      toast.success('Category deleted successfully.')
    } catch (error) {
      const message = getErrorMessage(error, 'Unable to delete category.')
      setError(message)
      toast.error('Delete failed', message)
    }
  }

  function handleEdit(category: Category) {
    setSelectedCategory(category)
    setError(null)
  }

  function handleCancelEdit() {
    setSelectedCategory(null)
  }

  return (
    <section className="page categories-page">
      <div className="page-hero">
        <div>
          <p className="page-eyebrow">Catalog</p>
          <h2>Categories</h2>
          <p className="page-copy">
            Keep product groupings organized with a simple create, edit, and delete workflow.
          </p>
        </div>
        <div className="page-badge">React 19 + ASP.NET Core</div>
      </div>

      {error ? <div className="page-state page-state-error">{error}</div> : null}

      {isLoading ? (
        <div className="page-state">Loading categories...</div>
      ) : (
        <div className="categories-grid">
          <CategoryForm
            initialValues={selectedCategory ?? emptyCategoryFormValues}
            isSubmitting={isSaving}
            mode={selectedCategory ? 'edit' : 'create'}
            onCancel={handleCancelEdit}
            onSubmit={handleSubmit}
          />

          <CategoryTable
            categories={categories}
            onDelete={handleDelete}
            onEdit={handleEdit}
          />
        </div>
      )}
    </section>
  )
}

export default Categories
