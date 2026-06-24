import { useEffect, useCallback } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ChevronRight, SlidersHorizontal } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { fetchProducts, setFilters, setPage } from '@/features/products/model/productsSlice'
import { fetchCategories } from '@/features/categories/model/categoriesSlice'
import { ProductCard } from '@/entities/product-card'
import { NetworkError } from '@/shared/ui/network-error'
import { EmptyState } from '@/shared/ui/empty-state'
import { Header } from '@/widgets/header'
import { Footer } from '@/widgets/footer'

export default function ProductsPage() {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const [searchParams, setSearchParams] = useSearchParams()
  const { list, listStatus, filters, pagination } = useAppSelector((s) => s.products)
  const { items: categories } = useAppSelector((s) => s.categories)

  const categoryId = searchParams.get('categoryId') ? Number(searchParams.get('categoryId')) : undefined
  const search = searchParams.get('search') ?? ''

  useEffect(() => {
    dispatch(fetchCategories())
  }, [dispatch])

  useEffect(() => {
    dispatch(fetchProducts({
      ...filters,
      categoryId,
      search: search || undefined,
    }))
  }, [dispatch, filters, categoryId, search])

  const handleCategoryClick = useCallback((id: number | undefined) => {
    const next = new URLSearchParams(searchParams)
    if (id) next.set('categoryId', String(id))
    else next.delete('categoryId')
    setSearchParams(next)
    dispatch(setPage(1))
  }, [dispatch, searchParams, setSearchParams])

  const pages = Array.from({ length: pagination.totalPage }, (_, i) => i + 1)

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />

      <main className="mx-auto w-full max-w-[1170px] flex-1 px-4 py-8 xl:px-0">
        {/* Breadcrumb */}
        <nav className="mb-8 flex items-center gap-2 text-sm text-[#8D8D8D]">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-foreground">{t('products.title')}</span>
        </nav>

        <div className="flex gap-8">
          {/* ── Sidebar ── */}
          <aside className="hidden w-[220px] shrink-0 lg:block">
            <div className="border-b border-[#EBEBEB] pb-4">
              <h3 className="text-sm font-semibold text-foreground">{t('products.all_categories')}</h3>
              <ul className="mt-4 space-y-3">
                <li>
                  <button
                    onClick={() => handleCategoryClick(undefined)}
                    className={`flex w-full items-center justify-between text-sm transition-colors hover:text-primary ${
                      !categoryId ? 'font-semibold text-primary' : 'text-foreground'
                    }`}
                  >
                    {t('products.all_categories')}
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </li>
                {categories.map((cat) => (
                  <li key={cat.id}>
                    <button
                      onClick={() => handleCategoryClick(cat.id)}
                      className={`flex w-full items-center justify-between text-sm transition-colors hover:text-primary ${
                        categoryId === cat.id ? 'font-semibold text-primary' : 'text-foreground'
                      }`}
                    >
                      {cat.categoryName}
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          {/* ── Products grid ── */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-[#8D8D8D]">
                <SlidersHorizontal className="h-4 w-4" />
                <span>{pagination.totalRecord} {t('products.title').toLowerCase()}</span>
              </div>
              <select
                className="rounded-[4px] border border-[#C4C4C4] bg-background px-3 py-1.5 text-sm text-foreground outline-none focus:border-primary"
                onChange={(e) => dispatch(setFilters({ sort: e.target.value }))}
              >
                <option value="">{t('products.sort')}</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="newest">Newest</option>
              </select>
            </div>

            {/* States */}
            {listStatus === 'loading' && (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-[260px] rounded-[4px] bg-[#F5F5F5]" />
                    <div className="mt-3 h-4 w-3/4 rounded bg-[#F5F5F5]" />
                    <div className="mt-2 h-3 w-1/2 rounded bg-[#F5F5F5]" />
                  </div>
                ))}
              </div>
            )}

            {listStatus === 'error' && (
              <NetworkError
                onRetry={() =>
                  dispatch(fetchProducts({ ...filters, categoryId, search: search || undefined }))
                }
              />
            )}

            {listStatus === 'success' && list.length === 0 && (
              <EmptyState
                title={t('products.no_results')}
                description={t('products.no_results_desc')}
                action={{ label: t('products.all_categories'), onClick: () => handleCategoryClick(undefined) }}
              />
            )}

            {listStatus === 'success' && list.length > 0 && (
              <>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
                  {list.map((p) => <ProductCard key={p.id} product={p} />)}
                </div>

                {/* Pagination */}
                {pagination.totalPage > 1 && (
                  <div className="mt-10 flex justify-center gap-2">
                    {pages.map((page) => (
                      <button
                        key={page}
                        onClick={() => dispatch(setPage(page))}
                        className={`flex h-9 w-9 items-center justify-center rounded-[4px] text-sm font-medium transition-colors ${
                          page === pagination.pageNumber
                            ? 'bg-primary text-white'
                            : 'bg-[#F5F5F5] text-foreground hover:bg-primary hover:text-white'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
