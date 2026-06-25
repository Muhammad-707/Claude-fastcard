import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { productsApi } from '@/shared/api/products'
import { getImageUrl, IMAGE_PLACEHOLDER } from '@/shared/lib/image'
import { useDebounce } from '@/shared/hooks/useDebounce'
import type { Product } from '@/shared/api/types'

// Mirrors the extraction logic from productsSlice — the server wraps products
// in a nested envelope that doesn't match the Paginated<Product> type annotation.
function extractProducts(responseData: unknown): Product[] {
  if (!responseData || typeof responseData !== 'object') return []
  const r = responseData as Record<string, unknown>
  if (Array.isArray(r['data'])) return r['data'] as Product[]
  if (r['data'] && typeof r['data'] === 'object') {
    const inner = r['data'] as Record<string, unknown>
    if (Array.isArray(inner['products'])) return inner['products'] as Product[]
    if (Array.isArray(inner['data']))    return inner['data']    as Product[]
  }
  return []
}

interface SearchBoxProps {
  /** Applied to the outermost relative container — use to set width on desktop */
  className?: string
  /** Called immediately before navigation so parent drawers can close */
  onClose?: () => void
}

export function SearchBox({ className, onClose }: SearchBoxProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const [query,   setQuery]   = useState('')
  const [results, setResults] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [open,    setOpen]    = useState(false)

  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef     = useRef<HTMLInputElement>(null)

  const debouncedQuery = useDebounce(query, 300)

  /* ── Click-outside closes dropdown ── */
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  /* ── Escape key closes dropdown ── */
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  /* ── Debounced fetch — fires only after 300 ms of no typing ── */
  useEffect(() => {
    const q = debouncedQuery.trim()
    if (q.length < 1) {
      setResults([])
      setOpen(false)
      return
    }

    let cancelled = false
    setLoading(true)
    setOpen(true)

    productsApi
      .getProducts({ productName: q, pageNumber: 1, pageSize: 6 })
      .then((res) => {
        if (cancelled) return
        setResults(extractProducts(res.data))
      })
      .catch(() => { if (!cancelled) setResults([]) })
      .finally(() => { if (!cancelled) setLoading(false) })

    return () => { cancelled = true }
  }, [debouncedQuery])

  /* ── Navigate and clean up ── */
  const go = useCallback((q: string) => {
    const term = q.trim()
    if (!term) return
    setQuery('')
    setOpen(false)
    setResults([])
    onClose?.()
    navigate(`/products?q=${encodeURIComponent(term)}`)
  }, [navigate, onClose])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    go(query)
  }

  const hasResults     = results.length > 0
  const showNoResults  = !loading && !hasResults && debouncedQuery.trim().length >= 1

  return (
    <div ref={containerRef} className={`relative ${className ?? ''}`}>
      {/* ── Input form ── */}
      <form
        onSubmit={handleSubmit}
        className="flex w-full items-center gap-2 rounded-[4px] border border-border bg-[#F5F5F5] px-3 py-2 dark:bg-white/5"
      >
        <input
          ref={inputRef}
          type="text"
          value={query}
          autoComplete="off"
          spellCheck={false}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => { if (hasResults) setOpen(true) }}
          placeholder={t('header.search_placeholder')}
          className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
        />
        {loading ? (
          <Loader2 className="h-4 w-4 shrink-0 animate-spin text-muted-foreground" />
        ) : (
          <button
            type="submit"
            className="shrink-0 text-muted-foreground transition-colors hover:text-foreground"
            aria-label="Search"
          >
            <Search className="h-4 w-4" />
          </button>
        )}
      </form>

      {/* ── Dropdown ── */}
      {open && (loading || hasResults || showNoResults) && (
        <div className="absolute left-0 right-0 top-full z-[9999] mt-1.5 overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-xl dark:border-zinc-800 dark:bg-zinc-900">

          {/* Loading skeleton rows */}
          {loading && !hasResults && (
            <div className="flex flex-col gap-0">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-2.5">
                  <div className="h-10 w-10 shrink-0 animate-pulse rounded-md bg-neutral-100 dark:bg-zinc-800" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 w-3/4 animate-pulse rounded bg-neutral-100 dark:bg-zinc-800" />
                    <div className="h-2.5 w-1/2 animate-pulse rounded bg-neutral-100 dark:bg-zinc-800" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* No results */}
          {showNoResults && (
            <p className="px-4 py-6 text-center text-sm text-muted-foreground">
              No products found for{' '}
              <span className="font-medium text-foreground">&ldquo;{debouncedQuery}&rdquo;</span>
            </p>
          )}

          {/* Result rows */}
          {hasResults && (
            <ul>
              {results.map((product) => {
                const imgSrc = product.image
                  ?? product.images?.[0]?.images
                  ?? product.images?.[0]?.imageName
                const price = product.hasDiscount
                  ? (product.discountPrice ?? product.price)
                  : product.price

                return (
                  <li key={product.id}>
                    <button
                      type="button"
                      onClick={() => go(product.productName)}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-neutral-50 dark:hover:bg-zinc-800"
                    >
                      <img
                        src={getImageUrl(imgSrc)}
                        alt={product.productName}
                        className="h-10 w-10 shrink-0 rounded-md object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).src = IMAGE_PLACEHOLDER }}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground">
                          {product.productName}
                        </p>
                        {product.categoryName && (
                          <p className="truncate text-xs text-muted-foreground">
                            {product.categoryName}
                          </p>
                        )}
                      </div>
                      <span className="shrink-0 text-sm font-semibold text-[#DB4444]">
                        ${price}
                      </span>
                    </button>
                  </li>
                )
              })}

              {/* "See all results" footer */}
              <li className="border-t border-neutral-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => go(query)}
                  className="flex w-full items-center justify-center gap-1.5 py-3 text-xs font-medium text-[#DB4444] transition-colors hover:bg-neutral-50 dark:hover:bg-zinc-800"
                >
                  <Search className="h-3.5 w-3.5" />
                  See all results for &ldquo;{query}&rdquo;
                </button>
              </li>
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
