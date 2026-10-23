import { useEffect, useState } from 'react'
import {
  AlertTriangle,
  Boxes,
  CircleDollarSign,
  FolderTree,
  PackageCheck,
  ShoppingCart,
  Users,
} from 'lucide-react'
import { getDashboardSummary, type DashboardStats } from '../services/dashboardService'

const statCards = [
  { key: 'totalProducts', label: 'Total Products', icon: Boxes },
  { key: 'totalCategories', label: 'Total Categories', icon: FolderTree },
  { key: 'totalInventoryQuantity', label: 'Total Inventory Quantity', icon: PackageCheck },
  { key: 'totalCustomers', label: 'Total Customers', icon: Users },
  { key: 'totalInventoryCostValue', label: 'Inventory Cost Value', icon: CircleDollarSign },
  { key: 'totalInventorySellingValue', label: 'Inventory Selling Value', icon: ShoppingCart },
  { key: 'lowStockCount', label: 'Low Stock Count', icon: AlertTriangle },
] as const

const numberFormatter = new Intl.NumberFormat('EG', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

function formatValue(key: keyof DashboardStats, value: number) {
  if (key === 'totalInventoryCostValue' || key === 'totalInventorySellingValue') {
    return `${numberFormatter.format(value)} EGP`
  }

  return new Intl.NumberFormat('en-US').format(value)
}

function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    async function loadDashboard() {
      try {
        setIsLoading(true)
        setError(null)
        const summary = await getDashboardSummary()

        if (isMounted) {
          setStats(summary)
        }
      } catch {
        if (isMounted) {
          setError('Unable to load dashboard data.')
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadDashboard()

    return () => {
      isMounted = false
    }
  }, [])

  return (
    <section className="dashboard-page">
      <div className="dashboard-hero">
        <div>
          <p className="dashboard-eyebrow">Overview</p>
          <h2>Inventory Dashboard</h2>
          <p className="dashboard-copy">
            Live summary metrics from the ASP.NET Core backend.
          </p>
        </div>
        <div className="dashboard-badge">React 19 + TypeScript</div>
      </div>

      {isLoading ? (
        <div className="dashboard-grid" aria-label="Loading dashboard statistics">
          {statCards.map((card) => (
            <article className="stat-card" key={card.key}>
              <div className="loading-shimmer loading-block" style={{ marginBottom: '14px', width: '56%' }} />
              <div className="loading-shimmer loading-block-lg" style={{ width: '44%' }} />
            </article>
          ))}
        </div>
      ) : error ? (
        <div className="dashboard-state dashboard-state-error">{error}</div>
      ) : (
        <div className="dashboard-grid" aria-label="Dashboard statistics">
          {statCards.map((card) => (
            <article className="stat-card" key={card.key}>
              <span className="stat-card-icon">
                <card.icon size={16} />
              </span>
              <span className="stat-card-label">{card.label}</span>
              <strong className="stat-card-value">
                {formatValue(card.key, stats?.[card.key] ?? 0)}
              </strong>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}

export default Dashboard
