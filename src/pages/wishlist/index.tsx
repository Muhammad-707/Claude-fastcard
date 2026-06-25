import { useEffect, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Trash2, ShoppingCart, Heart } from 'lucide-react'
import { Swiper, SwiperSlide } from 'swiper/react'
import 'swiper/css'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { fetchProducts, setFilters } from '@/features/products/model/productsSlice'
import { addToCart, addToCartLocal } from '@/features/cart/model/cartSlice'
import {
  removeWishlist,
  syncWishlistProducts,
  selectWishlistIds,
  selectWishlistProducts,
} from '@/features/wishlist/model/wishlistSlice'
import { selectIsAuth } from '@/features/auth/model/authSlice'
import { ProductCard } from '@/entities/product-card'
import { Header } from '@/widgets/header'
import { Footer } from '@/widgets/footer'
import { getImageUrl, IMAGE_PLACEHOLDER } from '@/shared/lib/image'
import { toast } from 'sonner'
import type { Product } from '@/shared/api/types'

/* ── Design tokens matching Home page exactly ─────────────────────── */
function SectionLabel({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="h-8 w-[14px] shrink-0 rounded-[4px] bg-[#DB4444]" />
      <span className="text-base font-semibold text-[#DB4444]">{label}</span>
    </div>
  )
}

/* ── Skeleton matching Home page ProductSkeleton exactly ──────────── */
function ProductSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-[220px] rounded-[4px] bg-muted sm:h-[260px]" />
      <div className="mt-3 h-4 w-3/4 rounded bg-muted" />
      <div className="mt-2 h-3 w-1/2 rounded bg-muted" />
    </div>
  )
}

/* ── Wishlist card ─────────────────────────────────────────────────── */
function WishlistCard({ product, onRemove, onAddToCart }: {
  product: Product
  onRemove: () => void
  onAddToCart: () => void
}) {
  const { t } = useTranslation()
  const price = product.hasDiscount ? product.discountPrice ?? product.price : product.price
  const img = product.image ?? product.images?.[0]?.images ?? product.images?.[0]?.imageName
  const discountPct = product.hasDiscount && product.discountPrice
    ? Math.round((1 - product.discountPrice / product.price) * 100)
    : null

  return (
    <div className="group flex flex-col">
      <div className="relative overflow-hidden rounded-[4px] bg-[#F5F5F5]">
        <Link to={`/product/${product.id}`} tabIndex={-1}>
          <img
            src={getImageUrl(img)}
            alt={product.productName}
            className="h-[180px] w-full object-cover object-center transition-transform duration-300 group-hover:scale-105 sm:h-[220px]"
            onError={(e) => { (e.target as HTMLImageElement).src = IMAGE_PLACEHOLDER }}
          />
        </Link>

        {/* Discount badge — top left */}
        {discountPct && (
          <span className="absolute left-3 top-3 rounded-[4px] bg-[#DB4444] px-2.5 py-1 text-[11px] font-semibold text-white">
            -{discountPct}%
          </span>
        )}

        {/* Trash icon — top right */}
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); e.preventDefault(); onRemove() }}
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-md transition-colors hover:bg-[#DB4444] hover:text-white"
          aria-label={t('wishlist.remove')}
        >
          <Trash2 className="h-4 w-4" />
        </button>

        {/* Add To Cart — solid black bar always visible */}
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); e.preventDefault(); onAddToCart() }}
          className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-2 bg-black py-2.5 text-xs font-semibold tracking-wide text-white transition-opacity hover:opacity-80"
        >
          <ShoppingCart className="h-3.5 w-3.5" />
          {t('cart.add_to_cart')}
        </button>
      </div>

      {/* Info below image */}
      <div className="mt-2 space-y-1">
        <Link to={`/product/${product.id}`}>
          <p className="line-clamp-1 text-sm font-medium text-foreground hover:text-[#DB4444] transition-colors">
            {product.productName}
          </p>
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-[#DB4444]">${price}</span>
          {product.hasDiscount && product.price && (
            <span className="text-xs text-muted-foreground line-through">${product.price}</span>
          )}
        </div>
      </div>
    </div>
  )
}

