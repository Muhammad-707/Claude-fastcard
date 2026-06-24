import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ChevronRight, ShoppingCart } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { fetchProducts } from '@/features/products/model/productsSlice'
import { addToCart } from '@/features/cart/model/cartSlice'
import { removeWishlist, selectWishlistIds } from '@/features/wishlist/model/wishlistSlice'
import { selectIsAuth } from '@/features/auth/model/authSlice'
import { ProductCard } from '@/entities/product-card'
import { EmptyState } from '@/shared/ui/empty-state'
import { Header } from '@/widgets/header'
import { Footer } from '@/widgets/footer'
import { toast } from 'sonner'

export default function WishlistPage() {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const wishlistIds = useAppSelector(selectWishlistIds)
  const { list: products } = useAppSelector((s) => s.products)
  const isAuth = useAppSelector(selectIsAuth)

  useEffect(() => {
    if (wishlistIds.length > 0) {
      dispatch(fetchProducts({ pageNumber: 1, pageSize: 50 }))
    }
  }, [dispatch, wishlistIds.length])

  const safeProducts = Array.isArray(products) ? products : []
  const wishlistProducts = safeProducts.filter((p) => wishlistIds.includes(p.id))

  const handleAddAllToCart = () => {
    if (!isAuth) { toast.error(t('auth.login')); return }
    wishlistProducts.forEach((p) => dispatch(addToCart(p.id)))
    toast.success(t('cart.added'))
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />

      <main className="mx-auto w-full max-w-[1170px] flex-1 px-4 py-8 xl:px-0">
        {/* Breadcrumb */}
        <nav className="mb-8 flex items-center gap-2 text-sm text-[#8D8D8D]">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-foreground">{t('wishlist.title')}</span>
        </nav>

        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-foreground">
            {t('wishlist.title')} ({wishlistIds.length})
          </h1>
          {wishlistIds.length > 0 && (
            <button
              onClick={handleAddAllToCart}
              className="flex items-center gap-2 rounded-[4px] border border-[#C4C4C4] px-6 py-2 text-sm font-medium text-foreground hover:border-primary hover:text-primary transition-colors"
            >
              <ShoppingCart className="h-4 w-4" />
              {t('wishlist.add_all_to_cart')}
            </button>
          )}
        </div>

        {wishlistIds.length === 0 && (
          <EmptyState
            title={t('wishlist.empty_title')}
            description={t('wishlist.empty_desc')}
            action={{ label: t('cart.continue_shopping'), onClick: () => navigate('/products') }}
          />
        )}

        {wishlistIds.length > 0 && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {wishlistProducts.length > 0
              ? wishlistProducts.map((p) => (
                  <div key={p.id} className="relative group">
                    <ProductCard product={p} />
                    <button
                      onClick={() => dispatch(removeWishlist(p.id))}
                      className="absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-white text-[#8D8D8D] shadow hover:text-primary transition-colors text-xs font-bold"
                      aria-label="Remove from wishlist"
                    >
                      ×
                    </button>
                  </div>
                ))
              : wishlistIds.map((id) => (
                  <div key={id} className="animate-pulse">
                    <div className="h-[260px] rounded-[4px] bg-[#F5F5F5]" />
                    <div className="mt-3 h-4 w-3/4 rounded bg-[#F5F5F5]" />
                    <div className="mt-2 h-3 w-1/2 rounded bg-[#F5F5F5]" />
                  </div>
                ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
