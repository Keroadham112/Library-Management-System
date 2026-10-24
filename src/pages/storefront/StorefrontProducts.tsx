import { Search, SlidersHorizontal } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import StorefrontProductCard from '../../components/storefront/StorefrontProductCard'
import { getCategories } from '../../services/categoryService'
import { getProducts } from '../../services/productService'
import type { Category } from '../../types/category'
import type { Product } from '../../types/product'

function StorefrontProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [search, setSearch] = useState('')
  const [searchParams, setSearchParams] = useSearchParams()
  const [categoryId, setCategoryId] = useState(searchParams.get('category') ?? '')
  const [sort, setSort] = useState('featured')
  const [page, setPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([getProducts(1, 100), getCategories()])
      .then(([productResponse, categoryResponse]) => {
        setProducts(productResponse.items)
        setCategories(categoryResponse)
      })
      .catch(() => setError('Unable to load the collection right now.'))
      .finally(() => setIsLoading(false))
  }, [])

  const normalizedSearch = search.trim().toLowerCase()
  const visibleProducts = products.filter((product) => {
    const matchesSearch = !normalizedSearch ||
      [product.name, product.sku, product.barcode, product.categoryName]
        .some((value) => value.toLowerCase().includes(normalizedSearch))
    const matchesCategory = !categoryId || product.categoryId === Number(categoryId)
    return matchesSearch && matchesCategory
  })

  const sortedProducts = [...visibleProducts].sort((first, second) => {
    if (sort === 'price-low') return first.sellingPrice - second.sellingPrice
    if (sort === 'price-high') return second.sellingPrice - first.sellingPrice
    if (sort === 'name') return first.name.localeCompare(second.name)
    return first.id - second.id
  })
  const pageSize = 12
  const totalPages = Math.max(1, Math.ceil(sortedProducts.length / pageSize))
  const pagedProducts = sortedProducts.slice((page - 1) * pageSize, page * pageSize)

  useEffect(() => {
    setPage(1)
  }, [search, categoryId, sort])

  function handleCategoryChange(value: string) {
    setCategoryId(value)
    if (value) {
      setSearchParams({ category: value })
    } else {
      setSearchParams({})
    }
  }

  return (
    <section className="storefront-section storefront-catalog-page">
      <div className="storefront-section-heading storefront-catalog-heading">
        <div>
          <span className="storefront-eyebrow">The collection</span>
          <h1>Find your next favorite thing.</h1>
          <p>Browse the live inventory catalog and add what catches your eye.</p>
        </div>
        <span className="storefront-catalog-count">{sortedProducts.length} products</span>
      </div>

      <div className="storefront-filter-bar">
        <label className="storefront-search-field">
          <Search size={18} />
          <span className="sr-only">Search products</span>
          <input
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by name, SKU, barcode..."
            value={search}
          />
        </label>
        <label className="storefront-category-field">
          <SlidersHorizontal size={17} />
          <span className="sr-only">Filter by category</span>
          <select onChange={(event) => handleCategoryChange(event.target.value)} value={categoryId}>
            <option value="">All categories</option>
            {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
          </select>
        </label>
        <label className="storefront-sort-field">
          <span className="sr-only">Sort products</span>
          <select onChange={(event) => setSort(event.target.value)} value={sort}>
            <option value="featured">Featured</option>
            <option value="name">Name</option>
            <option value="price-low">Price: low to high</option>
            <option value="price-high">Price: high to low</option>
          </select>
        </label>
      </div>

      {isLoading ? <div className="storefront-state">Loading the collection...</div> : null}
      {error ? <div className="storefront-state storefront-state-error">{error}</div> : null}
      {!isLoading && !error && sortedProducts.length === 0 ? (
        <div className="storefront-state">No products match that search.</div>
      ) : null}
      {!isLoading && !error && sortedProducts.length > 0 ? (
        <div className="storefront-product-grid storefront-product-grid-wide">
          {pagedProducts.map((product) => <StorefrontProductCard key={product.id} product={product} />)}
        </div>
      ) : null}
      {!isLoading && !error && sortedProducts.length > 0 && totalPages > 1 ? (
        <div className="storefront-pagination">
          <button className="button button-secondary" disabled={page === 1} onClick={() => setPage((current) => current - 1)} type="button">Previous</button>
          <span>Page {page} of {totalPages}</span>
          <button className="button button-secondary" disabled={page === totalPages} onClick={() => setPage((current) => current + 1)} type="button">Next</button>
        </div>
      ) : null}
    </section>
  )
}

export default StorefrontProducts