import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Heart, Star, Truck, RefreshCw, ShoppingCart } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { fetchProductById, clearCurrent, fetchProducts } from '@/features/products/model/productsSlice'
import { addToCart } from '@/features/cart/model/cartSlice'
import { toggleWishlist, selectIsWishlisted } from '@/features/wishlist/model/wishlistSlice'
import { selectIsAuth } from '@/features/auth/model/authSlice'
import { NetworkError } from '@/shared/ui/network-error'
import { Header } from '@/widgets/header'
import { Footer } from '@/widgets/footer'
import { getImageUrl } from '@/shared/lib/image'
import { toast } from 'sonner'
import type { Product } from '@/shared/api/types'

const SIZES = ['XS', 'S', 'M', 'L', 'XL'] as const
const DEMO_COLORS = ['#A0BCE0', '#E07575'] as const

function RelatedCard({ product }: { product: Product }) {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const isAuth = useAppSelector(selectIsAuth)
  const isWishlisted = useAppSelector(selectIsWishlisted(product.id))
  const price = product.hasDiscount ? product.discountPrice ?? product.price : product.price
  const img = product.images?.[0]?.imageName
  const discountPct = product.hasDiscount && product.discountPrice
    ? Math.round((1 - product.discountPrice / product.price) * 100)
    : null

  const handleAddToCart = () => {
    if (!isAuth) { toast.error(t('auth.login')); return }
    dispatch(addToCart(product.id))
    toast.success(t('cart.added'))
  }

  return (
    <div className="group relative flex flex-col">
      <div className="relative overflow-hidden rounded-[4px] bg-muted">
        <Link to={`/product/${product.id}`}>
          <img
            src={getImageUrl(img)}
            alt={product.productName}
            className="h-[180px] w-full object-cover sm:h-[220px]"
          />
        </Link>
        {discountPct && (
          <span className="absolute left-3 top-3 rounded-[4px] bg-[#DB4444] px-2 py-0.5 text-[10px] font-medium text-white">
            -{discountPct}%
          </span>
        )}
        <button
          onClick={() => dispatch(toggleWishlist(product.id))}
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-background shadow"
          aria-label="Wishlist"
        >
          <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-[#DB4444] text-[#DB4444]' : 'text-foreground'}`} />
        </button>
        <button
          onClick={handleAddToCart}
          className="absolute bottom-0 left-0 right-0 flex items-center justify-center gap-2 bg-black py-2.5 text-xs font-medium text-white opacity-0 transition-opacity group-hover:opacity-100"
        >
          <ShoppingCart className="h-3.5 w-3.5" />
          {t('cart.add_to_cart')}
        </button>
      </div>
      <div className="mt-2 px-0.5">
        <Link to={`/product/${product.id}`}>
          <p className="line-clamp-1 text-sm font-medium text-foreground hover:text-[#DB4444] transition-colors">
            {product.productName}
          </p>
        </Link>
        <div className="mt-1 flex items-center gap-2">
          <span className="text-sm font-semibold text-[#DB4444]">${price}</span>
          {product.hasDiscount && (
            <span className="text-sm text-muted-foreground line-through">${product.price}</span>
          )}
        </div>
        <div className="mt-1 flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((s) => (
            <Star key={s} className={`h-3 w-3 ${s <= 4 ? 'fill-[#FFAD33] text-[#FFAD33]' : 'fill-muted text-muted'}`} />
          ))}
          <span className="ml-1 text-[10px] text-muted-foreground">(88)</span>
        </div>
      </div>
    </div>
  )
}

