import { useEffect, useCallback, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ChevronRight, ChevronLeft, SlidersHorizontal, X } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { fetchProducts, setFilters, setPage, resetFilters } from '@/features/products/model/productsSlice'
import { fetchCategories } from '@/features/categories/model/categoriesSlice'
import { ProductCard } from '@/entities/product-card'
import { NetworkError } from '@/shared/ui/network-error'
import { EmptyState } from '@/shared/ui/empty-state'
import { Header } from '@/widgets/header'
import { Footer } from '@/widgets/footer'

function ProductSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-[280px] rounded-[4px] bg-muted" />
      <div className="mt-3 h-4 w-3/4 rounded bg-muted" />
      <div className="mt-2 h-3 w-1/2 rounded bg-muted" />
    </div>
  )
}

export default function ProductsPage() {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const [searchParams, setSearchParams] = useSearchParams()
  const { list, listStatus, filters, pagination } = useAppSelector((s) => s.products)
  const { items: categories } = useAppSelector((s) => s.categories)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')

  const categoryId = searchParams.get('categoryId') ? Number(searchParams.get('categoryId')) : undefined
  const productName = searchParams.get('q') ?? ''

  useEffect(() => {
    dispatch(fetchCategories())
  }, [dispatch])

  useEffect(() => {
    const params = {
      ...filters,
      categoryId,
      productName: productName || undefined,
    }
    dispatch(fetchProducts(params))
  }, [dispatch, filters, categoryId, productName])

  const handleCategoryClick = useCallback((id: number | undefined) => {
    const next = new URLSearchParams(searchParams)
    if (id) next.set('categoryId', String(id))
    else next.delete('categoryId')
    setSearchParams(next)
    dispatch(setPage(1))
    setSidebarOpen(false)
  }, [dispatch, searchParams, setSearchParams])

  const handlePriceFilter = () => {
    dispatch(setFilters({
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
    }))
    dispatch(fetchProducts({
      ...filters,
      categoryId,
      productName: productName || undefined,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
    }))
  }

  const handleClearFilters = () => {
    setMinPrice('')
    setMaxPrice('')
    dispatch(resetFilters())
    const next = new URLSearchParams()
    setSearchParams(next)
  }

  const hasActiveFilters = !!categoryId || !!productName || !!minPrice || !!maxPrice

  const pages = Array.from({ length: pagination.totalPage }, (_, i) => i + 1)
  const safeList = Array.isArray(list) ? list : []

  const Sidebar = (
    <aside className="w-full lg:w-[220px] lg:shrink-0">
      {/* Categories */}
      <div className="pb-6">
        <h3 className="mb-4 text-sm font-semibold text-foreground">{t('products.all_categories')}</h3>
        <ul className="space-y-2.5">
          <li>
            <button
              onClick={() => handleCategoryClick(undefined)}
              className={`flex w-full items-center justify-between text-sm transition-colors hover:text-[#DB4444] ${
                !categoryId ? 'font-semibold text-[#DB4444]' : 'text-foreground'
              }`}
            >
              {t('products.all_categories')}
              <ChevronRight className="h-3.5 w-3.5 shrink-0" />
            </button>
          </li>
          {categories.map((cat) => (
            <li key={cat.id}>
              <button
                onClick={() => handleCategoryClick(cat.id)}
                className={`flex w-full items-center justify-between text-sm transition-colors hover:text-[#DB4444] ${
                  categoryId === cat.id ? 'font-semibold text-[#DB4444]' : 'text-foreground'
                }`}
              >
                {cat.categoryName}
                <ChevronRight className="h-3.5 w-3.5 shrink-0" />
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="h-px bg-border" />

      {/* Price filter */}
      <div className="py-6">
        <h3 className="mb-4 text-sm font-semibold text-foreground">Price Range</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <input
              type="number"
              placeholder="Min"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="w-full rounded-[4px] border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-[#DB4444] placeholder:text-muted-foreground"
            />
            <span className="text-muted-foreground">—</span>
            <input
              type="number"
              placeholder="Max"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-full rounded-[4px] border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-[#DB4444] placeholder:text-muted-foreground"
            />
          </div>
          <button
            onClick={handlePriceFilter}
            className="w-full rounded-[4px] bg-[#DB4444] py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            Apply
          </button>
        </div>
      </div>

      {hasActiveFilters && (
        <>
          <div className="h-px bg-border" />
          <div className="pt-4">
            <button
              onClick={handleClearFilters}
              className="flex w-full items-center gap-2 text-sm text-muted-foreground hover:text-[#DB4444] transition-colors"
            >
              <X className="h-4 w-4" />
              Clear all filters
            </button>
          </div>
        </>
      )}
    </aside>
  )

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />

      <main className="mx-auto w-full max-w-[1280px] flex-1 px-4 py-8 xl:px-0">
        {/* Breadcrumb */}
        <nav className="mb-8 flex items-center gap-2 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-[#DB4444] transition-colors">{t('nav.home')}</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-foreground">{t('products.title')}</span>
          {productName && (
            <>
              <ChevronRight className="h-3.5 w-3.5" />
              <span className="text-foreground">&ldquo;{productName}&rdquo;</span>
            </>
          )}
        </nav>

        <div className="flex gap-8">
          {/* Desktop sidebar */}
          <div className="hidden lg:block">{Sidebar}</div>

          {/* ── Products grid ── */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                {/* Mobile filter toggle */}
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="flex items-center gap-2 rounded-[4px] border border-border px-3 py-1.5 text-sm text-foreground hover:border-[#DB4444] hover:text-[#DB4444] transition-colors lg:hidden"
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  {t('products.filter')}
                </button>
                <span className="text-sm text-muted-foreground">
                  {pagination.totalRecord} {t('products.title').toLowerCase()}
                </span>
                {hasActiveFilters && (
                  <button
                    onClick={handleClearFilters}
                    className="hidden items-center gap-1 text-xs text-muted-foreground hover:text-[#DB4444] transition-colors lg:flex"
                  >
                    <X className="h-3 w-3" />
                    Clear
                  </button>
                )}
              </div>
            </div>

            {listStatus === 'loading' && (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
                {Array.from({ length: 8 }).map((_, i) => <ProductSkeleton key={i} />)}
              </div>
            )}

            {listStatus === 'error' && (
              <NetworkError
                onRetry={() => dispatch(fetchProducts({ ...filters, categoryId, productName: productName || undefined }))}
              />
            )}

            {listStatus === 'success' && safeList.length === 0 && (
              <EmptyState
                title={t('products.no_results')}
                description={t('products.no_results_desc')}
                action={{ label: t('products.all_categories'), onClick: () => handleCategoryClick(undefined) }}
              />
            )}

            {listStatus === 'success' && safeList.length > 0 && (
              <>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
                  {safeList.map((p) => <ProductCard key={p.id} product={p} />)}
                </div>

                {pagination.totalPage > 1 && (
                  <div className="mt-10 flex items-center justify-center gap-2">
                    <button
                      onClick={() => dispatch(setPage(Math.max(1, pagination.pageNumber - 1)))}
                      disabled={pagination.pageNumber === 1}
                      className="flex h-9 w-9 items-center justify-center rounded-[4px] border border-border text-foreground hover:border-[#DB4444] hover:text-[#DB4444] disabled:opacity-40 transition-colors"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    {pages.slice(
                      Math.max(0, pagination.pageNumber - 3),
                      Math.min(pages.length, pagination.pageNumber + 2)
                    ).map((page) => (
                      <button
                        key={page}
                        onClick={() => dispatch(setPage(page))}
                        className={`flex h-9 w-9 items-center justify-center rounded-[4px] text-sm font-medium transition-colors ${
                          page === pagination.pageNumber
                            ? 'bg-[#DB4444] text-white'
                            : 'border border-border text-foreground hover:border-[#DB4444] hover:text-[#DB4444]'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                    <button
                      onClick={() => dispatch(setPage(Math.min(pagination.totalPage, pagination.pageNumber + 1)))}
                      disabled={pagination.pageNumber === pagination.totalPage}
                      className="flex h-9 w-9 items-center justify-center rounded-[4px] border border-border text-foreground hover:border-[#DB4444] hover:text-[#DB4444] disabled:opacity-40 transition-colors"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>

      <Footer />

      {/* Mobile sidebar drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <div className="relative z-10 flex h-full w-72 flex-col overflow-y-auto bg-background p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-semibold text-foreground">{t('products.filter')}</h2>
              <button onClick={() => setSidebarOpen(false)} className="p-1 text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>
            {Sidebar}
          </div>
        </div>
      )}
    </div>
  )
}
