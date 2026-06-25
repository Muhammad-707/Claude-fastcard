import { useEffect, useCallback, useState, useMemo } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  ChevronRight, ChevronLeft, SlidersHorizontal, X,
  ChevronDown, ChevronUp,
} from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { fetchProducts, setFilters, setPage, resetFilters } from '@/features/products/model/productsSlice'
import { fetchCategories } from '@/features/categories/model/categoriesSlice'
import { ProductCard } from '@/entities/product-card'
import { NetworkError } from '@/shared/ui/network-error'
import { EmptyState } from '@/shared/ui/empty-state'
import { Header } from '@/widgets/header'
import { Footer } from '@/widgets/footer'

/* ─── Constants ─── */
const BRANDS   = ['Samsung', 'Apple', 'Huawei', 'Poco', 'Lenovo', 'Sony', 'Dell', 'HP']
const FEATURES = ['Metallic', 'Plastic cover', '8GB Ram', 'Super power', 'Large Memory', 'Waterproof']
const CONDITIONS = [
  { value: 'any',         label: 'Any' },
  { value: 'brand-new',   label: 'Brand new' },
  { value: 'refurbished', label: 'Refurbished' },
  { value: 'old',         label: 'Old items' },
]
const SORT_OPTIONS = [
  { value: 'popularity', label: 'Popularity' },
  { value: 'price-asc',  label: 'Price: Low → High' },
  { value: 'price-desc', label: 'Price: High → Low' },
  { value: 'newest',     label: 'Newest first' },
]
const INITIAL_BRAND_COUNT   = 5
const INITIAL_FEATURE_COUNT = 5

/* ─── Sub-components ─── */
function ProductSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-[250px] rounded-[4px] bg-muted" />
      <div className="mt-3 h-4 w-3/4 rounded bg-muted" />
      <div className="mt-2 h-3 w-1/2 rounded bg-muted" />
    </div>
  )
}

function StarRow({ count }: { count: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <svg key={s} viewBox="0 0 16 16"
          fill={s <= count ? '#FFAD33' : 'none'}
          stroke="#FFAD33" strokeWidth="0.5"
          className="h-4 w-4"
        >
          <path d="M8 1l1.8 3.6L14 5.3l-3 2.9.7 4.1L8 10.3l-3.7 1.9.7-4.1-3-2.9 4.2-.6z" />
        </svg>
      ))}
      <span className="ml-1 text-sm text-muted-foreground">& up</span>
    </div>
  )
}

interface FilterSectionProps {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
}
function FilterSection({ title, children, defaultOpen = true }: FilterSectionProps) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border-b border-border py-5 last:border-0">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between"
      >
        <span className="text-base font-semibold text-foreground">{title}</span>
        {open
          ? <ChevronUp className="h-4 w-4 text-muted-foreground" />
          : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
      </button>
      {open && <div className="mt-4">{children}</div>}
    </div>
  )
}