export default function ProductDetailPage() {
  const { t } = useTranslation()
  const { id } = useParams<{ id: string }>()
  const dispatch = useAppDispatch()
  const { current: product, currentStatus, list } = useAppSelector((s) => s.products)
  const isAuth = useAppSelector(selectIsAuth)
  const wishlisted = useAppSelector(selectIsWishlisted(product?.id ?? 0))

  const [selectedImg, setSelectedImg] = useState(0)
  const [qty, setQty] = useState(1)
  const [selectedSize, setSelectedSize] = useState<string>('M')
  const [selectedColor, setSelectedColor] = useState(0)

  useEffect(() => {
    if (id) dispatch(fetchProductById(Number(id)))
    dispatch(fetchProducts({ pageNumber: 1, pageSize: 8 }))
    return () => { dispatch(clearCurrent()) }
  }, [dispatch, id])

  const handleBuyNow = () => {
    if (!isAuth) { toast.error(t('auth.login')); return }
    if (!product) return
    for (let i = 0; i < qty; i++) dispatch(addToCart(product.id))
    toast.success(t('cart.added'))
  }

  const handleWishlist = () => {
    if (!product) return
    dispatch(toggleWishlist(product.id))
  }

  if (currentStatus === 'loading') {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <main className="mx-auto w-full max-w-[1280px] flex-1 px-4 py-10 xl:px-0">
          <div className="flex animate-pulse gap-10">
            <div className="flex gap-3">
              <div className="flex flex-col gap-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-[120px] w-[120px] rounded-[4px] bg-muted" />
                ))}
              </div>
              <div className="h-[500px] w-[500px] rounded-[4px] bg-muted" />
            </div>
            <div className="flex-1 space-y-4">
              <div className="h-8 w-3/4 rounded bg-muted" />
              <div className="h-6 w-1/4 rounded bg-muted" />
              <div className="h-24 rounded bg-muted" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (currentStatus === 'error') {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <NetworkError onRetry={() => id && dispatch(fetchProductById(Number(id)))} />
        </main>
        <Footer />
      </div>
    )
  }

  if (!product) return null

  const price = product.hasDiscount ? product.discountPrice ?? product.price : product.price
  const images = product.images ?? []

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />

      <main className="mx-auto w-full max-w-[1280px] flex-1 px-4 py-8 xl:px-0">
        {/* Breadcrumb */}
        <nav className="mb-8 flex items-center gap-2 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-foreground transition-colors">{t('nav.home')}</Link>
          <span>/</span>
          <Link to="/products" className="hover:text-foreground transition-colors">{t('products.title')}</Link>
          <span>/</span>
          <span className="text-foreground line-clamp-1 max-w-[200px]">{product.productName}</span>
        </nav>

        {/* Product layout */}
        <div className="flex flex-col gap-10 lg:flex-row">

          {/* ── Gallery ── */}
          <div className="flex gap-4">
            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex flex-col gap-3">
                {images.slice(0, 4).map((img, i) => (
                  <button
                    key={img.id}
                    onClick={() => setSelectedImg(i)}
                    className={`h-[120px] w-[120px] overflow-hidden rounded-[4px] bg-muted transition-all ${
                      selectedImg === i ? 'ring-2 ring-foreground' : 'hover:ring-1 hover:ring-border'
                    }`}
                  >
                    <img src={getImageUrl(img.imageName)} alt={product.productName} className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Main image */}
            <div className="relative overflow-hidden rounded-[4px] bg-muted">
              <img
                src={getImageUrl(images[selectedImg]?.imageName)}
                alt={product.productName}
                className="h-[400px] w-[400px] max-w-[min(100vw-2rem,400px)] object-cover object-center lg:h-[500px] lg:w-[500px]"
              />
              {product.hasDiscount && product.discountPrice && (
                <span className="absolute left-3 top-3 rounded-[4px] bg-[#DB4444] px-3 py-1 text-xs font-medium text-white">
                  -{Math.round((1 - product.discountPrice / product.price) * 100)}%
                </span>
              )}
            </div>
          </div>

          {/* ── Info panel ── */}
          <div className="flex-1">
            <h1 className="text-2xl font-semibold text-foreground">{product.productName}</h1>

            {/* Rating */}
            <div className="mt-3 flex items-center gap-2">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className={`h-4 w-4 ${s <= 4 ? 'fill-[#FFAD33] text-[#FFAD33]' : 'fill-muted text-muted'}`} />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">(150 Reviews)</span>
              <span className="text-muted-foreground">|</span>
              <span className="text-sm text-[#00FF66]">In Stock</span>
            </div>

            {/* Price */}
            <div className="mt-4 flex items-center gap-3">
              <span className="text-2xl font-medium text-foreground">${price}</span>
              {product.hasDiscount && (
                <span className="text-lg text-muted-foreground line-through">${product.price}</span>
              )}
            </div>

            {/* Description */}
            <div className="my-4 h-px bg-border" />
            <p className="text-sm leading-6 text-muted-foreground">{product.description}</p>
            <div className="my-4 h-px bg-border" />

            {/* Colours */}
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-foreground">Colours:</span>
              <div className="flex items-center gap-2">
                {DEMO_COLORS.map((color, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedColor(i)}
                    className={`h-5 w-5 rounded-full transition-all ${
                      selectedColor === i ? 'ring-2 ring-offset-2 ring-foreground' : ''
                    }`}
                    style={{ backgroundColor: color }}
                    aria-label={`Color ${i + 1}`}
                  />
                ))}
              </div>
            </div>

            {/* Size */}
            <div className="mt-5 flex items-center gap-4">
              <span className="text-sm font-medium text-foreground">Size:</span>
              <div className="flex items-center gap-2">
                {SIZES.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`flex h-8 w-8 items-center justify-center rounded-[4px] border text-xs font-medium transition-colors ${
                      selectedSize === size
                        ? 'border-transparent bg-[#DB4444] text-white'
                        : 'border-border text-foreground hover:border-foreground'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity + Buy Now + Wishlist */}
            <div className="mt-6 flex flex-wrap items-center gap-4">
              {/* Qty control */}
              <div className="flex items-center rounded-[4px] border border-border">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="flex h-11 w-11 items-center justify-center text-foreground hover:bg-muted transition-colors text-lg"
                >
                  -
                </button>
                <span className="w-10 text-center text-sm font-medium">{qty}</span>
                <button
                  onClick={() => setQty((q) => Math.min(product.quantity || 99, q + 1))}
                  className="flex h-11 w-11 items-center justify-center bg-[#DB4444] text-white hover:opacity-90 transition-opacity text-lg"
                >
                  +
                </button>
              </div>

              {/* Buy Now */}
              <button
                onClick={handleBuyNow}
                className="flex h-11 items-center gap-2 rounded-[4px] bg-[#DB4444] px-8 text-sm font-medium text-white hover:opacity-90 transition-opacity"
              >
                {t('products.buy_now')}
              </button>

              {/* Wishlist */}
              <button
                onClick={handleWishlist}
                className={`flex h-11 w-11 items-center justify-center rounded-[4px] border transition-colors ${
                  wishlisted
                    ? 'border-[#DB4444] bg-[#DB4444] text-white'
                    : 'border-border text-foreground hover:border-[#DB4444] hover:text-[#DB4444]'
                }`}
                aria-label="Wishlist"
              >
                <Heart className="h-5 w-5" fill={wishlisted ? 'currentColor' : 'none'} />
              </button>
            </div>

            {/* Delivery info */}
            <div className="mt-6 rounded-[4px] border border-border">
              <div className="flex items-start gap-4 border-b border-border p-4">
                <Truck className="mt-0.5 h-6 w-6 text-foreground shrink-0" />
                <div>
                  <p className="text-sm font-medium text-foreground">Free Delivery</p>
                  <p className="mt-1 text-xs text-muted-foreground">Enter your postal code for Delivery Availability</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4">
                <RefreshCw className="mt-0.5 h-6 w-6 text-foreground shrink-0" />
                <div>
                  <p className="text-sm font-medium text-foreground">Return Delivery</p>
                  <p className="mt-1 text-xs text-muted-foreground">Free 30 Days Delivery Returns. Details</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Related Items ── */}
        <section className="mt-16">
          <div className="mb-8 flex items-center gap-4">
            <span className="flex h-8 w-1 rounded-sm bg-[#DB4444]" />
            <span className="text-base font-semibold text-foreground">Related Item</span>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {(Array.isArray(list) ? list : []).slice(0, 4).map((p) => <RelatedCard key={p.id} product={p} />)}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
