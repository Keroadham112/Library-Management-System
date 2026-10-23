import type { Category } from '../types/category'
import TableStatusRow from './ui/TableStatusRow'

type CategoryTableProps = {
  categories: Category[]
  onEdit: (category: Category) => void
  onDelete: (category: Category) => void
}

function CategoryTable({ categories, onEdit, onDelete }: CategoryTableProps) {
  return (
    <div className="table-card">
      <div className="table-card-header">
        <div>
          <h3>Categories</h3>
          <p>Manage your inventory classification structure.</p>
        </div>
        <div className="table-card-count">{categories.length} total</div>
      </div>

      <div className="table-scroll" role="region" aria-label="Categories table">
        <table className="data-table">
          <thead>
            <tr>
              <th scope="col">ID</th>
              <th scope="col">Name</th>
              <th scope="col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.length === 0 ? (
              <TableStatusRow
                colSpan={3}
                emptyText="No categories available yet."
                loadingText="Loading categories..."
                state="empty"
              />
            ) : (
              categories.map((category) => (
                <tr key={category.id}>
                  <td>{category.id}</td>
                  <td>{category.name}</td>
                  <td>
                    <div className="table-actions">
                      <button
                        className="button button-secondary button-sm"
                        type="button"
                        onClick={() => onEdit(category)}
                      >
                        Edit
                      </button>
                      <button
                        className="button button-danger button-sm"
                        type="button"
                        onClick={() => onDelete(category)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default CategoryTable