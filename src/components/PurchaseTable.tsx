import type { Purchase } from '../types/purchase'
import TableStatusRow from './ui/TableStatusRow'

type PurchaseTableProps = {
  purchases: Purchase[]
  isLoading: boolean
  onEdit: (purchase: Purchase) => void
  onDelete: (purchase: Purchase) => void
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

function PurchaseTable({ purchases, isLoading, onEdit, onDelete }: PurchaseTableProps) {
  return (
    <div className="table-card">
      <div className="table-card-header">
        <div>
          <h3>Purchases</h3>
          <p>Review supplier purchases and incoming product quantities.</p>
        </div>
        <div className="table-card-count">{purchases.length} shown</div>
      </div>

      <div className="table-scroll" role="region" aria-label="Purchases table">
        <table className="data-table">
          <thead>
            <tr>
              <th scope="col">Date</th>
              <th scope="col">Supplier</th>
              <th scope="col">Product</th>
              <th scope="col">Quantity</th>
              <th scope="col">Unit Cost</th>
              <th scope="col">Total Cost</th>
              <th scope="col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <TableStatusRow
                colSpan={7}
                emptyText="No purchases available yet."
                loadingText="Loading purchases..."
                state="loading"
              />
            ) : purchases.length === 0 ? (
              <TableStatusRow
                colSpan={7}
                emptyText="No purchases available yet."
                loadingText="Loading purchases..."
                state="empty"
              />
            ) : (
              purchases.map((purchase) => (
                <tr key={purchase.id}>
                  <td>{formatDate(purchase.purchaseDate)}</td>
                  <td>{purchase.supplierName}</td>
                  <td>{purchase.productName}</td>
                  <td>{purchase.quantity}</td>
                  <td>{formatPrice(purchase.unitCost)}</td>
                  <td>{formatPrice(purchase.totalCost)}</td>
                  <td>
                    <div className="table-actions">
                      <button
                        className="button button-secondary button-sm"
                        onClick={() => onEdit(purchase)}
                        type="button"
                      >
                        Edit
                      </button>
                      <button
                        className="button button-danger button-sm"
                        onClick={() => onDelete(purchase)}
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

export default PurchaseTable
