import type { Customer } from '../types/customer'
import TableStatusRow from './ui/TableStatusRow'

type CustomerTableProps = {
  customers: Customer[]
  isLoading: boolean
  onEdit: (customer: Customer) => void
  onDelete: (customer: Customer) => void
}

function CustomerTable({ customers, isLoading, onEdit, onDelete }: CustomerTableProps) {
  return (
    <div className="table-card">
      <div className="table-card-header">
        <div>
          <h3>Customers</h3>
          <p>Track customer contacts and delivery addresses.</p>
        </div>
        <div className="table-card-count">{customers.length} shown</div>
      </div>

      <div className="table-scroll" role="region" aria-label="Customers table">
        <table className="data-table">
          <thead>
            <tr>
              <th scope="col">Name</th>
              <th scope="col">Email</th>
              <th scope="col">Phone</th>
              <th scope="col">Address</th>
              <th scope="col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <TableStatusRow
                colSpan={5}
                emptyText="No customers available yet."
                loadingText="Loading customers..."
                state="loading"
              />
            ) : customers.length === 0 ? (
              <TableStatusRow
                colSpan={5}
                emptyText="No customers available yet."
                loadingText="Loading customers..."
                state="empty"
              />
            ) : (
              customers.map((customer) => (
                <tr key={customer.id}>
                  <td>{customer.name}</td>
                  <td>{customer.email}</td>
                  <td>{customer.phone}</td>
                  <td>{customer.address}</td>
                  <td>
                    <div className="table-actions">
                      <button
                        className="button button-secondary button-sm"
                        onClick={() => onEdit(customer)}
                        type="button"
                      >
                        Edit
                      </button>
                      <button
                        className="button button-danger button-sm"
                        onClick={() => onDelete(customer)}
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

export default CustomerTable
