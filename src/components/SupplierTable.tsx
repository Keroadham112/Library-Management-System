import type { Supplier } from '../types/supplier'
import TableStatusRow from './ui/TableStatusRow'

type SupplierTableProps = {
  suppliers: Supplier[]
  isLoading: boolean
  onEdit: (supplier: Supplier) => void
  onDelete: (supplier: Supplier) => void
}

function SupplierTable({ suppliers, isLoading, onEdit, onDelete }: SupplierTableProps) {
  return (
    <div className="table-card">
      <div className="table-card-header">
        <div>
          <h3>Suppliers</h3>
          <p>Track supplier contacts, companies, and addresses.</p>
        </div>
        <div className="table-card-count">{suppliers.length} shown</div>
      </div>

      <div className="table-scroll" role="region" aria-label="Suppliers table">
        <table className="data-table">
          <thead>
            <tr>
              <th scope="col">Name</th>
              <th scope="col">Company</th>
              <th scope="col">Email</th>
              <th scope="col">Phone</th>
              <th scope="col">Address</th>
              <th scope="col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <TableStatusRow
                colSpan={6}
                emptyText="No suppliers available yet."
                loadingText="Loading suppliers..."
                state="loading"
              />
            ) : suppliers.length === 0 ? (
              <TableStatusRow
                colSpan={6}
                emptyText="No suppliers available yet."
                loadingText="Loading suppliers..."
                state="empty"
              />
            ) : (
              suppliers.map((supplier) => (
                <tr key={supplier.id}>
                  <td>{supplier.name}</td>
                  <td>{supplier.company}</td>
                  <td>{supplier.email}</td>
                  <td>{supplier.phone}</td>
                  <td>{supplier.address}</td>
                  <td>
                    <div className="table-actions">
                      <button
                        className="button button-secondary button-sm"
                        onClick={() => onEdit(supplier)}
                        type="button"
                      >
                        Edit
                      </button>
                      <button
                        className="button button-danger button-sm"
                        onClick={() => onDelete(supplier)}
                        type="button"
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

export default SupplierTable
