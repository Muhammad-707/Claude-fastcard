import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Heart, ShoppingCart, ChevronRight, Star, Truck, RefreshCw } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { fetchProductById, clearCurrent, fetchProducts } from '@/features/products/model/productsSlice'
import { addToCart } from '@/features/cart/model/cartSlice'
import { toggleWishlist, selectIsWishlisted } from '@/features/wishlist/model/wishlistSlice'
import { selectIsAuth } from '@/features/auth/model/authSlice'
import { ProductCard } from '@/entities/product-card'
import { NetworkError } from '@/shared/ui/network-error'
import { Header } from '@/widgets/header'
import { Footer } from '@/widgets/footer'
import { getImageUrl } from '@/shared/lib/image'
import { toast } from 'sonner'

export default function ProductDetailPage() {
  const { t } = useTranslation()
  const { id } = useParams<{ id: string }>()
  const dispatch = useAppDispatch()
  const { current: product, currentStatus, list } = useAppSelector((s) => s.products)
  const isAuth = useAppSelector(selectIsAuth)
  const wishlisted = useAppSelector(selectIsWishlisted(product?.id ?? 0))

  const [selectedImg, setSelectedImg] = useState(0)
  const [qty, setQty] = useState(1)

  useEffect(() => {
    if (id) dispatch(fetchProductById(Number(id)))
    dispatch(fetchProducts({ pageNumber: 1, pageSize: 8 }))
    return () => { dispatch(clearCurrent()) }
  }, [dispatch, id])

  const handleAddToCart = () => {
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
        <main className="mx-auto w-full max-w-[1170px] flex-1 px-4 py-10 xl:px-0">
          <div className="flex animate-pulse gap-10">
            <div className="flex gap-3">
              <div className="flex flex-col gap-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-[120px] w-[120px] rounded-[4px] bg-[#F5F5F5]" />
                ))}
              </div>
              <div className="h-[500px] w-[500px] rounded-[4px] bg-[#F5F5F5]" />
            </div>
            <div className="flex-1 space-y-4">
              <div className="h-8 w-3/4 rounded bg-[#F5F5F5]" />
              <div className="h-6 w-1/4 rounded bg-[#F5F5F5]" />
              <div className="h-24 rounded bg-[#F5F5F5]" />
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
  const discountPct = product.hasDiscount && product.discountPrice
    ? Math.round((1 - product.discountPrice / product.price) * 100)
    : null
  const images = product.images ?? []

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />

      <main className="mx-auto w-full max-w-[1170px] flex-1 px-4 py-8 xl:px-0">
        {/* Breadcrumb */}
        <nav className="mb-8 flex items-center gap-2 text-sm text-[#8D8D8D]">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link to="/products" className="hover:text-primary transition-colors">{t('products.title')}</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-foreground line-clamp-1 max-w-[200px]">{product.productName}</span>
        </nav>

        {/* Product layout */}
        <div className="flex flex-col gap-8 lg:flex-row">
          {/* ── Gallery ── */}
          <div className="flex gap-4">
            {/* Thumbnails */}
            <div className="flex flex-col gap-3">
              {images.slice(0, 4).map((img, i) => (
                <button
                  key={img.id}
                  onClick={() => setSelectedImg(i)}
                  className={`h-[120px] w-[120px] overflow-hidden rounded-[4px] bg-[#F5F5F5] transition-all ${
                    selectedImg === i ? 'ring-2 ring-primary' : 'hover:ring-1 hover:ring-[#C4C4C4]'
                  }`}
                >
                  <img
                    src={getImageUrl(img.imageName)}
                    alt={product.productName}
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>

            {/* Main image */}
            <div className="relative overflow-hidden rounded-[4px] bg-[#F5F5F5]">
              <img
                src={getImageUrl(images[selectedImg]?.imageName)}
                alt={product.productName}
                className="h-[500px] w-[500px] max-w-[min(100vw-2rem,500px)] object-cover object-center"
              />
              {discountPct && (
                <span className="absolute left-3 top-3 rounded-[4px] bg-primary px-3 py-1 text-xs font-medium text-white">
                  -{discountPct}%
                </span>
              )}
            </div>
          </div>

          {/* ── Info panel ── */}
          <div className="flex-1">
            <h1 className="text-2xl font-semibold text-foreground">{product.productName}</h1>

            {/* Rating */}
            <div className="mt-2 flex items-center gap-2">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className={`h-4 w-4 ${s <= 4 ? 'fill-[#FFAD33] text-[#FFAD33]' : 'text-[#EBEBEB] fill-[#EBEBEB]'}`} />
                ))}
              </div>
              <span className="text-sm text-[#8D8D8D]">(150 Reviews)</span>
              <span className="text-[#8D8D8D]">|</span>
              <span className="text-sm text-[#00FF66]">In Stock</span>
            </div>

            {/* Price */}
            <div className="mt-4 flex items-center gap-3">
              <span className="text-2xl font-medium text-foreground">${price}</span>
              {product.hasDiscount && (
                <span className="text-lg text-[#8D8D8D] line-through">${product.price}</span>
              )}
            </div>

            <div className="my-4 h-px bg-[#EBEBEB]" />

            {/* Description */}
            <p className="text-sm leading-6 text-[#8D8D8D]">{product.description}</p>

            {/* Color */}
            {product.colorName && (
              <div className="mt-4">
                <span className="text-sm font-medium text-foreground">Colour: </span>
                <span className="text-sm text-foreground">{product.colorName}</span>
              </div>
            )}

            {/* Brand */}
            {product.brandName && (
              <div className="mt-2">
                <span className="text-sm font-medium text-foreground">Brand: </span>
                <span className="text-sm text-foreground">{product.brandName}</span>
              </div>
            )}

            {/* Quantity + actions */}
            <div className="mt-6 flex flex-wrap items-center gap-4">
              {/* Qty control */}
              <div className="flex items-center rounded-[4px] border border-[#C4C4C4]">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="flex h-11 w-11 items-center justify-center text-foreground hover:bg-[#F5F5F5] transition-colors text-lg"
                >
                  -
                </button>
                <span className="w-10 text-center text-sm font-medium">{qty}</span>
                <button
                  onClick={() => setQty((q) => Math.min(product.quantity, q + 1))}
                  className="flex h-11 w-11 items-center justify-center bg-primary text-white hover:opacity-90 transition-opacity text-lg"
                >
                  +
                </button>
              </div>

              {/* Add to cart */}
              <button
                onClick={handleAddToCart}
                className="flex h-11 items-center gap-2 rounded-[4px] bg-primary px-8 text-sm font-medium text-white hover:opacity-90 transition-opacity"
              >
                <ShoppingCart className="h-4 w-4" />
                {t('cart.add_to_cart')}
              </button>

              {/* Wishlist */}
              <button
                onClick={handleWishlist}
                className={`flex h-11 w-11 items-center justify-center rounded-[4px] border transition-colors ${
                  wishlisted
                    ? 'border-primary bg-primary text-white'
                    : 'border-[#C4C4C4] text-foreground hover:border-primary hover:text-primary'
                }`}
                aria-label="Wishlist"
              >
                <Heart className="h-5 w-5" fill={wishlisted ? 'currentColor' : 'none'} />
              </button>
            </div>

            {/* Delivery info */}
            <div className="mt-6 rounded-[4px] border border-[#EBEBEB]">
              <div className="flex items-start gap-4 p-4 border-b border-[#EBEBEB]">
                <Truck className="mt-0.5 h-6 w-6 text-foreground shrink-0" />
                <div>
                  <p className="text-sm font-medium text-foreground">Free Delivery</p>
                  <p className="mt-1 text-xs text-[#8D8D8D]">Enter your postal code for delivery availability</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4">
                <RefreshCw className="mt-0.5 h-6 w-6 text-foreground shrink-0" />
                <div>
                  <p className="text-sm font-medium text-foreground">Return Delivery</p>
                  <p className="mt-1 text-xs text-[#8D8D8D]">Free 30 Days Delivery Returns. Details</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Related products ── */}
        <section className="mt-16">
          <div className="flex items-center gap-4">
            <span className="flex h-5 w-1 rounded-sm bg-primary" />
            <span className="text-sm font-semibold text-primary">Related Items</span>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {list.slice(0, 4).map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