/* ════════════════════════════════════════════ */
export default function ProductsPage() {
/* ════════════════════════════════════════════ */
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const [searchParams, setSearchParams] = useSearchParams()

  const { list, listStatus, filters, pagination } = useAppSelector((s) => s.products)
  const { items: categories } = useAppSelector((s) => s.categories)

  /* ── URL-driven filters ── */
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [minPrice, setMinPrice]       = useState('')
  const [maxPrice, setMaxPrice]       = useState('')

  /* ── Mock / client-side filters ── */
  const [selectedBrands,   setSelectedBrands]   = useState<string[]>([])
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([])
  const [condition,        setCondition]         = useState('any')
  const [selectedRating,   setSelectedRating]    = useState<number | null>(null)
  const [showAllBrands,    setShowAllBrands]     = useState(false)
  const [showAllFeatures,  setShowAllFeatures]   = useState(false)

  /* ── Sort ── */
  const [sortBy, setSortBy] = useState('popularity')

  const categoryId    = searchParams.get('categoryId')    ? Number(searchParams.get('categoryId'))    : undefined
  const subcategoryId = searchParams.get('subcategoryId') ? Number(searchParams.get('subcategoryId')) : undefined
  const productName   = searchParams.get('q') ?? ''

  const activeCategory = categories.find((c) => c.id === categoryId)

  useEffect(() => { dispatch(fetchCategories()) }, [dispatch])

  useEffect(() => {
    dispatch(fetchProducts({ ...filters, categoryId, subcategoryId, productName: productName || undefined }))
  }, [dispatch, filters, categoryId, subcategoryId, productName])

  /* ── Brand / feature / condition / rating as client-side filter on top of API list ── */
  const filteredAndSorted = useMemo(() => {
    const base = Array.isArray(list) ? list : []
    let result = [...base]

    /* brand — uses brandName field from API */
    if (selectedBrands.length > 0) {
      result = result.filter((p) =>
        p.brandName && selectedBrands.some((b) =>
          p.brandName!.toLowerCase().includes(b.toLowerCase())
        )
      )
    }

    /* condition (mock — no condition field in API, so use index parity) */
    if (condition === 'brand-new') {
      result = result.filter((_, i) => i % 3 !== 2)
    } else if (condition === 'refurbished') {
      result = result.filter((_, i) => i % 3 === 1)
    } else if (condition === 'old') {
      result = result.filter((_, i) => i % 3 === 2)
    }

    /* rating (mock — no rating field in API, use id modulo to simulate) */
    if (selectedRating !== null) {
      result = result.filter((p) => ((p.id % 5) + 1) >= selectedRating)
    }

    /* sort */
    if (sortBy === 'price-asc')  result = [...result].sort((a, b) => a.price - b.price)
    if (sortBy === 'price-desc') result = [...result].sort((a, b) => b.price - a.price)
    if (sortBy === 'newest')     result = [...result].reverse()

    return result
  }, [list, selectedBrands, condition, selectedRating, sortBy])

  /* ── Handlers ── */
  const handleCategoryClick = useCallback((id: number | undefined) => {
    const next = new URLSearchParams()
    if (id) next.set('categoryId', String(id))
    if (searchParams.get('q')) next.set('q', searchParams.get('q')!)
    setSearchParams(next)
    dispatch(setPage(1))
    setSidebarOpen(false)
  }, [dispatch, searchParams, setSearchParams])

  const handleSubcategoryClick = useCallback((subId: number) => {
    const next = new URLSearchParams(searchParams)
    next.set('subcategoryId', String(subId))
    setSearchParams(next)
    dispatch(setPage(1))
    setSidebarOpen(false)
  }, [dispatch, searchParams, setSearchParams])

  const handlePriceFilter = () => {
    const newFilters = {
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
    }
    dispatch(setFilters(newFilters))
    dispatch(fetchProducts({ ...filters, ...newFilters, categoryId, subcategoryId, productName: productName || undefined }))
  }

  const handleClearFilters = () => {
    setMinPrice('')
    setMaxPrice('')
    setSelectedBrands([])
    setSelectedFeatures([])
    setCondition('any')
    setSelectedRating(null)
    dispatch(resetFilters())
    setSearchParams(new URLSearchParams())
  }

  const toggleBrand = (b: string) =>
    setSelectedBrands((prev) => prev.includes(b) ? prev.filter((x) => x !== b) : [...prev, b])

  const toggleFeature = (f: string) =>
    setSelectedFeatures((prev) => prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f])

  /* ── Derived ── */
  const activeMockFilters = selectedBrands.length + selectedFeatures.length
    + (condition !== 'any' ? 1 : 0)
    + (selectedRating !== null ? 1 : 0)

  const hasActiveFilters = !!categoryId || !!subcategoryId || !!productName
    || !!minPrice || !!maxPrice || activeMockFilters > 0

  const totalActiveCount = (categoryId ? 1 : 0) + (subcategoryId ? 1 : 0) + (productName ? 1 : 0)
    + (minPrice || maxPrice ? 1 : 0) + activeMockFilters

  const pages  = Array.from({ length: pagination.totalPage }, (_, i) => i + 1)
  const visibleBrands   = showAllBrands   ? BRANDS   : BRANDS.slice(0, INITIAL_BRAND_COUNT)
  const visibleFeatures = showAllFeatures ? FEATURES : FEATURES.slice(0, INITIAL_FEATURE_COUNT)

  /* ─────────────────────── SIDEBAR ─────────────────────── */
  const Sidebar = (
    <aside className="w-full lg:w-[230px] lg:shrink-0">

      {/* ── Category ── */}
      <FilterSection title={t('products.all_categories')}>
        <ul className="space-y-2">
          <li>
            <button
              onClick={() => handleCategoryClick(undefined)}
              className={`w-full text-left text-base transition-colors hover:text-[#DB4444] ${
                !categoryId ? 'font-semibold text-[#DB4444]' : 'text-foreground'
              }`}
            >
              {t('products.all_categories')}
            </button>
          </li>
          {categories.map((cat) => (
            <li key={cat.id}>
              <button
                onClick={() => handleCategoryClick(cat.id)}
                className={`flex w-full items-center justify-between text-base transition-colors hover:text-[#DB4444] ${
                  categoryId === cat.id ? 'font-semibold text-[#DB4444]' : 'text-foreground'
                }`}
              >
                <span>{cat.categoryName}</span>
                {cat.subCategories.length > 0 && <ChevronRight className="h-3.5 w-3.5 shrink-0" />}
              </button>
            </li>
          ))}
        </ul>
      </FilterSection>

      {/* ── Subcategories ── */}
      {activeCategory && activeCategory.subCategories.length > 0 && (
        <FilterSection title={activeCategory.categoryName}>
          <ul className="space-y-2 pl-2">
            {activeCategory.subCategories.map((sub) => (
              <li key={sub.id}>
                <button
                  onClick={() => handleSubcategoryClick(sub.id)}
                  className={`w-full text-left text-sm transition-colors hover:text-[#DB4444] ${
                    subcategoryId === sub.id ? 'font-semibold text-[#DB4444]' : 'text-muted-foreground'
                  }`}
                >
                  {sub.subCategoryName}
                </button>
              </li>
            ))}
          </ul>
        </FilterSection>
      )}

      {/* ── Brands ── */}
      <FilterSection title="Brands">
        <ul className="space-y-2.5">
          {visibleBrands.map((brand) => (
            <li key={brand}>
              <label className="flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  checked={selectedBrands.includes(brand)}
                  onChange={() => toggleBrand(brand)}
                  className="h-4 w-4 cursor-pointer rounded border-border accent-[#DB4444]"
                />
                <span className="text-base text-foreground">{brand}</span>
              </label>
            </li>
          ))}
        </ul>
        {BRANDS.length > INITIAL_BRAND_COUNT && (
          <button
            onClick={() => setShowAllBrands((v) => !v)}
            className="mt-3 text-sm font-medium text-[#DB4444] hover:underline underline-offset-4"
          >
            {showAllBrands ? 'See less' : 'See all'}
          </button>
        )}
      </FilterSection>

      {/* ── Features ── */}
      <FilterSection title="Features">
        <ul className="space-y-2.5">
          {visibleFeatures.map((feat) => (
            <li key={feat}>
              <label className="flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  checked={selectedFeatures.includes(feat)}
                  onChange={() => toggleFeature(feat)}
                  className="h-4 w-4 cursor-pointer rounded border-border accent-[#DB4444]"
                />
                <span className="text-base text-foreground">{feat}</span>
              </label>
            </li>
          ))}
        </ul>
        {FEATURES.length > INITIAL_FEATURE_COUNT && (
          <button
            onClick={() => setShowAllFeatures((v) => !v)}
            className="mt-3 text-sm font-medium text-[#DB4444] hover:underline underline-offset-4"
          >
            {showAllFeatures ? 'See less' : 'See all'}
          </button>
        )}
      </FilterSection>

      {/* ── Price Range ── */}
      <FilterSection title="Price Range">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <p className="mb-1 text-xs text-muted-foreground">Min</p>
              <input
                type="number"
                placeholder="0"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-full rounded-[4px] border border-border bg-background px-3 py-2 text-base text-foreground outline-none focus:border-[#DB4444] placeholder:text-muted-foreground"
              />
            </div>
            <span className="mt-5 shrink-0 text-muted-foreground">—</span>
            <div className="flex-1">
              <p className="mb-1 text-xs text-muted-foreground">Max</p>
              <input
                type="number"
                placeholder="999999"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-full rounded-[4px] border border-border bg-background px-3 py-2 text-base text-foreground outline-none focus:border-[#DB4444] placeholder:text-muted-foreground"
              />
            </div>
          </div>
          <button
            onClick={handlePriceFilter}
            className="w-full rounded-[4px] border border-[#DB4444] py-2 text-base font-medium text-[#DB4444] transition-colors hover:bg-[#DB4444] hover:text-white"
          >
            Apply
          </button>
        </div>
      </FilterSection>

      {/* ── Condition ── */}
      <FilterSection title="Condition">
        <ul className="space-y-2.5">
          {CONDITIONS.map((c) => (
            <li key={c.value}>
              <label className="flex cursor-pointer items-center gap-3">
                <div
                  onClick={() => setCondition(c.value)}
                  className={`flex h-4.5 w-4.5 h-[18px] w-[18px] cursor-pointer items-center justify-center rounded-full border-2 transition-colors ${
                    condition === c.value ? 'border-[#DB4444]' : 'border-muted-foreground'
                  }`}
                >
                  {condition === c.value && (
                    <div className="h-2.5 w-2.5 rounded-full bg-[#DB4444]" />
                  )}
                </div>
                <span className="text-base text-foreground">{c.label}</span>
              </label>
            </li>
          ))}
        </ul>
      </FilterSection>

      {/* ── Ratings ── */}
      <FilterSection title="Ratings">
        <ul className="space-y-2.5">
          {[5, 4, 3, 2].map((rating) => (
            <li key={rating}>
              <label className="flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  checked={selectedRating === rating}
                  onChange={() => setSelectedRating((prev) => (prev === rating ? null : rating))}
                  className="h-4 w-4 cursor-pointer rounded border-border accent-[#DB4444]"
                />
                <StarRow count={rating} />
              </label>
            </li>
          ))}
        </ul>
      </FilterSection>

      {/* ── Clear all ── */}
      {hasActiveFilters && (
        <button
          onClick={handleClearFilters}
          className="mt-4 flex w-full items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-[#DB4444]"
        >
          <X className="h-4 w-4" />
          Clear all filters
          {totalActiveCount > 0 && (
            <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-[#DB4444] text-[10px] font-bold text-white">
              {totalActiveCount}
            </span>
          )}
        </button>
      )}
    </aside>
  )

  /* ─────────────────────── PAGE ─────────────────────── */
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />

      <main className="mx-auto w-full max-w-[1280px] flex-1 px-4 py-10 xl:px-0">

        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
          <Link to="/" className="transition-colors hover:text-[#DB4444]">{t('nav.home')}</Link>
          <span>/</span>
          <span
            className={categoryId ? 'cursor-pointer transition-colors hover:text-[#DB4444]' : 'text-foreground'}
            onClick={() => categoryId && handleCategoryClick(undefined)}
          >
            {t('products.title')}
          </span>
          {activeCategory && (
            <>
              <span>/</span>
              <span className={subcategoryId ? 'cursor-pointer transition-colors hover:text-[#DB4444]' : 'text-foreground'}>
                {activeCategory.categoryName}
              </span>
            </>
          )}
          {subcategoryId && activeCategory && (
            <>
              <span>/</span>
              <span className="text-foreground">
                {activeCategory.subCategories.find((s) => s.id === subcategoryId)?.subCategoryName}
              </span>
            </>
          )}
          {productName && (
            <>
              <span>/</span>
              <span className="text-foreground">&ldquo;{productName}&rdquo;</span>
            </>
          )}
        </nav>

        {/* ── Toolbar: sort + filter button ── */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {/* Mobile filter button */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="flex items-center gap-2 rounded-[4px] border border-border px-3 py-2 text-sm text-foreground hover:border-[#DB4444] hover:text-[#DB4444] transition-colors lg:hidden"
            >
              <SlidersHorizontal className="h-4 w-4" />
              {t('products.filter')}
              {totalActiveCount > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#DB4444] text-[10px] font-bold text-white">
                  {totalActiveCount}
                </span>
              )}
            </button>

            <span className="text-sm text-muted-foreground">
              {filteredAndSorted.length} {t('products.title').toLowerCase()}
              {activeMockFilters > 0 && (
                <span className="ml-2 text-xs text-[#DB4444]">({activeMockFilters} mock filters active)</span>
              )}
            </span>
          </div>

          {/* Sort dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground hidden sm:inline">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="rounded-[4px] border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-[#DB4444] cursor-pointer"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-10">
          {/* Desktop sidebar */}
          <div className="hidden lg:block">{Sidebar}</div>

          {/* ── Products grid ── */}
          <div className="min-w-0 flex-1">

            {listStatus === 'loading' && (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
                {Array.from({ length: 8 }).map((_, i) => <ProductSkeleton key={i} />)}
              </div>
            )}

            {listStatus === 'error' && (
              <NetworkError onRetry={() => dispatch(fetchProducts({ ...filters, categoryId, subcategoryId, productName: productName || undefined }))} />
            )}

            {listStatus === 'success' && filteredAndSorted.length === 0 && (
              <EmptyState
                title={t('products.no_results')}
                description={t('products.no_results_desc')}
                action={{ label: 'Clear filters', onClick: handleClearFilters }}
              />
            )}

            {listStatus === 'success' && filteredAndSorted.length > 0 && (
              <>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 xl:grid-cols-4">
                  {filteredAndSorted.map((p) => <ProductCard key={p.id} product={p} />)}
                </div>

                {pagination.totalPage > 1 && activeMockFilters === 0 && (
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
          <div className="relative z-10 flex h-full w-[300px] flex-col overflow-y-auto bg-background p-5 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-semibold text-foreground">{t('products.filter')}</h2>
              <button onClick={() => setSidebarOpen(false)} className="p-1 text-foreground" aria-label="Close">
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
