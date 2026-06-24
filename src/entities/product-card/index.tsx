import { Link } from 'react-router-dom'
import { Heart, ShoppingCart, Eye } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { addToCart } from '@/features/cart/model/cartSlice'
import { toggleWishlist, selectIsWishlisted } from '@/features/wishlist/model/wishlistSlice'
import { selectIsAuth } from '@/features/auth/model/authSlice'
import { getImageUrl } from '@/shared/lib/image'
import type { Product } from '@/shared/api/types'
import { toast } from 'sonner'

interface ProductCardProps {
  product: Product
  showBadge?: 'new' | 'sale' | null
}

export function ProductCard({ product, showBadge }: ProductCardProps) {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const isAuth = useAppSelector(selectIsAuth)
  const wishlisted = useAppSelector(selectIsWishlisted(product.id))

  const price = product.hasDiscount ? product.discountPrice ?? product.price : product.price
  const image = product.images?.[0]?.imageName

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    if (!isAuth) { toast.error(t('auth.login')); return }
    dispatch(addToCart(product.id))
    toast.success(t('cart.added'))
  }

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault()
    dispatch(toggleWishlist(product.id))
  }

  const discountPct = product.hasDiscount && product.discountPrice
    ? Math.round((1 - product.discountPrice / product.price) * 100)
    : null

  return (
    <Link to={`/product/${product.id}`} className="group block">
      {/* Image */}
      <div className="relative overflow-hidden rounded-[4px] bg-[#F5F5F5]">
        <img
          src={getImageUrl(image)}
          alt={product.productName}
          className="h-[260px] w-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />

        {/* Badge */}
        {showBadge === 'new' && (
          <span className="absolute left-3 top-3 rounded-[4px] bg-[#00FF66] px-3 py-1 text-xs font-medium text-black">
            NEW
          </span>
        )}
        {(showBadge === 'sale' || discountPct) && (
          <span className="absolute left-3 top-3 rounded-[4px] bg-primary px-3 py-1 text-xs font-medium text-white">
            -{discountPct}%
          </span>
        )}

        {/* Hover actions */}
        <div className="absolute right-3 top-3 flex flex-col gap-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <button
            onClick={handleWishlist}
            className={`flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-sm transition-colors ${
              wishlisted ? 'text-primary' : 'text-foreground hover:text-primary'
            }`}
            aria-label="Wishlist"
          >
            <Heart className="h-4 w-4" fill={wishlisted ? 'currentColor' : 'none'} />
          </button>
          <Link
            to={`/product/${product.id}`}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-sm text-foreground hover:text-primary transition-colors"
            aria-label="View"
          >
            <Eye className="h-4 w-4" />
          </Link>
        </div>

        {/* Add to cart on hover */}
        <button
          onClick={handleAddToCart}
          className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-2 bg-black py-2.5 text-xs font-medium text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100"
        >
          <ShoppingCart className="h-4 w-4" />
          {t('cart.add_to_cart')}
        </button>
      </div>

      {/* Info */}
      <div className="mt-3 space-y-1">
        <p className="text-sm font-medium text-foreground line-clamp-1">{product.productName}</p>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-primary">${price}</span>
          {product.hasDiscount && (
            <span className="text-sm text-[#8D8D8D] line-through">${product.price}</span>
          )}
        </div>
        {/* Static 4-star rating */}
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((s) => (
            <svg key={s} viewBox="0 0 16 16" fill={s <= 4 ? '#FFAD33' : 'none'} stroke="#FFAD33" className="h-3.5 w-3.5">
              <path d="M8 1l1.8 3.6L14 5.3l-3 2.9.7 4.1L8 10.3l-3.7 1.9.7-4.1-3-2.9 4.2-.6z" />
            </svg>
          ))}
          <span className="text-xs text-[#8D8D8D]">(88)</span>
        </div>
      </div>
    </Link>
  )
}
