import type { Product } from '../types/product'
import TableStatusRow from './ui/TableStatusRow'

type ProductTableProps = {
  products: Product[]
  isLoading: boolean
  onEdit: (product: Product) => void
  onDelete: (product: Product) => void
}

const numberFormatter = new Intl.NumberFormat('ar-EG', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

function formatPrice(value: number) {
  return `${numberFormatter.format(value)} ج.م`
}

function ProductTable({ products, isLoading, onEdit, onDelete }: ProductTableProps) {
  return (
    <div className="table-card">
      <div className="table-card-header">
        <div>
          <h3>Products</h3>
          <p>Manage product details, pricing, and stock thresholds.</p>
        </div>
        <div className="table-card-count">{products.length} total</div>
      </div>

      <div className="table-scroll" role="region" aria-label="Products table">
        <table className="data-table">
          <thead>
            <tr>
              <th scope="col">Name</th>
              <th scope="col">Category</th>
              <th scope="col">SKU</th>
              <th scope="col">Barcode</th>
              <th scope="col">Cost Price</th>
              <th scope="col">Selling Price</th>
              <th scope="col">Stock Quantity</th>
              <th scope="col">Low Stock Threshold</th>
              <th scope="col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <TableStatusRow
                colSpan={9}
                emptyText="No products available yet."
                loadingText="Loading products..."
                state="loading"
              />
            ) : products.length === 0 ? (
              <TableStatusRow
                colSpan={9}
                emptyText="No products available yet."
                loadingText="Loading products..."
                state="empty"
              />
            ) : (
              products.map((product) => (
                <tr key={product.id}>
                  <td>{product.name}</td>
                  <td>{product.categoryName}</td>
                  <td>{product.sku}</td>
                  <td>{product.barcode}</td>
                  <td>{formatPrice(product.costPrice)}</td>
                  <td>{formatPrice(product.sellingPrice)}</td>
                  <td>{product.stockQuantity}</td>
                  <td>{product.lowStockThreshold}</td>
                  <td>
                    <div className="table-actions">
                      <button
                        className="button button-secondary button-sm"
                        onClick={() => onEdit(product)}
                        type="button"
                      >
                        Edit
                      </button>
                      <button
                        className="button button-danger button-sm"
                        onClick={() => onDelete(product)}
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

export default ProductTable
