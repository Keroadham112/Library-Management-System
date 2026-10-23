import type { Sale } from '../types/sale'
import TableStatusRow from './ui/TableStatusRow'

type SaleTableProps = {
  sales: Sale[]
  isLoading: boolean
  onEdit: (sale: Sale) => void
  onDelete: (sale: Sale) => void
}

const numberFormatter = new Intl.NumberFormat('en-EG', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

function formatPrice(value: number) {
  return `${numberFormatter.format(value)} EGP`
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-EG', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  }).format(new Date(value))
}

function SaleTable({ sales, isLoading, onEdit, onDelete }: SaleTableProps) {
  return (
    <div className="table-card">
      <div className="table-card-header">
        <div>
          <h3>Sales</h3>
          <p>Review customer sales, product lines, and total invoice values.</p>
        </div>
        <div className="table-card-count">{sales.length} shown</div>
      </div>

      <div className="table-scroll" role="region" aria-label="Sales table">
        <table className="data-table">
          <thead>
            <tr>
              <th scope="col">Date</th>
              <th scope="col">Customer</th>
              <th scope="col">Items</th>
              <th scope="col">Total Amount</th>
              <th scope="col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <TableStatusRow
                colSpan={5}
                emptyText="No sales available yet."
                loadingText="Loading sales..."
                state="loading"
              />
            ) : sales.length === 0 ? (
              <TableStatusRow
                colSpan={5}
                emptyText="No sales available yet."
                loadingText="Loading sales..."
                state="empty"
              />
            ) : (
              sales.map((sale) => (
                <tr key={sale.id}>
                  <td>{formatDate(sale.saleDate)}</td>
                  <td>{sale.customerName}</td>
                  <td>
                    {sale.items.map((item) => `${item.productName} x${item.quantity}`).join(', ')}
                  </td>
                  <td>{formatPrice(sale.totalAmount)}</td>
                  <td>
                    <div className="table-actions">
                      <button
                        className="button button-secondary button-sm"
                        onClick={() => onEdit(sale)}
                        type="button"
                      >
                        Edit
                      </button>
                      <button
                        className="button button-danger button-sm"
                        onClick={() => onDelete(sale)}
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

export default SaleTable