import { ArrowLeft, Minus, Plus, ShoppingBag } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useStorefrontCart } from '../../context/StorefrontCartContext'
import StorefrontProductCard from '../../components/storefront/StorefrontProductCard'
import { getProduct, getProducts } from '../../services/productService'
import type { Product } from '../../types/product'
import { formatStorefrontPrice, getStorefrontProductImage } from '../../utils/storefront'

function StorefrontProductDetails() {
  const { id } = useParams()
  const { addItem, decreaseItem, getQuantity } = useStorefrontCart()
  const [product, setProduct] = useState<Product | null>(null)
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const productId = Number(id)
    if (!Number.isInteger(productId)) {
      setError('That product could not be found.')
      setIsLoading(false)
      return
    }

    Promise.all([getProduct(productId), getProducts(1, 100)])
      .then(([selectedProduct, productResponse]) => {
        setProduct(selectedProduct)
        setRelatedProducts(productResponse.items.filter((item) => item.id !== selectedProduct.id && item.categoryId === selectedProduct.categoryId).slice(0, 4))
      })
      .catch(() => setError('That product could not be found.'))
      .finally(() => setIsLoading(false))
  }, [id])

  if (isLoading) return <div className="storefront-state">Loading product...</div>
  if (error || !product) {
    return <div className="storefront-state storefront-state-error">{error ?? 'Product not found.'}</div>
  }

  const quantity = getQuantity(product.id)

  return (
    <section className="storefront-detail-page">
      <Link className="storefront-back-link" to="/store/products"><ArrowLeft size={16} /> Back to collection</Link>
      <div className="storefront-detail-grid">
        <div className="storefront-detail-image-wrap">
          <img
            alt={product.name}
            className="storefront-detail-image"
            onError={(event) => {
              event.currentTarget.onerror = null
              event.currentTarget.src = getStorefrontProductImage({ ...product, imageUrl: null })
            }}
            src={getStorefrontProductImage(product)}
          />
        </div>
        <div className="storefront-detail-copy">
          <span className="storefront-product-category">{product.categoryName}</span>
          <h1>{product.name}</h1>
          <strong className="storefront-detail-price">{formatStorefrontPrice(product.sellingPrice)}</strong>
          <p className="storefront-detail-description">
            {product.description ?? 'A carefully selected addition to the Northstar collection, available while current stock lasts.'}
          </p>
          <div className="storefront-detail-facts">
            <span>SKU <b>{product.sku}</b></span>
            <span>Availability <b>{product.stockQuantity > 0 ? `${product.stockQuantity} in stock` : 'Out of stock'}</b></span>
          </div>
          <div className="storefront-detail-actions">
            <div className="storefront-quantity-control">
              <button aria-label="Decrease quantity" disabled={quantity === 0} onClick={() => decreaseItem(product.id)} type="button"><Minus size={16} /></button>
              <strong>{quantity}</strong>
              <button aria-label="Increase quantity" disabled={quantity >= product.stockQuantity} onClick={() => addItem(product)} type="button"><Plus size={16} /></button>
            </div>
            <button className="button button-primary storefront-detail-add" disabled={product.stockQuantity === 0 || quantity >= product.stockQuantity} onClick={() => addItem(product)} type="button">
              <ShoppingBag size={18} /> Add to cart
            </button>
          </div>
        </div>
      </div>
      {relatedProducts.length > 0 ? (
        <section className="storefront-section storefront-related-section">
          <div className="storefront-section-heading">
            <div><span className="storefront-eyebrow">You may also like</span><h2>More from {product.categoryName}</h2></div>
          </div>
          <div className="storefront-product-grid">{relatedProducts.map((relatedProduct) => <StorefrontProductCard key={relatedProduct.id} product={relatedProduct} />)}</div>
        </section>
      ) : null}
    </section>
  )
}

export default StorefrontProductDetails