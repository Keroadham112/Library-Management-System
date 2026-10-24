import { ArrowUpRight, ShoppingBag } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useStorefrontCart } from '../../context/StorefrontCartContext'
import type { Product } from '../../types/product'
import { formatStorefrontPrice, getStorefrontProductImage } from '../../utils/storefront'

type StorefrontProductCardProps = {
  product: Product
}

function StorefrontProductCard({ product }: StorefrontProductCardProps) {
  const { addItem, getQuantity } = useStorefrontCart()
  const quantity = getQuantity(product.id)
  const unavailable = product.stockQuantity <= 0
  const atLimit = quantity >= product.stockQuantity

  return (
    <article className="storefront-product-card">
      <Link className="storefront-product-image-link" to={`/store/products/${product.id}`}>
        <img
          alt={product.name}
          className="storefront-product-image"
          loading="lazy"
          onError={(event) => {
            event.currentTarget.onerror = null
            event.currentTarget.src = getStorefrontProductImage({ ...product, imageUrl: null })
          }}
          src={getStorefrontProductImage(product)}
        />
        <span className="storefront-product-arrow" aria-hidden="true">
          <ArrowUpRight size={18} />
        </span>
      </Link>
      <div className="storefront-product-card-body">
        <span className="storefront-product-category">{product.categoryName}</span>
        <Link className="storefront-product-name" to={`/store/products/${product.id}`}>
          {product.name}
        </Link>
        <div className="storefront-product-meta">
          <strong>{formatStorefrontPrice(product.sellingPrice)}</strong>
          <span>{product.stockQuantity} available</span>
        </div>
        <button
          className="button button-primary storefront-add-button"
          disabled={unavailable || atLimit}
          onClick={() => addItem(product)}
          type="button"
        >
          <ShoppingBag size={17} />
          {unavailable ? 'Out of stock' : atLimit ? 'Added to cart' : 'Add to cart'}
        </button>
      </div>
    </article>
  )
}

export default StorefrontProductCard