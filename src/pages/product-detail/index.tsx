import { useEffect, useState, useMemo, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Heart, Star, Truck, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { fetchProductById, clearCurrent, fetchProducts } from '@/features/products/model/productsSlice'
import { addToCart, addToCartLocal, increaseCart, increaseQtyLocal } from '@/features/cart/model/cartSlice'
import { toggleWishlist, selectIsWishlisted } from '@/features/wishlist/model/wishlistSlice'
import { selectIsAuth } from '@/features/auth/model/authSlice'
import { NetworkError } from '@/shared/ui/network-error'
import { ProductCard } from '@/entities/product-card'
import { Header } from '@/widgets/header'
import { Footer } from '@/widgets/footer'
import { getImageUrl, IMAGE_PLACEHOLDER } from '@/shared/lib/image'
import { toast } from 'sonner'

const SIZES = ['XS', 'S', 'M', 'L', 'XL'] as const
const DEMO_COLORS = ['#A0BCE0', '#E07575'] as const

export default function ProductDetailPage() {
  const { t } = useTranslation()
  const { id } = useParams<{ id: string }>()
  const dispatch = useAppDispatch()

  const { current: product, currentStatus, list } = useAppSelector((s) => s.products)
  const isAuth = useAppSelector(selectIsAuth)
  const wishlisted = useAppSelector(selectIsWishlisted(product?.id ?? 0))
  const cartItems = useAppSelector((s) => s.cart.items)

  const [selectedImg, setSelectedImg] = useState(0)
  const [qty, setQty] = useState(1)
  const [selectedSize, setSelectedSize] = useState<string>('M')
  const [selectedColor, setSelectedColor] = useState(0)

  useEffect(() => {
    if (id) {
      dispatch(fetchProductById(Number(id)))
    }
    dispatch(fetchProducts({ pageNumber: 1, pageSize: 20 }))
    return () => {
      dispatch(clearCurrent())
    }
  }, [dispatch, id])

  useEffect(() => {
    setSelectedImg(0)
    setQty(1)
  }, [product?.id])

  const handleBuyNow = useCallback(() => {
    if (!isAuth) {
      toast.error(t('auth.login', { defaultValue: 'Please login first' }))
      return
    }
    if (!product) return

    const existing = cartItems.find((i) => i.productId === product.id)
    dispatch(addToCartLocal({ productId: product.id, product }))
    for (let i = 1; i < qty; i++) dispatch(increaseQtyLocal(product.id))

    void dispatch(addToCart(product.id))
    for (let i = 1; i < qty; i++) void dispatch(increaseCart(product.id))

    const newTotal = (existing?.quantity ?? 0) + qty
    toast.success(t('cart.added_count', { count: newTotal, defaultValue: `Added ${newTotal} items to cart` }))
  }, [isAuth, product, cartItems, dispatch, qty, t])

  const handleWishlist = useCallback(() => {
    if (!product) return
    dispatch(toggleWishlist(product))
    toast[wishlisted ? 'info' : 'success'](
      wishlisted
        ? t('wishlist.removed', { defaultValue: 'Removed from wishlist' })
        : t('wishlist.added', { defaultValue: 'Added to wishlist' })
    )
  }, [product, dispatch, wishlisted, t])

  /* ── Derived State (Memoized for performance) ── */
  const { allImageUrls, thumbUrls } = useMemo(() => {
    if (!product) return { allImageUrls: [], thumbUrls: [] }

    const urls: string[] = []
    if (product.image) urls.push(getImageUrl(product.image))
      ; (product.images ?? []).forEach((img) => {
        const url = getImageUrl(img.images ?? img.imageName)
        if (!urls.includes(url)) urls.push(url)
      })

    if (urls.length === 0) urls.push(IMAGE_PLACEHOLDER)

    const thumbs = [...urls]
    while (thumbs.length < 4) thumbs.push(urls[0])

    return { allImageUrls: urls, thumbUrls: thumbs }
  }, [product])

  const relatedProducts = useMemo(() => {
    return (Array.isArray(list) ? list : []).filter((p) => p.id !== product?.id)
  }, [list, product?.id])

  const discountPct = useMemo(() => {
    if (product?.hasDiscount && product.discountPrice && product.price) {
      return Math.round((1 - product.discountPrice / product.price) * 100)
    }
    return null
  }, [product?.hasDiscount, product?.discountPrice, product?.price])

  /* ── Loading skeleton ── */
  if (currentStatus === 'loading') {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <main className="mx-auto w-full max-w-[1280px] flex-1 px-4 py-10 xl:px-0">
          <div className="animate-pulse">
            <div className="mb-8 flex gap-2">
              <div className="h-4 w-16 rounded bg-muted" />
              <div className="h-4 w-4 rounded bg-muted" />
              <div className="h-4 w-24 rounded bg-muted" />
            </div>
            <div className="grid grid-cols-1 gap-10 lg:grid-cols-[700px_1fr]">
              <div className="flex gap-[30px]">
                <div className="flex w-[170px] flex-col gap-[16px]">
                  {[1, 2, 3, 4].map(i => <div key={i} className="h-[138px] w-full rounded-[4px] bg-muted" />)}
                </div>
                <div className="flex-1 rounded-[4px] bg-muted" style={{ minHeight: 600 }} />
              </div>
              <div className="space-y-5">
                <div className="h-8 w-3/4 rounded bg-muted" />
                <div className="h-5 w-1/3 rounded bg-muted" />
                <div className="h-10 w-1/4 rounded bg-muted" />
                <div className="h-px bg-muted" />
                <div className="h-20 rounded bg-muted" />
                <div className="h-10 w-1/2 rounded bg-muted" />
                <div className="h-14 rounded bg-muted" />
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  /* ── Error state ── */
  if (currentStatus === 'error') {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <main className="flex flex-1 items-center justify-center">
          <NetworkError onRetry={() => id && dispatch(fetchProductById(Number(id)))} />
        </main>
        <Footer />
      </div>
    )
  }

  if (!product) return null

  const price = product.hasDiscount ? product.discountPrice ?? product.price : product.price
  const safeIdx = Math.min(selectedImg, allImageUrls.length - 1)

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />

      <main className="mx-auto w-full max-w-[1280px] flex-1 px-4 py-8 xl:px-0">

        {/* Breadcrumb */}
        <nav className="mb-10 flex items-center gap-2 text-sm text-muted-foreground">
          <Link to="/" className="transition-colors hover:text-foreground">{t('nav.home', { defaultValue: 'Home' })}</Link>
          <span>/</span>
          <Link to="/products" className="transition-colors hover:text-foreground">{t('products.title', { defaultValue: 'Products' })}</Link>
          <span>/</span>
          <span className="line-clamp-1 max-w-[240px] font-medium text-foreground">{product.productName}</span>
        </nav>

        {/* ═══════════════════════════════════════════════════════
            PRODUCT SECTION
            Desktop: 2-column grid — [gallery (700px) | details (1fr)]
            Mobile: single column — [main img → thumbs → details]
        ═══════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-[700px_1fr] lg:gap-[70px]">

          {/* ── LEFT COLUMN: Gallery ────────────────────────────────── */}
          <div className="w-full">

            {/* ┌─ DESKTOP gallery (lg+): thumbs column LEFT + main image RIGHT ─┐ */}
            <div className="hidden lg:flex lg:h-[580px] lg:items-stretch lg:gap-[30px]">

              {/* Vertical thumbnails — 170px wide column */}
              <div className="flex w-[160px] flex-col justify-between">
                {thumbUrls.slice(0, 4).map((url, i) => {
                  const realIdx = i < allImageUrls.length ? i : 0
                  const isActive = safeIdx === realIdx
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setSelectedImg(realIdx)}
                      aria-label={`View image ${i + 1}`}
                      className={`flex h-[138px] w-full shrink-0 items-center justify-center overflow-hidden rounded-[4px] bg-[#F5F5F5] transition-all duration-300 dark:bg-zinc-800 ${isActive
                          ? 'border-[2px] border-[#DB4444]'
                          : 'border-[2px] border-transparent hover:border-[#DB4444]/50'
                        }`}
                    >
                      <img
                        src={url}
                        alt={`Thumbnail ${i + 1}`}
                        className="h-full w-full object-contain p-3"
                        onError={(e) => { (e.target as HTMLImageElement).src = IMAGE_PLACEHOLDER }}
                      />
                    </button>
                  )
                })}
              </div>

              {/* Main image — 500px wide */}
              <div className="relative flex-1 overflow-hidden rounded-[4px] bg-[#F5F5F5] dark:bg-zinc-800">
                {discountPct && (
                  <span className="absolute left-3 top-3 z-10 rounded-[4px] bg-[#DB4444] px-3 py-1 text-xs font-semibold text-white">
                    -{discountPct}%
                  </span>
                )}
                <img
                  src={allImageUrls[safeIdx]}
                  alt={product.productName}
                  className="h-full w-full object-contain p-8 transition-opacity duration-300"
                  onError={(e) => { (e.target as HTMLImageElement).src = IMAGE_PLACEHOLDER }}
                />
              </div>
            </div>

            {/* ┌─ MOBILE gallery (<lg): main image TOP + horizontal thumbs BELOW ─┐ */}
            <div className="flex flex-col gap-4 lg:hidden">
              {/* Main image */}
              <div className="relative h-[350px] w-full lg:h-[580px] lg:w-[530px] overflow-hidden rounded-[4px] bg-[#F5F5F5] dark:bg-zinc-800">
                {discountPct && (
                  <span className="absolute left-3 top-3 z-10 rounded-[4px] bg-[#DB4444] px-3 py-1 text-xs font-semibold text-white">
                    -{discountPct}%
                  </span>
                )}
                <img
                  src={allImageUrls[safeIdx]}
                  alt={product.productName}
                  className="h-full w-full object-contain p-4"
                  onError={(e) => { (e.target as HTMLImageElement).src = IMAGE_PLACEHOLDER }}
                />
              </div>
              {/* Horizontal thumbnail strip */}
              <div className="flex gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                {thumbUrls.slice(0, 4).map((url, i) => {
                  const realIdx = i < allImageUrls.length ? i : 0
                  const isActive = safeIdx === realIdx
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setSelectedImg(realIdx)}
                      aria-label={`View image ${i + 1}`}
                      className={`flex h-[80px] w-[100px] shrink-0 items-center justify-center overflow-hidden rounded-[4px] bg-[#F5F5F5] transition-all duration-300 sm:h-[100px] sm:w-[120px] dark:bg-zinc-800 ${isActive
                          ? 'border-[2px] border-[#DB4444]'
                          : 'border-[2px] border-transparent hover:border-[#DB4444]/50'
                        }`}
                    >
                      <img
                        src={url}
                        alt={`Thumbnail ${i + 1}`}
                        className="h-full w-full object-contain p-2"
                        onError={(e) => { (e.target as HTMLImageElement).src = IMAGE_PLACEHOLDER }}
                      />
                    </button>
                  )
                })}
              </div>
            </div>

          </div>

          {/* ── RIGHT COLUMN: Product Details ───────────────────────── */}
          <div className="flex w-full flex-col lg:w-full lg:h-[580px] lg:justify-between gap-6 lg:gap-0">

            {/* Title */}
            <h1 className="text-2xl font-semibold leading-snug text-foreground lg:text-[26px]">
              {product.productName}
            </h1>

            {/* Rating row */}
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`h-[18px] w-[18px] ${s <= 4 ? 'fill-[#FFAD33] text-[#FFAD33]' : 'fill-muted-foreground/30 text-muted-foreground/30'}`}
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">(150 {t('products.reviews', { defaultValue: 'Reviews' })})</span>
              <span className="text-muted-foreground/40">|</span>
              <span className="text-sm font-medium text-[#00FF66]">{t('products.in_stock', { defaultValue: 'In Stock' })}</span>
            </div>

            {/* Price */}
            <div className="mt-4 flex items-baseline gap-3">
              <span className="text-[28px] font-bold text-foreground">${price}</span>
              {product.hasDiscount && product.price && (
                <span className="text-lg text-muted-foreground line-through">${product.price}</span>
              )}
            </div>

            <div className="my-6 h-px bg-border" />

            {/* Description */}
            {product.description && (
              <p className="text-sm leading-relaxed text-muted-foreground">{product.description}</p>
            )}

            <div className="my-6 h-px bg-border" />

            {/* Colours */}
            <div className="flex items-center gap-5">
              <span className="w-14 shrink-0 text-sm font-semibold text-foreground">
                {t('products.colours', { defaultValue: 'Colours:' })}
              </span>
              <div className="flex items-center gap-3">
                {DEMO_COLORS.map((color, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setSelectedColor(i)}
                    className={`h-[20px] w-[20px] rounded-full transition-all ${selectedColor === i
                        ? 'scale-110 ring-2 ring-foreground ring-offset-2'
                        : 'hover:scale-105'
                      }`}
                    style={{ backgroundColor: color }}
                    aria-label={`Color ${i + 1}`}
                  />
                ))}
              </div>
            </div>

            {/* Size */}
            <div className="mt-5 flex items-center gap-5">
              <span className="w-14 shrink-0 text-sm font-semibold text-foreground">
                {t('products.size', { defaultValue: 'Size:' })}
              </span>
              <div className="flex flex-wrap items-center gap-2">
                {SIZES.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setSelectedSize(size)}
                    className={`flex h-[34px] w-[34px] items-center justify-center rounded-[4px] border text-sm font-medium transition-colors ${selectedSize === size
                        ? 'border-transparent bg-[#DB4444] text-white'
                        : 'border-border text-foreground hover:border-[#DB4444] hover:text-[#DB4444]'
                      }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity + Buy Now + Wishlist */}
            <div className="mt-8 flex items-center gap-4">
              {/* Quantity stepper */}
              <div className="flex h-14 overflow-hidden rounded-[4px] border border-border">
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="flex h-full w-[52px] items-center justify-center text-xl text-foreground transition-colors hover:bg-muted"
                >
                  −
                </button>
                <span className="flex h-full w-[52px] items-center justify-center border-x border-border text-sm font-semibold text-foreground">
                  {qty}
                </span>
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.min(product.quantity || 99, q + 1))}
                  className="flex h-full w-[52px] items-center justify-center bg-[#DB4444] text-xl text-white transition-opacity hover:opacity-90"
                >
                  +
                </button>
              </div>

              {/* Buy Now */}
              <button
                type="button"
                onClick={handleBuyNow}
                className="flex h-14 flex-1 items-center justify-center rounded-[4px] bg-[#DB4444] px-6 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              >
                {t('products.buy_now', { defaultValue: 'Buy Now' })}
              </button>

              {/* Wishlist heart */}
              <button
                type="button"
                onClick={handleWishlist}
                className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-[4px] border transition-colors ${wishlisted
                    ? 'border-[#DB4444] bg-[#DB4444] text-white'
                    : 'border-border text-foreground hover:border-[#DB4444] hover:text-[#DB4444]'
                  }`}
                aria-label="Wishlist"
              >
                <Heart className="h-5 w-5" fill={wishlisted ? 'currentColor' : 'none'} />
              </button>
            </div>

            {/* Delivery info cards */}
            <div className="mt-8 overflow-hidden rounded-[4px] border border-border">
              <div className="flex items-start gap-4 border-b border-border px-5 py-4">
                <Truck className="mt-0.5 h-6 w-6 shrink-0 text-foreground" />
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {t('delivery.free', { defaultValue: 'Free Delivery' })}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {t('delivery.availability', { defaultValue: 'Enter your postal code for Delivery Availability' })}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4 px-5 py-4">
                <RefreshCw className="mt-0.5 h-6 w-6 shrink-0 text-foreground" />
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {t('delivery.return', { defaultValue: 'Return Delivery' })}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {t('delivery.return_details', { defaultValue: 'Free 30 Days Delivery Returns. Details' })}
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════
            RELATED ITEMS — Swiper carousel
        ═══════════════════════════════════════════════════════ */}
        {relatedProducts.length > 0 && (
          <section className="mt-20">

            {/* Section header */}
            <div className="mb-8 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="h-8 w-[14px] shrink-0 rounded-[4px] bg-[#DB4444]" />
                <div>
                  <p className="text-sm font-semibold text-[#DB4444]">
                    {t('products.related', { defaultValue: 'Related Item' })}
                  </p>
                  <h2 className="mt-0.5 text-2xl font-bold text-foreground">
                    {t('products.might_like', { defaultValue: 'You Might Also Like' })}
                  </h2>
                </div>
              </div>

              {/* Custom nav buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="related-prev flex h-10 w-10 items-center justify-center rounded-full bg-[#F5F5F5] text-foreground transition-colors hover:bg-[#DB4444] hover:text-white dark:bg-zinc-800"
                  aria-label="Previous"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  className="related-next flex h-10 w-10 items-center justify-center rounded-full bg-[#F5F5F5] text-foreground transition-colors hover:bg-[#DB4444] hover:text-white dark:bg-zinc-800"
                  aria-label="Next"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>

            <Swiper
              modules={[Navigation]}
              navigation={{
                prevEl: '.related-prev',
                nextEl: '.related-next',
              }}
              spaceBetween={16}
              slidesPerView={2}
              breakpoints={{
                640: { slidesPerView: 2, spaceBetween: 16 },
                768: { slidesPerView: 3, spaceBetween: 20 },
                1024: { slidesPerView: 4, spaceBetween: 24 },
              }}
            >
              {relatedProducts.map((p) => (
                <SwiperSlide key={p.id}>
                  <ProductCard product={p} showBadge={p.hasDiscount ? 'sale' : undefined} />
                </SwiperSlide>
              ))}
            </Swiper>

          </section>
        )}

      </main>

      <Footer />
    </div>
  )
}