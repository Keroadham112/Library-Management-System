import {
  Boxes,
  ChartColumn,
  FolderTree,
  HandCoins,
  LayoutDashboard,
  Store,
  ShoppingBasket,
  Users,
  UsersRound,
  X,
} from 'lucide-react'
import { NavLink } from 'react-router-dom'
import type { NavigationItem } from '../types/navigation'

const navigationItems: NavigationItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Products', path: '/products', icon: Boxes },
  { label: 'Categories', path: '/categories', icon: FolderTree },
  { label: 'Suppliers', path: '/suppliers', icon: UsersRound },
  { label: 'Customers', path: '/customers', icon: Users },
  { label: 'Customer Store', path: '/store', icon: Store },
  { label: 'Purchases', path: '/purchases', icon: ShoppingBasket },
  { label: 'Sales', path: '/sales', icon: HandCoins },
]

type SidebarProps = {
  isOpen: boolean
  onClose: () => void
}

function Sidebar({ isOpen, onClose }: SidebarProps) {
  return (
    <>
      <button
        aria-label="Close navigation"
        className={`sidebar-overlay ${isOpen ? 'visible' : ''}`}
        onClick={onClose}
        type="button"
      />

      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-brand-wrap">
          <div className="sidebar-brand-mark">
            <ChartColumn size={20} />
          </div>
          <div>
            <div className="sidebar-brand">Inventory System</div>
            <p className="sidebar-caption">Management Console</p>
          </div>

          <button
            aria-label="Close sidebar"
            className="icon-button sidebar-close"
            onClick={onClose}
            type="button"
          >
            <X size={16} />
          </button>
        </div>

      <nav className="sidebar-nav" aria-label="Main navigation">
        {navigationItems.map((item) => (
          <NavLink
            aria-label={item.label}
            className={({ isActive }) =>
              isActive ? 'sidebar-link active' : 'sidebar-link'
            }
            key={item.path}
            onClick={(event) => {
              onClose()

              if (item.label === 'Customer Store') {
                event.preventDefault()
                window.open(
                  new URL(item.path, window.location.origin).toString(),
                  '_blank',
                  'noopener,noreferrer',
                )
              }
            }}
            to={item.path}
          >
            <item.icon className="sidebar-link-icon" size={18} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
      </aside>
    </>
  )
}

export default Sidebar
