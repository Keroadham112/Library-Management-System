import { ArrowRight, Moon, ShoppingBag, Store, Sun } from 'lucide-react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import { useStorefrontCart } from '../context/StorefrontCartContext'
import { useTheme } from '../context/ThemeContext'

function StorefrontLayout() {
  const { itemCount } = useStorefrontCart()
  const { theme, toggleTheme } = useTheme()

  return (
    <div className="storefront-shell">
      <header className="storefront-header">
        <Link className="storefront-brand" to="/store">
          <span className="storefront-brand-mark">
            <Store size={19} />
          </span>
          <span>Northstar Market</span>
        </Link>
        <nav className="storefront-nav" aria-label="Storefront navigation">
          <NavLink end to="/store">
            Home
          </NavLink>
          <NavLink to="/store/products">Shop</NavLink>
        </nav>
        <div className="storefront-header-actions">
          <button
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            className="storefront-theme-toggle"
            onClick={toggleTheme}
            type="button"
          >
            {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
            <span>{theme === 'dark' ? 'Light mode' : 'Dark mode'}</span>
          </button>
          <Link className="storefront-admin-link" to="/login">
            Admin portal <ArrowRight size={15} />
          </Link>
          <Link className="storefront-cart-link" to="/store/cart">
            <ShoppingBag size={19} />
            <span>Cart</span>
            {itemCount > 0 ? <b>{itemCount}</b> : null}
          </Link>
        </div>
      </header>
      <main className="storefront-main">
        <Outlet />
      </main>
      <footer className="storefront-footer">
        <span>Northstar Market</span>
        <span>Thoughtfully stocked for everyday life.</span>
      </footer>
    </div>
  )
}

export default StorefrontLayout