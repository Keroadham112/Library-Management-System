import { ArrowRight, Check, ShieldCheck, Sparkles } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import StorefrontProductCard from '../../components/storefront/StorefrontProductCard'
import { getCategories } from '../../services/categoryService'
import { getProducts } from '../../services/productService'
import { apiOrigin } from '../../services/api'
import type { Category } from '../../types/category'
import type { Product } from '../../types/product'

const categoryImages: Record<string, string> = {
  'Headphones & Audio': `${apiOrigin}/images/products/category-headphones-audio.jpg`,
  'Smartwatches & Wearables': `${apiOrigin}/images/products/category-smartwatch.jpg`,
  'Computer Accessories': `${apiOrigin}/images/products/category-computer-accessories.jpg`,
  'Chargers & Power Banks': `${apiOrigin}/images/products/category-chargers-power-banks.jpg`,
  'Cables & Connectivity': `${apiOrigin}/images/products/category-cables-connectivity.jpg`,
  'Speakers & Home Electronics': `${apiOrigin}/images/products/category-speakers-home-electronics.jpg`,
}

const fallbackCategoryImage = `${apiOrigin}/images/products/fallback-product.jpg`

function StorefrontHome() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([getProducts(1, 100), getCategories()])
      .then(([response, categoryResponse]) => {
        setProducts(response.items)
        setCategories(categoryResponse)
      })
      .catch(() => setError('Unable to load the storefront right now.'))
      .finally(() => setIsLoading(false))
  }, [])

  const featuredProducts = products.slice(0, 4)
  const popularAccessories = products.filter((product) =>
    product.categoryName.toLowerCase().includes('accessor'),
  ).slice(0, 4)
  const recentlyAdded = [...products]
    .sort((first, second) => second.createdAt.localeCompare(first.createdAt))
    .slice(0, 4)

  return (
    <>
      <section className="storefront-hero">
        <div className="storefront-hero-copy">
          <span className="storefront-eyebrow">
            <Sparkles size={15} /> Curated essentials, ready when you are
          </span>
          <h1>Good things, chosen with intention.</h1>
          <p>
            Discover dependable tech, useful everyday tools, and small upgrades that make a
            difference.
          </p>
          <Link className="button button-primary storefront-hero-button" to="/store/products">
            Explore the collection <ArrowRight size={18} />
          </Link>
        </div>
        <div className="storefront-hero-art" aria-label="Featured products">
          <div className="storefront-orbit storefront-orbit-one" />
          <div className="storefront-orbit storefront-orbit-two" />
          <img
            alt="A modern watch on a neutral surface"
            onError={(event) => {
              event.currentTarget.onerror = null
              event.currentTarget.src = fallbackCategoryImage
            }}
            src={`${apiOrigin}/images/products/category-smartwatch.jpg`}
          />
          <span className="storefront-art-note">Everyday objects, elevated.</span>
        </div>
      </section>

      <section className="storefront-value-strip" aria-label="Store benefits">
        <span><Check size={17} /> Carefully selected products</span>
        <span><ShieldCheck size={17} /> Secure, transparent shopping</span>
        <span><Sparkles size={17} /> Stock you can trust</span>
      </section>

      <section className="storefront-section storefront-category-section">
        <div className="storefront-section-heading">
          <div>
            <span className="storefront-eyebrow">Browse by mood</span>
            <h2>Find your corner of the market</h2>
          </div>
          <Link className="storefront-text-link" to="/store/products">All products <ArrowRight size={16} /></Link>
        </div>
        {error ? <div className="storefront-state storefront-state-error">{error}</div> : null}
        {!error && categories.length === 0 && !isLoading ? (
          <div className="storefront-state">Categories are being refreshed.</div>
        ) : (
          <div className="storefront-category-grid">
            {categories.map((category) => (
              <Link className="storefront-category-card" key={category.id} to={`/store/products?category=${category.id}`}>
                <img
                  alt=""
                  onError={(event) => {
                    event.currentTarget.onerror = null
                    event.currentTarget.src = fallbackCategoryImage
                  }}
                  src={categoryImages[category.name] ?? fallbackCategoryImage}
                />
                <span>{category.name}</span>
                <ArrowRight size={17} />
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="storefront-section">
        <div className="storefront-section-heading">
          <div>
            <span className="storefront-eyebrow">The edit</span>
            <h2>Shop the latest picks</h2>
          </div>
          <Link className="storefront-text-link" to="/store/products">
            View all <ArrowRight size={16} />
          </Link>
        </div>
        {isLoading ? (
          <div className="storefront-state">Loading the collection...</div>
        ) : error ? (
          <div className="storefront-state storefront-state-error">{error}</div>
        ) : featuredProducts.length === 0 ? (
          <div className="storefront-state">The collection is being refreshed. Check back soon.</div>
        ) : (
          <div className="storefront-product-grid">
            {featuredProducts.map((product) => <StorefrontProductCard key={product.id} product={product} />)}
          </div>
        )}
      </section>

      <section className="storefront-promo-banner">
        <div>
          <span className="storefront-eyebrow">A little more room to think</span>
          <h2>Build a calmer desk setup.</h2>
          <p>Explore practical accessories for a cleaner, more capable everyday workspace.</p>
        </div>
        <Link className="button button-primary" to="/store/products">Shop accessories <ArrowRight size={17} /></Link>
      </section>

      {popularAccessories.length > 0 ? (
        <section className="storefront-section">
          <div className="storefront-section-heading">
            <div><span className="storefront-eyebrow">Useful by design</span><h2>Popular accessories</h2></div>
            <Link className="storefront-text-link" to="/store/products">Shop all <ArrowRight size={16} /></Link>
          </div>
          <div className="storefront-product-grid">{popularAccessories.map((product) => <StorefrontProductCard key={product.id} product={product} />)}</div>
        </section>
      ) : null}

      {recentlyAdded.length > 0 ? (
        <section className="storefront-section">
          <div className="storefront-section-heading">
            <div><span className="storefront-eyebrow">Just in</span><h2>Recently added</h2></div>
          </div>
          <div className="storefront-product-grid">{recentlyAdded.map((product) => <StorefrontProductCard key={product.id} product={product} />)}</div>
        </section>
      ) : null}
    </>
  )
}

export default StorefrontHome