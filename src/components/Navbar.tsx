import { LogOut, Menu, Moon, ShieldCheck, Sun, UserCircle2 } from 'lucide-react'
import { useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

type NavbarProps = {
  onToggleSidebar: () => void
  onToggleTheme: () => void
  theme: 'light' | 'dark'
}

const routeMeta: Record<string, { title: string; subtitle: string }> = {
  '/dashboard': {
    title: 'Dashboard',
    subtitle: 'Monitor inventory performance in real time',
  },
  '/products': {
    title: 'Products',
    subtitle: 'Manage product catalog, pricing, and stock',
  },
  '/categories': {
    title: 'Categories',
    subtitle: 'Organize the product taxonomy',
  },
  '/suppliers': {
    title: 'Suppliers',
    subtitle: 'Maintain supplier contacts and vendor details',
  },
  '/customers': {
    title: 'Customers',
    subtitle: 'Keep customer profiles up to date',
  },
  '/customer-store': {
    title: 'Customer Store',
    subtitle: 'Create customer carts and checkout sales',
  },
  '/purchases': {
    title: 'Purchases',
    subtitle: 'Track incoming stock and vendor transactions',
  },
  '/sales': {
    title: 'Sales',
    subtitle: 'Create invoices and monitor outgoing stock',
  },
}

function Navbar({ onToggleSidebar, onToggleTheme, theme }: NavbarProps) {
  const { logout, user } = useAuth()
  const location = useLocation()

  const meta = useMemo(
    () => routeMeta[location.pathname] ?? routeMeta['/dashboard'],
    [location.pathname],
  )

  const dateLabel = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'short',
    day: '2-digit',
  }).format(new Date())

  return (
    <header className="navbar">
      <div className="navbar-main">
        <button
          aria-label="Toggle navigation"
          className="icon-button navbar-menu-button"
          onClick={onToggleSidebar}
          type="button"
        >
          <Menu size={18} />
        </button>

        <div>
          <p className="navbar-subtitle">{meta.subtitle}</p>
          <h1>{meta.title}</h1>
        </div>
      </div>

      <div className="navbar-meta">
        <span className="navbar-date">{dateLabel}</span>
        <span className="navbar-pill">
          <ShieldCheck size={16} />
          Operational
        </span>
        <button
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          className="button button-ghost navbar-theme-toggle"
          onClick={onToggleTheme}
          type="button"
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          {theme === 'dark' ? 'Light' : 'Dark'}
        </button>
        {user ? (
          <span className="navbar-user-pill">
            <UserCircle2 size={16} />
            {user.username} · {user.role}
          </span>
        ) : null}
        <button className="button button-ghost navbar-logout" onClick={logout} type="button">
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </header>
  )
}

export default Navbar
