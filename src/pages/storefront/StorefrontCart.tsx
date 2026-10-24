import { ArrowLeft, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useStorefrontCart } from '../../context/StorefrontCartContext'
import { formatStorefrontPrice, getStorefrontProductImage } from '../../utils/storefront'

function StorefrontCart() {
  const { items, subtotal, addItem, decreaseItem, removeItem } = useStorefrontCart()

  if (items.length === 0) {
    return (
      <section className="storefront-empty-cart">
        <span className="storefront-empty-cart-icon"><ShoppingBag size={28} /></span>
        <span className="storefront-eyebrow">Your bag</span>
        <h1>Nothing here yet.</h1>
        <p>Take a look around and bring something useful home.</p>
        <Link className="button button-primary" to="/store/products">Browse the collection</Link>
      </section>
    )
  }

  return (
    <section className="storefront-cart-page">
      <div className="storefront-section-heading">
        <div>
          <span className="storefront-eyebrow">Your bag</span>
          <h1>Ready when you are.</h1>
          <p>Review your selected products before checkout.</p>
        </div>
        <Link className="storefront-back-link" to="/store/products"><ArrowLeft size={16} /> Continue shopping</Link>
      </div>
      <div className="storefront-cart-layout">
        <div className="storefront-cart-list">
          {items.map((item) => (
            <article className="storefront-cart-item" key={item.product.id}>
              <img alt={item.product.name} src={getStorefrontProductImage(item.product)} />
              <div className="storefront-cart-item-copy">
                <span className="storefront-product-category">{item.product.categoryName}</span>
                <Link to={`/store/products/${item.product.id}`}>{item.product.name}</Link>
                <strong>{formatStorefrontPrice(item.product.sellingPrice)}</strong>
              </div>
              <div className="storefront-cart-item-actions">
                <div className="storefront-quantity-control">
                  <button aria-label={`Decrease ${item.product.name}`} onClick={() => decreaseItem(item.product.id)} type="button"><Minus size={15} /></button>
                  <strong>{item.quantity}</strong>
                  <button aria-label={`Increase ${item.product.name}`} disabled={item.quantity >= item.product.stockQuantity} onClick={() => addItem(item.product)} type="button"><Plus size={15} /></button>
                </div>
                <button aria-label={`Remove ${item.product.name}`} className="storefront-remove-button" onClick={() => removeItem(item.product.id)} type="button"><Trash2 size={16} /></button>
              </div>
            </article>
          ))}
        </div>
        <aside className="storefront-order-summary">
          <span className="storefront-eyebrow">Summary</span>
          <h2>Your selections</h2>
          <div className="storefront-summary-row"><span>Subtotal</span><strong>{formatStorefrontPrice(subtotal)}</strong></div>
          <div className="storefront-summary-row storefront-summary-muted"><span>Delivery</span><span>Calculated at checkout</span></div>
          <div className="storefront-summary-total"><span>Total</span><strong>{formatStorefrontPrice(subtotal)}</strong></div>
          <button className="button button-primary storefront-checkout-button" disabled type="button">Checkout coming soon</button>
          <p className="storefront-summary-note">Your cart is saved in this browser.</p>
        </aside>
      </div>
    </section>
  )
}

export default StorefrontCart