/* ════════════════════════════════════════════ */
export default function WishlistPage() {
/* ════════════════════════════════════════════ */
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const wishlistIds = useAppSelector(selectWishlistIds)
  const storedProducts = useAppSelector(selectWishlistProducts)
  const { list: allProducts, listStatus } = useAppSelector((s) => s.products)
  const isAuth = useAppSelector(selectIsAuth)

  useEffect(() => {
    dispatch(fetchProducts({ pageNumber: 1, pageSize: 20 }))
  }, [dispatch])

  /* ── Derive resolved wishlist items ────────────────────────────── */
  // Prefer the stored (persisted) product objects.
  // Fall back to the currently-fetched allProducts for legacy IDs that
  // have no stored object yet (migrated from old plain-IDs localStorage).
  const safeAll = useMemo(() => (Array.isArray(allProducts) ? allProducts : []), [allProducts])

  const wishlistProducts = useMemo<Product[]>(() =>
    wishlistIds
      .map((id) => storedProducts.find((p) => p.id === id) ?? safeAll.find((p) => p.id === id))
      .filter((p): p is Product => p !== undefined),
    [wishlistIds, storedProducts, safeAll],
  )

  /* ── After fetch: migrate legacy IDs and purge orphans ─────────── */
  useEffect(() => {
    if (listStatus !== 'success' || wishlistIds.length === 0) return

    // Persist any products that are now resolved but not yet stored
    const unsynced = wishlistIds
      .filter((id) => !storedProducts.find((p) => p.id === id))
      .map((id) => safeAll.find((p) => p.id === id))
      .filter((p): p is Product => p !== undefined)

    if (unsynced.length > 0) {
      dispatch(syncWishlistProducts(unsynced))
    }

    // Remove IDs that truly don't exist in the API response (orphan legacy IDs)
    const orphans = wishlistIds.filter(
      (id) =>
        !storedProducts.find((p) => p.id === id) &&
        !safeAll.find((p) => p.id === id),
    )
    orphans.forEach((id) => dispatch(removeWishlist(id)))
  }, [listStatus, wishlistIds, storedProducts, safeAll, dispatch])

  const justForYou = useMemo(
    () => safeAll.filter((p) => !wishlistIds.includes(p.id)).slice(0, 8),
    [safeAll, wishlistIds],
  )

  /* ── Handlers ───────────────────────────────────────────────────── */
  const handleAddAllToCart = () => {
    if (!isAuth) { toast.error(t('auth.login')); return }
    wishlistProducts.forEach((p) => {
      dispatch(addToCartLocal({ productId: p.id, product: p }))
      void dispatch(addToCart(p.id))
    })
    toast.success(t('cart.added'))
  }

  const handleAddToCart = (product: Product) => {
    if (!isAuth) { toast.error(t('auth.login')); return }
    dispatch(addToCartLocal({ productId: product.id, product }))
    void dispatch(addToCart(product.id))
    toast.success(t('cart.added'))
  }

  const handleRemove = (id: number) => {
    dispatch(removeWishlist(id))
    toast.info(t('wishlist.removed'))
  }

  /* ── Derived booleans ───────────────────────────────────────────── */
  const isLoadingProducts = listStatus === 'loading'
  // True only once we know for certain the list is empty
  const isEmpty = wishlistIds.length === 0 || (!isLoadingProducts && wishlistProducts.length === 0)

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />

      <main className="mx-auto w-full max-w-[1280px] flex-1 px-4 py-10 xl:px-0">

        {/* ════ Empty state ════════════════════════════════════════════ */}
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Heart className="mb-6 h-20 w-20 text-muted-foreground/30" />
            <h2 className="text-4xl font-bold text-foreground">{t('wishlist.empty_title')}</h2>
            <p className="mt-3 max-w-sm text-base text-muted-foreground">{t('wishlist.empty_desc')}</p>
            <button
              onClick={() => navigate('/')}
              className="mt-8 rounded-[4px] bg-[#DB4444] px-10 py-3.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            >
              {t('wishlist.go_shopping')}
            </button>
          </div>
        ) : (
          <>
            {/* ── Wishlist section ─────────────────────────────────── */}
            <section>
              {/* Header row */}
              <div className="flex items-center justify-between">
                <h1 className="text-4xl font-bold text-foreground">
                  {t('wishlist.title')}&nbsp;
                  <span className="text-2xl font-semibold text-muted-foreground">
                    ({wishlistIds.length})
                  </span>
                </h1>
                <button
                  onClick={handleAddAllToCart}
                  className="rounded-[4px] border border-foreground/40 px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:border-foreground hover:bg-foreground hover:text-background"
                >
                  {t('wishlist.move_all_to_bag')}
                </button>
              </div>

              {/* Grid — skeleton while loading, real cards when ready */}
              <div className="mt-8 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
                {isLoadingProducts && wishlistProducts.length === 0
                  ? wishlistIds.map((id) => <ProductSkeleton key={id} />)
                  : wishlistProducts.map((p) => (
                      <WishlistCard
                        key={p.id}
                        product={p}
                        onRemove={() => handleRemove(p.id)}
                        onAddToCart={() => handleAddToCart(p)}
                      />
                    ))}
              </div>
            </section>

            <div className="my-16 h-px bg-border" />

            {/* ── Just For You ─────────────────────────────────────── */}
            {justForYou.length > 0 && (
              <section>
                <SectionLabel label={t('wishlist.just_for_you')} />

                <div className="mt-5 flex items-center justify-between">
                  <h2 className="text-4xl font-bold text-foreground">
                    {t('wishlist.just_for_you')}
                  </h2>
                  <Link
                    to="/products"
                    onClick={() => dispatch(setFilters({}))}
                    className="rounded-[4px] border border-border px-8 py-3 text-sm font-semibold text-foreground transition-colors hover:border-foreground"
                  >
                    {t('wishlist.see_all')}
                  </Link>
                </div>

                {/* Swiper — same breakpoints as Home ProductSwiperSection */}
                <div className="mt-8">
                  <Swiper
                    spaceBetween={12}
                    slidesPerView={1.4}
                    breakpoints={{
                      480: { slidesPerView: 2, spaceBetween: 16 },
                      640: { slidesPerView: 3, spaceBetween: 20 },
                      1024: { slidesPerView: 4, spaceBetween: 20 },
                    }}
                  >
                    {justForYou.map((p) => (
                      <SwiperSlide key={p.id}>
                        <ProductCard product={p} showBadge={p.hasDiscount ? 'sale' : 'new'} />
                      </SwiperSlide>
                    ))}
                  </Swiper>
                </div>
              </section>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  )
}
