import { Link, useNavigate } from 'react-router-dom'
import { Heart, ShoppingCart, Eye } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { addToCart } from '@/features/cart/model/cartSlice'
import { toggleWishlist, selectIsWishlisted } from '@/features/wishlist/model/wishlistSlice'
import { selectIsAuth } from '@/features/auth/model/authSlice'
import { getImageUrl, IMAGE_PLACEHOLDER } from '@/shared/lib/image'
import type { Product } from '@/shared/api/types'
import { toast } from 'sonner'

interface ProductCardProps {
  product: Product
  showBadge?: 'new' | 'sale' | null
}

export function ProductCard({ product, showBadge }: ProductCardProps) {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const isAuth = useAppSelector(selectIsAuth)
  const wishlisted = useAppSelector(selectIsWishlisted(product.id))

  const price = product.hasDiscount ? product.discountPrice ?? product.price : product.price
  const image = product.image ?? product.images?.[0]?.images ?? product.images?.[0]?.imageName

  const discountPct =
    product.hasDiscount && product.discountPrice
      ? Math.round((1 - product.discountPrice / product.price) * 100)
      : null

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!isAuth) {
      toast.error(t('auth.login'))
      return
    }
    dispatch(addToCart({ productId: product.id, product }))
    toast.success(t('cart.added'))
  }

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    dispatch(toggleWishlist(product))
    if (wishlisted) {
      toast.info(t('wishlist.removed'))
    } else {
      toast.success(t('wishlist.added'))
    }
  }

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    navigate(`/product/${product.id}`)
  }

  return (
    <div className="group relative transition-transform duration-300 hover:-translate-y-1">
      {/* ── Image container ─────────────────────────────────────────────
          The <Link> wraps ONLY the <img> so its click navigates.
          Action buttons (wishlist, quick-view, add-to-cart) are DOM
          siblings of the <Link> — their clicks never bubble into it. */}
      <div className="relative overflow-hidden rounded-[4px] bg-[#F5F5F5]">
        {/* Navigation target — image only */}
        <Link to={`/product/${product.id}`} className="block">
          <img
            src={getImageUrl(image)}
            alt={product.productName}
            className="h-[180px] w-full object-cover object-center transition-transform duration-300 group-hover:scale-105 sm:h-[220px] lg:h-[260px]"
            loading="lazy"
            onError={(e) => {
              ;(e.target as HTMLImageElement).src = IMAGE_PLACEHOLDER
            }}
          />
        </Link>

        {/* Badge — non-interactive overlay */}
        {showBadge === 'new' && (
          <span className="pointer-events-none absolute left-2 top-2 rounded-[4px] bg-[#00FF66] px-2.5 py-1 text-[10px] font-semibold text-black sm:left-3 sm:top-3 sm:px-3 sm:text-xs">
            NEW
          </span>
        )}
        {(showBadge === 'sale' || (!showBadge && discountPct)) && discountPct && (
          <span className="pointer-events-none absolute left-2 top-2 rounded-[4px] bg-[#DB4444] px-2.5 py-1 text-[10px] font-semibold text-white sm:left-3 sm:top-3 sm:px-3 sm:text-xs">
            -{discountPct}%
          </span>
        )}

        {/* Hover icons — top-right, outside the Link */}
        <div className="absolute right-2 top-2 flex flex-col gap-1.5 opacity-0 transition-opacity duration-200 group-hover:opacity-100 sm:right-3 sm:top-3 sm:gap-2">
          <button
            type="button"
            onClick={handleWishlist}
            className={`flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-md transition-colors sm:h-9 sm:w-9 ${
              wishlisted ? 'text-[#DB4444]' : 'text-foreground hover:text-[#DB4444]'
            }`}
            aria-label="Wishlist"
          >
            <Heart className="h-3.5 w-3.5 sm:h-4 sm:w-4" fill={wishlisted ? 'currentColor' : 'none'} />
          </button>
          <button
            type="button"
            onClick={handleQuickView}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-md text-foreground transition-colors hover:text-[#DB4444] sm:h-9 sm:w-9"
            aria-label="Quick View"
          >
            <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </button>
        </div>

        {/* Add to cart bar — bottom overlay, outside the Link */}
        <button
          type="button"
          onClick={handleAddToCart}
          className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-1.5 bg-black py-2 text-[10px] font-semibold tracking-wide text-white opacity-0 transition-all duration-200 group-hover:opacity-100 sm:gap-2 sm:py-3 sm:text-xs"
        >
          <ShoppingCart className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          <span className="hidden sm:inline">{t('cart.add_to_cart')}</span>
          <span className="sm:hidden">Add</span>
        </button>
      </div>

      {/* ── Info section ──────────────────────────────────────────────── */}
      <div className="mt-2 space-y-1 sm:mt-3 sm:space-y-1.5">
        <Link to={`/product/${product.id}`}>
          <p className="line-clamp-2 text-xs font-medium text-foreground transition-colors hover:text-[#DB4444] sm:text-sm">
            {product.productName}
          </p>
        </Link>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <span className="text-xs font-bold text-[#DB4444] sm:text-sm">${price}</span>
          {product.hasDiscount && product.price && (
            <span className="text-xs text-[#8D8D8D] line-through sm:text-sm">${product.price}</span>
          )}
        </div>
        <div className="hidden items-center gap-1 sm:flex">
          {[1, 2, 3, 4, 5].map((s) => (
            <svg
              key={s}
              viewBox="0 0 16 16"
              fill={s <= 4 ? '#FFAD33' : 'none'}
              stroke="#FFAD33"
              strokeWidth="0.5"
              className="h-3.5 w-3.5"
            >
              <path d="M8 1l1.8 3.6L14 5.3l-3 2.9.7 4.1L8 10.3l-3.7 1.9.7-4.1-3-2.9 4.2-.6z" />
            </svg>
          ))}
          <span className="text-xs text-[#8D8D8D]">(88)</span>
        </div>
      </div>
    </div>
  )
}
