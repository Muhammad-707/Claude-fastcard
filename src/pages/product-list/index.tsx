import { useEffect, useCallback, useState, useMemo } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  ChevronRight, ChevronLeft, SlidersHorizontal, X,
  ChevronDown, ChevronUp,
} from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { fetchProducts, setPage, resetFilters } from '@/features/products/model/productsSlice'
import { fetchCategories } from '@/features/categories/model/categoriesSlice'
import { fetchBrands } from '@/features/brands/model/brandsSlice'
import { ProductCard } from '@/entities/product-card'
import { NetworkError } from '@/shared/ui/network-error'
import { EmptyState } from '@/shared/ui/empty-state'
import { Slider } from '@/shared/ui/slider'
import { Header } from '@/widgets/header'
import { Footer } from '@/widgets/footer'

/* ─── Constants ─── */
const PRICE_MIN = 0
const PRICE_MAX = 5000

const FEATURES   = ['Metallic', 'Plastic cover', '8GB Ram', 'Super power', 'Large Memory', 'Waterproof']
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
  const { items: brands } = useAppSelector((s) => s.brands)

  /* ── URL-driven filter values ── */
  const categoryId    = searchParams.get('categoryId')    ? Number(searchParams.get('categoryId'))    : undefined
  const subcategoryId = searchParams.get('subcategoryId') ? Number(searchParams.get('subcategoryId')) : undefined
  const brandId       = searchParams.get('brandId')       ? Number(searchParams.get('brandId'))       : undefined
  const productName   = searchParams.get('q') ?? ''
  const urlMinPrice   = searchParams.get('minPrice')      ? Number(searchParams.get('minPrice'))      : PRICE_MIN
  const urlMaxPrice   = searchParams.get('maxPrice')      ? Number(searchParams.get('maxPrice'))      : PRICE_MAX

  /* ── Local UI state ── */
  const [sidebarOpen,      setSidebarOpen]      = useState(false)
  const [priceRange,       setPriceRange]       = useState<[number, number]>([urlMinPrice, urlMaxPrice])
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([])
  const [condition,        setCondition]        = useState('any')
  const [selectedRating,   setSelectedRating]   = useState<number | null>(null)
  const [showAllBrands,    setShowAllBrands]    = useState(false)
  const [showAllFeatures,  setShowAllFeatures]  = useState(false)
  const [sortBy,           setSortBy]           = useState('popularity')

  const activeCategory = categories.find((c) => c.id === categoryId)

  /* ── Initial data fetch ── */
  useEffect(() => {
    dispatch(fetchCategories())
    dispatch(fetchBrands())
  }, [dispatch])

  /* ── Fetch products whenever URL params or Redux filters change ── */
  useEffect(() => {
    const minP = priceRange[0] > PRICE_MIN ? priceRange[0] : undefined
    const maxP = priceRange[1] < PRICE_MAX ? priceRange[1] : undefined
    dispatch(fetchProducts({
      ...filters,
      categoryId,
      subcategoryId,
      brandId,
      productName: productName || undefined,
      minPrice: minP,
      maxPrice: maxP,
    }))
  }, [dispatch, filters, categoryId, subcategoryId, brandId, productName, priceRange])

  /* ── Client-side-only filters applied on top of the API result ── */
  const filteredAndSorted = useMemo(() => {
    const base = Array.isArray(list) ? list : []
    let result = [...base]

    if (condition === 'brand-new')   result = result.filter((_, i) => i % 3 !== 2)
    else if (condition === 'refurbished') result = result.filter((_, i) => i % 3 === 1)
    else if (condition === 'old')    result = result.filter((_, i) => i % 3 === 2)

    if (selectedRating !== null) {
      result = result.filter((p) => ((p.id % 5) + 1) >= selectedRating)
    }

    if (sortBy === 'price-asc')  result = [...result].sort((a, b) => a.price - b.price)
    if (sortBy === 'price-desc') result = [...result].sort((a, b) => b.price - a.price)
    if (sortBy === 'newest')     result = [...result].reverse()

    return result
  }, [list, condition, selectedRating, sortBy])

  /* ── URL-update helpers ── */
  const pushParams = useCallback((patch: Record<string, string | undefined>) => {
    const next = new URLSearchParams(searchParams)
    Object.entries(patch).forEach(([k, v]) => {
      if (v === undefined || v === '') next.delete(k)
      else next.set(k, v)
    })
    setSearchParams(next)
    dispatch(setPage(1))
  }, [searchParams, setSearchParams, dispatch])

  const handleCategoryClick = useCallback((id: number | undefined) => {
    const next = new URLSearchParams()
    if (id) next.set('categoryId', String(id))
    if (searchParams.get('q')) next.set('q', searchParams.get('q')!)
    setSearchParams(next)
    dispatch(setPage(1))
    setSidebarOpen(false)
  }, [dispatch, searchParams, setSearchParams])

  const handleSubcategoryClick = useCallback((subId: number) => {
    pushParams({ subcategoryId: String(subId) })
    setSidebarOpen(false)
  }, [pushParams])

  const handleBrandClick = useCallback((id: number) => {
    // toggle: clicking the already-selected brand deselects
    pushParams({ brandId: brandId === id ? undefined : String(id) })
  }, [pushParams, brandId])

  /* Price slider: commit to URL on pointer-up (onValueCommit) to avoid spamming API */
  const handlePriceCommit = useCallback((vals: number[]) => {
    const [min, max] = vals as [number, number]
    setPriceRange([min, max])
    pushParams({
      minPrice: min > PRICE_MIN ? String(min) : undefined,
      maxPrice: max < PRICE_MAX ? String(max) : undefined,
    })
  }, [pushParams])

  const handleClearFilters = useCallback(() => {
    setPriceRange([PRICE_MIN, PRICE_MAX])
    setSelectedFeatures([])
    setCondition('any')
    setSelectedRating(null)
    dispatch(resetFilters())
    setSearchParams(new URLSearchParams())
  }, [dispatch, setSearchParams])

  const toggleFeature = (f: string) =>
    setSelectedFeatures((prev) => prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f])

  /* ── Derived ── */
  const mockFilterCount = selectedFeatures.length
    + (condition !== 'any' ? 1 : 0)
    + (selectedRating !== null ? 1 : 0)

  const apiFilterCount = (categoryId ? 1 : 0) + (subcategoryId ? 1 : 0) + (productName ? 1 : 0)
    + (brandId ? 1 : 0)
    + (priceRange[0] > PRICE_MIN || priceRange[1] < PRICE_MAX ? 1 : 0)

  const totalActiveCount = apiFilterCount + mockFilterCount
  const hasActiveFilters = totalActiveCount > 0

  const pages = Array.from({ length: pagination.totalPage }, (_, i) => i + 1)
  const visibleBrands   = showAllBrands   ? brands   : brands.slice(0, INITIAL_BRAND_COUNT)
  const visibleFeatures = showAllFeatures ? FEATURES : FEATURES.slice(0, INITIAL_FEATURE_COUNT)

  /* ─────────────────────── SIDEBAR ─────────────────────── */
  const Sidebar = (
    <aside className="w-full lg:w-[230px] lg:shrink-0">

      {/* ── Clear all — always at top ── */}
      {hasActiveFilters && (
        <button
          onClick={handleClearFilters}
          className="mb-4 flex w-full items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-[#DB4444]"
        >
          <X className="h-4 w-4 shrink-0" />
          Clear all filters
          <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-[#DB4444] text-[10px] font-bold text-white">
            {totalActiveCount}
          </span>
        </button>
      )}

      {/* ── Category (API-driven) ── */}
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

      {/* ── Subcategories (shown only when a category with subs is active) ── */}
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

      {/* ── Brands (API-driven, BrandId → re-fetches from server) ── */}
      <FilterSection title="Brands">
        {brands.length === 0 ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : (
          <>
            <ul className="space-y-2.5">
              {visibleBrands.map((brand) => (
                <li key={brand.id}>
                  <label className="flex cursor-pointer items-center gap-3">
                    <input
                      type="checkbox"
                      checked={brandId === brand.id}
                      onChange={() => handleBrandClick(brand.id)}
                      className="h-4 w-4 cursor-pointer rounded border-border accent-[#DB4444]"
                    />
                    <span className="text-base text-foreground">{brand.brandName}</span>
                  </label>
                </li>
              ))}
            </ul>
            {brands.length > INITIAL_BRAND_COUNT && (
              <button
                onClick={() => setShowAllBrands((v) => !v)}
                className="mt-3 text-sm font-medium text-[#DB4444] underline-offset-4 hover:underline"
              >
                {showAllBrands ? 'See less' : `See all (${brands.length})`}
              </button>
            )}
          </>
        )}
      </FilterSection>

      {/* ── Price Range — dual-range Slider (MinPrice / MaxPrice → server) ── */}
      <FilterSection title="Price Range">
        <div className="space-y-4">
          {/* Live price display */}
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-foreground">${priceRange[0].toLocaleString()}</span>
            <span className="text-muted-foreground">—</span>
            <span className="font-medium text-foreground">${priceRange[1].toLocaleString()}</span>
          </div>

          {/* Dual-thumb Radix Slider */}
          <Slider
            min={PRICE_MIN}
            max={PRICE_MAX}
            step={50}
            value={priceRange}
            onValueChange={(vals) => setPriceRange(vals as [number, number])}
            onValueCommit={handlePriceCommit}
            className="w-full"
          />

          <div className="flex justify-between text-xs text-muted-foreground">
            <span>${PRICE_MIN}</span>
            <span>${PRICE_MAX.toLocaleString()}</span>
          </div>
        </div>
      </FilterSection>

      {/* ── Features (Figma placeholder — no matching Swagger param) ── */}
      <FilterSection title="Features" defaultOpen={false}>
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
            className="mt-3 text-sm font-medium text-[#DB4444] underline-offset-4 hover:underline"
          >
            {showAllFeatures ? 'See less' : 'See all'}
          </button>
        )}
      </FilterSection>

      {/* ── Condition (Figma placeholder — no matching Swagger param) ── */}
      <FilterSection title="Condition" defaultOpen={false}>
        <ul className="space-y-2.5">
          {CONDITIONS.map((c) => (
            <li key={c.value}>
              <label className="flex cursor-pointer items-center gap-3">
                <div
                  onClick={() => setCondition(c.value)}
                  className={`flex h-[18px] w-[18px] cursor-pointer items-center justify-center rounded-full border-2 transition-colors ${
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

      {/* ── Ratings (Figma placeholder — no rating field in API) ── */}
      <FilterSection title="Ratings" defaultOpen={false}>
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

        {/* ── Toolbar ── */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="flex items-center gap-2 rounded-[4px] border border-border px-3 py-2 text-sm text-foreground transition-colors hover:border-[#DB4444] hover:text-[#DB4444] lg:hidden"
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
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden text-sm text-muted-foreground sm:inline">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="cursor-pointer rounded-[4px] border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-[#DB4444]"
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
              <NetworkError onRetry={() => dispatch(fetchProducts({
                ...filters, categoryId, subcategoryId, brandId,
                productName: productName || undefined,
                minPrice: priceRange[0] > PRICE_MIN ? priceRange[0] : undefined,
                maxPrice: priceRange[1] < PRICE_MAX ? priceRange[1] : undefined,
              }))} />
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

                {pagination.totalPage > 1 && mockFilterCount === 0 && (
                  <div className="mt-10 flex items-center justify-center gap-2">
                    <button
                      onClick={() => dispatch(setPage(Math.max(1, pagination.pageNumber - 1)))}
                      disabled={pagination.pageNumber === 1}
                      className="flex h-9 w-9 items-center justify-center rounded-[4px] border border-border text-foreground transition-colors hover:border-[#DB4444] hover:text-[#DB4444] disabled:opacity-40"
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
                      className="flex h-9 w-9 items-center justify-center rounded-[4px] border border-border text-foreground transition-colors hover:border-[#DB4444] hover:text-[#DB4444] disabled:opacity-40"
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
