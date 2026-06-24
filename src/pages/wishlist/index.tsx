import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Trash2, ShoppingCart, Star, Eye } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { fetchProducts, setFilters } from '@/features/products/model/productsSlice'
import { addToCart } from '@/features/cart/model/cartSlice'
import { removeWishlist, selectWishlistIds } from '@/features/wishlist/model/wishlistSlice'
import { selectIsAuth } from '@/features/auth/model/authSlice'
import { EmptyState } from '@/shared/ui/empty-state'
import { Header } from '@/widgets/header'
import { Footer } from '@/widgets/footer'
import { getImageUrl } from '@/shared/lib/image'
import { toast } from 'sonner'
import type { Product } from '@/shared/api/types'

function WishlistCard({ product, onRemove, onAddToCart }: {
  product: Product
  onRemove: () => void
  onAddToCart: () => void
}) {
  const { t } = useTranslation()
  const price = product.hasDiscount ? product.discountPrice ?? product.price : product.price
  const img = product.images?.[0]?.imageName
  const discountPct = product.hasDiscount && product.discountPrice
    ? Math.round((1 - product.discountPrice / product.price) * 100)
    : null

  return (
    <div className="group flex flex-col">
      {/* Image area */}
      <div className="relative overflow-hidden rounded-[4px] bg-muted">
        <Link to={`/product/${product.id}`}>
          <img
            src={getImageUrl(img)}
            alt={product.productName}
            className="h-[180px] w-full object-cover sm:h-[220px]"
          />
        </Link>
        {/* Discount badge */}
        {discountPct && (
          <span className="absolute left-3 top-3 rounded-[4px] bg-[#DB4444] px-2 py-0.5 text-[10px] font-medium text-white">
            -{discountPct}%
          </span>
        )}
        {/* Trash icon */}
        <button
          onClick={onRemove}
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-background shadow transition-colors hover:bg-[#DB4444] hover:text-white"
          aria-label={t('wishlist.remove')}
        >
          <Trash2 className="h-4 w-4" />
        </button>
        {/* Add To Cart bar */}
        <button
          onClick={onAddToCart}
          className="absolute bottom-0 left-0 right-0 flex items-center justify-center gap-2 bg-black py-2.5 text-xs font-medium text-white transition-opacity hover:opacity-90"
        >
          <ShoppingCart className="h-3.5 w-3.5" />
          {t('cart.add_to_cart')}
        </button>
      </div>
      {/* Info */}
      <div className="mt-2 px-0.5">
        <p className="line-clamp-1 text-sm font-medium text-foreground">{product.productName}</p>
        <div className="mt-1 flex items-center gap-2">
          <span className="text-sm font-semibold text-[#DB4444]">${price}</span>
          {product.hasDiscount && (
            <span className="text-sm text-muted-foreground line-through">${product.price}</span>
          )}
        </div>
      </div>
    </div>
  )
}

function JustForYouCard({ product }: { product: Product }) {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const isAuth = useAppSelector(selectIsAuth)
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
    <div className="group flex flex-col">
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
        {product.quantity > 0 && !discountPct && (
          <span className="absolute left-3 top-3 rounded-[4px] bg-[#00FF66] px-2 py-0.5 text-[10px] font-medium text-black">NEW</span>
        )}
        <button
          onClick={() => {}}
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-background shadow transition-colors hover:bg-muted"
          aria-label="Quick view"
        >
          <Eye className="h-4 w-4 text-foreground" />
        </button>
        <button
          onClick={handleAddToCart}
          className="absolute bottom-0 left-0 right-0 flex items-center justify-center gap-2 bg-black py-2.5 text-xs font-medium text-white transition-opacity hover:opacity-90"
        >
          <ShoppingCart className="h-3.5 w-3.5" />
          {t('cart.add_to_cart')}
        </button>
      </div>
      <div className="mt-2 px-0.5">
        <p className="line-clamp-1 text-sm font-medium text-foreground">{product.productName}</p>
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
          <span className="text-[10px] text-muted-foreground">(65)</span>
        </div>
      </div>
    </div>
  )
}

export default function WishlistPage() {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const wishlistIds = useAppSelector(selectWishlistIds)
  const { list: products } = useAppSelector((s) => s.products)
  const isAuth = useAppSelector(selectIsAuth)

  useEffect(() => {
    dispatch(fetchProducts({ pageNumber: 1, pageSize: 20 }))
  }, [dispatch])

  const safeProducts = Array.isArray(products) ? products : []
  const wishlistProducts = safeProducts.filter((p) => wishlistIds.includes(p.id))
  const justForYou = safeProducts.filter((p) => !wishlistIds.includes(p.id)).slice(0, 4)

  const handleAddAllToCart = () => {
    if (!isAuth) { toast.error(t('auth.login')); return }
    wishlistProducts.forEach((p) => { dispatch(addToCart(p.id)) })
    toast.success(t('cart.added'))
  }

  const handleAddToCart = (product: Product) => {
    if (!isAuth) { toast.error(t('auth.login')); return }
    dispatch(addToCart(product.id))
    toast.success(t('cart.added'))
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />

      <main className="mx-auto w-full max-w-[1280px] flex-1 px-4 py-8 xl:px-0">

        {wishlistIds.length === 0 ? (
          <EmptyState
            title={t('wishlist.empty_title')}
            description={t('wishlist.empty_desc')}
            action={{ label: t('cart.continue_shopping'), onClick: () => navigate('/products') }}
          />
        ) : (
          <>
            {/* Wishlist header */}
            <div className="mb-8 flex items-center justify-between">
              <h1 className="text-xl font-medium text-foreground">
                {t('wishlist.title')} ({wishlistIds.length})
              </h1>
              <button
                onClick={handleAddAllToCart}
                className="rounded-[4px] border border-foreground px-6 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-foreground hover:text-background"
              >
                {t('wishlist.move_all_to_bag')}
              </button>
            </div>

            {/* Wishlist grid */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {wishlistProducts.length > 0
                ? wishlistProducts.map((p) => (
                    <WishlistCard
                      key={p.id}
                      product={p}
                      onRemove={() => dispatch(removeWishlist(p.id))}
                      onAddToCart={() => handleAddToCart(p)}
                    />
                  ))
                : wishlistIds.map((id) => (
                    <div key={id} className="animate-pulse">
                      <div className="h-[220px] rounded-[4px] bg-muted" />
                      <div className="mt-2 h-4 w-3/4 rounded bg-muted" />
                      <div className="mt-1 h-3 w-1/2 rounded bg-muted" />
                    </div>
                  ))}
            </div>
          </>
        )}

        {/* ── Just For You ── */}
        {justForYou.length > 0 && (
          <section className="mt-16">
            <div className="mb-8 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="flex h-8 w-1 rounded-sm bg-[#DB4444]" />
                <span className="text-base font-semibold text-foreground">{t('wishlist.just_for_you')}</span>
              </div>
              <Link
                to="/products"
                onClick={() => { dispatch(setFilters({})) }}
                className="rounded-[4px] border border-border px-6 py-2.5 text-sm font-medium text-foreground transition-colors hover:border-foreground"
              >
                {t('wishlist.see_all')}
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {justForYou.map((p) => <JustForYouCard key={p.id} product={p} />)}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  )
}
