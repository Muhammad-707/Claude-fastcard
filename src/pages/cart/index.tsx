import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
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
  const [coupon, setCoupon] = useState('')

  useEffect(() => { dispatch(fetchCart()) }, [dispatch])

  const handleClear = () => { dispatch(clearCart()); setConfirmClear(false) }
  const handleRemove = (productId: number) => { dispatch(removeFromCart(productId)); setConfirmRemoveId(null) }

  const handleQtyChange = (productId: number, newQty: number, currentQty: number) => {
    if (newQty < 1) return
    if (newQty > currentQty) dispatch(increaseCart(productId))
    else dispatch(reduceCart(productId))
  }

  const safeItems = Array.isArray(items) ? items : []

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />

      <main className="mx-auto w-full max-w-[1170px] flex-1 px-4 py-8 xl:px-0">
        {/* Breadcrumb */}
        <nav className="mb-10 flex items-center gap-2 text-sm text-muted-foreground">
          <Link to="/" className="transition-colors hover:text-foreground">{t('nav.home')}</Link>
          <span>/</span>
          <span className="text-foreground">{t('cart.title')}</span>
        </nav>

        {status === 'loading' && (
          <div className="animate-pulse space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-4 rounded-[4px] bg-muted p-4">
                <div className="h-[70px] w-[70px] rounded bg-muted-foreground/20" />
                <div className="flex-1 space-y-2 pt-1">
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
          <>
            {/* ── Table ── */}
            <div className="rounded-[4px] shadow-sm">
              {/* Table header */}
              <div className="hidden grid-cols-[2fr_1fr_1fr_1fr_40px] items-center gap-4 rounded-[4px] bg-background px-6 py-4 shadow-sm sm:grid">
                <span className="text-sm font-medium text-foreground">{t('cart.col_product')}</span>
                <span className="text-center text-sm font-medium text-foreground">{t('cart.col_price')}</span>
                <span className="text-center text-sm font-medium text-foreground">{t('cart.col_quantity')}</span>
                <span className="text-center text-sm font-medium text-foreground">{t('cart.col_subtotal')}</span>
                <span />
              </div>

              {/* Rows */}
              <div className="mt-3 space-y-3">
                {safeItems.map((item) => {
                  const price = item.product.hasDiscount
                    ? item.product.discountPrice ?? item.product.price
                    : item.product.price
                  const subtotal = price * item.quantity
                  const img = item.product.images?.[0]?.imageName

                  return (
                    <div
                      key={item.productId}
                      className="grid grid-cols-[auto_1fr] items-center gap-4 rounded-[4px] bg-background px-6 py-5 shadow-sm sm:grid-cols-[2fr_1fr_1fr_1fr_40px]"
                    >
                      {/* Product */}
                      <div className="flex items-center gap-4">
                        <div className="h-[70px] w-[70px] shrink-0 overflow-hidden rounded-[4px] bg-muted">
                          <img
                            src={getImageUrl(img)}
                            alt={item.product.productName}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <p className="line-clamp-2 text-sm text-foreground">
                          {item.product.productName}
                        </p>
                      </div>

                      {/* Price */}
                      <div className="hidden text-center sm:block">
                        <span className="text-sm text-foreground">${price.toFixed(2)}</span>
                      </div>

                      {/* Quantity — spinner input */}
                      <div className="flex items-center justify-center">
                        <input
                          type="number"
                          min={1}
                          value={item.quantity}
                          onChange={(e) => handleQtyChange(item.productId, Number(e.target.value), item.quantity)}
                          className="w-[72px] rounded-[4px] border border-border bg-background py-1.5 text-center text-sm text-foreground outline-none focus:border-foreground [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-auto [&::-webkit-inner-spin-button]:appearance-auto"
                        />
                      </div>

                      {/* Subtotal */}
                      <div className="hidden text-center sm:block">
                        <span className="text-sm font-medium text-foreground">${subtotal.toFixed(2)}</span>
                      </div>

                      {/* Remove — red filled circle × */}
                      <div className="flex justify-end sm:justify-center">
                        <button
                          onClick={() => setConfirmRemoveId(item.productId)}
                          className="flex h-7 w-7 items-center justify-center rounded-full bg-[#DB4444] text-white hover:opacity-90 transition-opacity"
                          aria-label={t('cart.remove')}
                        >
                          <span className="text-base font-medium leading-none">×</span>
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* ── Actions row ── */}
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
              <Link
                to="/products"
                className="rounded-[4px] border border-border px-8 py-3 text-sm font-medium text-foreground transition-colors hover:border-foreground"
              >
                {t('cart.return_to_shop')}
              </Link>
              <div className="flex gap-3">
                <button
                  className="rounded-[4px] border border-border px-8 py-3 text-sm font-medium text-foreground transition-colors hover:border-foreground"
                >
                  {t('cart.update_cart')}
                </button>
                <button
                  onClick={() => setConfirmClear(true)}
                  className="rounded-[4px] border border-[#DB4444] px-8 py-3 text-sm font-medium text-[#DB4444] transition-colors hover:bg-[#DB4444] hover:text-white"
                >
                  {t('cart.remove_all')}
                </button>
              </div>
            </div>

            {/* ── Bottom: Coupon (left) + Cart Total (right) ── */}
            <div className="mt-10 flex flex-col gap-8 lg:flex-row lg:items-start">
              {/* Coupon code */}
              <div className="flex flex-1 gap-4">
                <input
                  type="text"
                  value={coupon}
                  onChange={(e) => setCoupon(e.target.value)}
                  placeholder={t('cart.coupon_placeholder')}
                  className="flex-1 rounded-[4px] border border-border bg-background px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-foreground"
                />
                <button className="rounded-[4px] border border-[#DB4444] px-6 py-3 text-sm font-medium text-[#DB4444] transition-colors hover:bg-[#DB4444] hover:text-white">
                  {t('cart.apply_coupon')}
                </button>
              </div>

              {/* Cart Total */}
              <div className="w-full rounded-[4px] border border-border p-6 lg:w-[420px] lg:shrink-0">
                <h2 className="text-base font-semibold text-foreground">{t('cart.cart_total')}</h2>

                <div className="mt-4 space-y-3">
                  <div className="flex justify-between border-b border-border pb-3 text-sm">
                    <span className="text-foreground">{t('cart.subtotal')}:</span>
                    <span className="font-medium text-foreground">${total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between border-b border-border pb-3 text-sm">
                    <span className="text-foreground">{t('cart.shipping')}:</span>
                    <span className="font-medium text-foreground">{t('cart.free_shipping')}</span>
                  </div>
                  <div className="flex justify-between text-sm font-semibold">
                    <span className="text-foreground">{t('cart.total')}:</span>
                    <span className="text-foreground">${total.toFixed(2)}</span>
                  </div>
                </div>

                <Link
                  to="/checkout"
                  className="mt-5 flex w-full items-center justify-center rounded-[4px] bg-[#DB4444] py-4 text-sm font-medium text-white transition-opacity hover:opacity-90"
                >
                  {t('cart.proceed_to_checkout')}
                </Link>
              </div>
            </div>
          </>
        )}
      </main>

      <Footer />

      <ConfirmDialog
        open={confirmClear}
        title={t('cart.clear_cart')}
        description={t('cart.clear_confirm')}
        confirmLabel={t('cart.remove_all')}
        onConfirm={handleClear}
        onCancel={() => setConfirmClear(false)}
        destructive
      />
      <ConfirmDialog
        open={confirmRemoveId !== null}
        title={t('cart.remove')}
        description={t('cart.remove_confirm')}
        confirmLabel={t('cart.remove')}
        onConfirm={() => confirmRemoveId !== null && handleRemove(confirmRemoveId)}
        onCancel={() => setConfirmRemoveId(null)}
        destructive
      />
    </div>
  )
}
