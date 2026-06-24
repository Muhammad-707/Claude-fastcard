import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Trash2, ChevronRight, Minus, Plus } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import {
  fetchCart,
  increaseCart,
  reduceCart,
  removeFromCart,
  clearCart,
  selectCartTotal,
} from '@/features/cart/model/cartSlice'
import { NetworkError } from '@/shared/ui/network-error'
import { EmptyState } from '@/shared/ui/empty-state'
import { ConfirmDialog } from '@/shared/ui/confirm-dialog'
import { Header } from '@/widgets/header'
import { Footer } from '@/widgets/footer'
import { getImageUrl } from '@/shared/lib/image'

export default function CartPage() {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { items, status } = useAppSelector((s) => s.cart)
  const total = useAppSelector(selectCartTotal)
  const [confirmClear, setConfirmClear] = useState(false)
  const [confirmRemoveId, setConfirmRemoveId] = useState<number | null>(null)

  useEffect(() => { dispatch(fetchCart()) }, [dispatch])

  const handleClear = () => {
    dispatch(clearCart())
    setConfirmClear(false)
  }

  const handleRemove = (productId: number) => {
    dispatch(removeFromCart(productId))
    setConfirmRemoveId(null)
  }

  const safeItems = Array.isArray(items) ? items : []

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />

      <main className="mx-auto w-full max-w-[1170px] flex-1 px-4 py-8 xl:px-0">
        {/* Breadcrumb */}
        <nav className="mb-8 flex items-center gap-2 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-[#DB4444] transition-colors">{t('nav.home')}</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-foreground">{t('cart.title')}</span>
        </nav>

        {status === 'loading' && (
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-4 rounded-[4px] bg-muted p-4">
                <div className="h-20 w-20 rounded bg-muted-foreground/20" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 rounded bg-muted-foreground/20" />
                  <div className="h-3 w-1/2 rounded bg-muted-foreground/20" />
                </div>
              </div>
            ))}
          </div>
        )}

        {status === 'error' && <NetworkError onRetry={() => dispatch(fetchCart())} />}

        {status === 'success' && safeItems.length === 0 && (
          <EmptyState
            title={t('cart.empty_title')}
            description={t('cart.empty_desc')}
            action={{ label: t('cart.continue_shopping'), onClick: () => navigate('/products') }}
          />
        )}

        {status === 'success' && safeItems.length > 0 && (
          <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
            {/* ── Cart items ── */}
            <div className="flex-1">
              {/* Table header */}
              <div className="hidden grid-cols-[2fr_1fr_1fr_1fr_auto] items-center gap-4 rounded-t-[4px] bg-background px-4 py-3 shadow-sm sm:grid">
                <span className="text-sm font-medium text-foreground">Product</span>
                <span className="text-center text-sm font-medium text-foreground">Price</span>
                <span className="text-center text-sm font-medium text-foreground">Quantity</span>
                <span className="text-center text-sm font-medium text-foreground">Subtotal</span>
                <span />
              </div>

              <div className="mt-2 space-y-2">
                {safeItems.map((item) => {
                  const price = item.product.hasDiscount
                    ? item.product.discountPrice ?? item.product.price
                    : item.product.price
                  const subtotal = price * item.quantity
                  const img = item.product.images?.[0]?.imageName

                  return (
                    <div
                      key={item.productId}
                      className="grid grid-cols-[auto_1fr] items-center gap-4 rounded-[4px] border border-border bg-background px-4 py-4 shadow-sm sm:grid-cols-[2fr_1fr_1fr_1fr_auto]"
                    >
                      {/* Product */}
                      <div className="col-span-1 flex items-center gap-4">
                        <div className="h-[60px] w-[60px] shrink-0 overflow-hidden rounded-[4px] bg-muted">
                          <img
                            src={getImageUrl(img)}
                            alt={item.product.productName}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <p className="line-clamp-2 text-sm font-medium text-foreground">
                          {item.product.productName}
                        </p>
                      </div>

                      {/* Price */}
                      <div className="hidden text-center sm:block">
                        <span className="text-sm text-foreground">${price}</span>
                      </div>

                      {/* Quantity */}
                      <div className="flex items-center justify-center">
                        <div className="flex items-center rounded-[4px] border border-border">
                          <button
                            onClick={() => dispatch(reduceCart(item.productId))}
                            className="flex h-8 w-8 items-center justify-center text-foreground hover:bg-muted transition-colors"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="w-8 text-center text-sm">{item.quantity}</span>
                          <button
                            onClick={() => dispatch(increaseCart(item.productId))}
                            className="flex h-8 w-8 items-center justify-center text-foreground hover:bg-muted transition-colors"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Subtotal */}
                      <div className="hidden text-center sm:block">
                        <span className="text-sm font-medium text-foreground">${subtotal.toFixed(2)}</span>
                      </div>

                      {/* Remove */}
                      <button
                        onClick={() => setConfirmRemoveId(item.productId)}
                        className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:text-[#DB4444] transition-colors"
                        aria-label={t('cart.remove')}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )
                })}
              </div>

              {/* Actions */}
              <div className="mt-4 flex justify-between">
                <Link
                  to="/products"
                  className="rounded-[4px] border border-border px-6 py-2 text-sm font-medium text-foreground hover:border-[#DB4444] hover:text-[#DB4444] transition-colors"
                >
                  {t('cart.continue_shopping')}
                </Link>
                <button
                  onClick={() => setConfirmClear(true)}
                  className="rounded-[4px] border border-border px-6 py-2 text-sm font-medium text-foreground hover:border-[#DB4444] hover:text-[#DB4444] transition-colors"
                >
                  {t('cart.clear_cart')}
                </button>
              </div>
            </div>

            {/* ── Order summary ── */}
            <div className="w-full lg:w-[325px] lg:shrink-0">
              <div className="rounded-[4px] border border-border p-5">
                <h2 className="text-base font-semibold text-foreground">{t('checkout.order_summary')}</h2>

                <div className="mt-4 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t('cart.subtotal')}</span>
                    <span className="font-medium text-foreground">${total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t('cart.shipping')}</span>
                    <span className="font-medium text-[#00FF66]">{t('cart.free_shipping')}</span>
                  </div>
                  <div className="h-px bg-border" />
                  <div className="flex justify-between text-sm font-semibold">
                    <span className="text-foreground">{t('cart.total')}</span>
                    <span className="text-foreground">${total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Coupon */}
                <div className="mt-4 flex gap-2">
                  <input
                    type="text"
                    placeholder={t('cart.coupon_placeholder')}
                    className="flex-1 rounded-[4px] border border-border bg-background px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-[#DB4444]"
                  />
                  <button className="rounded-[4px] bg-[#DB4444] px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity">
                    {t('cart.apply_coupon')}
                  </button>
                </div>

                <Link
                  to="/checkout"
                  className="mt-4 flex w-full items-center justify-center rounded-[4px] bg-[#DB4444] py-3 text-sm font-medium text-white hover:opacity-90 transition-opacity"
                >
                  {t('cart.checkout')}
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />

      <ConfirmDialog
        open={confirmClear}
        title={t('cart.clear_cart')}
        description={t('cart.clear_confirm')}
        confirmLabel={t('cart.clear_cart')}
        onConfirm={handleClear}
        onCancel={() => setConfirmClear(false)}
        destructive
      />
      <ConfirmDialog
        open={confirmRemoveId !== null}
        title={t('cart.remove')}
        description="Remove this item from your cart?"
        confirmLabel={t('cart.remove')}
        onConfirm={() => confirmRemoveId !== null && handleRemove(confirmRemoveId)}
        onCancel={() => setConfirmRemoveId(null)}
        destructive
      />
    </div>
  )
}
