import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Minus, Plus, X, ShoppingCart, ChevronRight } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import {
  fetchCart,
  increaseCart,
  reduceCart,
  removeFromCart,
  clearCart,
  increaseQtyLocal,
  decreaseQtyLocal,
  selectCartTotal,
} from '@/features/cart/model/cartSlice'
import { NetworkError } from '@/shared/ui/network-error'
import { ConfirmDialog } from '@/shared/ui/confirm-dialog'
import { Header } from '@/widgets/header'
import { Footer } from '@/widgets/footer'
import { getImageUrl, IMAGE_PLACEHOLDER } from '@/shared/lib/image'
import { toast } from 'sonner'

/* ── Skeleton ──────────────────────────────────────────────────────── */
function CartSkeleton() {
  return (
    <div className="animate-pulse space-y-2">
      <div className="hidden h-11 rounded-[4px] bg-muted sm:block" />
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center gap-4 rounded-[4px] bg-background px-5 py-3 shadow-sm">
          <div className="h-14 w-14 shrink-0 rounded-[4px] bg-muted" />
          <div className="flex flex-1 gap-6">
            <div className="h-4 w-2/5 rounded bg-muted" />
            <div className="h-4 w-1/5 rounded bg-muted" />
            <div className="h-8 w-24 rounded bg-muted" />
            <div className="h-4 w-1/5 rounded bg-muted" />
          </div>
        </div>
      ))}
    </div>
  )
}

/* ════════════════════════════════════════════════════════════════════ */
export default function CartPage() {
/* ════════════════════════════════════════════════════════════════════ */
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const { items, status, mutatingIds, clearing } = useAppSelector((s) => s.cart)
  const total = useAppSelector(selectCartTotal)

  const [confirmClear,    setConfirmClear]    = useState(false)
  const [confirmRemoveId, setConfirmRemoveId] = useState<number | null>(null)
  const [coupon,          setCoupon]          = useState('')

  useEffect(() => { dispatch(fetchCart()) }, [dispatch])

  const safeItems = (Array.isArray(items) ? items : []).filter((i) => i?.product != null)

  /* ── Handlers ── */

  /** Step 1: synchronous reducer → instant Redux + localStorage update.
   *  Step 2: fire-and-forget thunk → syncs backend, never touches state. */
  const handleIncrease = (productId: number) => {
    dispatch(increaseQtyLocal(productId))
    void dispatch(increaseCart(productId))
  }

  const handleDecrease = (productId: number, currentQty: number) => {
    if (currentQty <= 1) {
      setConfirmRemoveId(productId)
      return
    }
    dispatch(decreaseQtyLocal(productId))
    void dispatch(reduceCart(productId))
  }

  const handleRemove = (productId: number) => {
    dispatch(removeFromCart(productId))
    toast.info(t('cart.remove'))
    setConfirmRemoveId(null)
  }

  const handleClear = () => {
    dispatch(clearCart())
    toast.info(t('cart.clear_cart'))
    setConfirmClear(false)
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />

      <main className="mx-auto w-full max-w-[1280px] flex-1 px-4 py-10 xl:px-0">

        {/* Breadcrumb */}
        <nav className="mb-8 flex items-center gap-2 text-sm text-muted-foreground">
          <Link to="/" className="transition-colors hover:text-foreground">
            {t('nav.home')}
          </Link>
          <ChevronRight className="h-3.5 w-3.5 shrink-0" />
          <span className="font-medium text-foreground">{t('cart.title')}</span>
        </nav>

        {status === 'loading' && safeItems.length === 0 && <CartSkeleton />}

        {status === 'error' && (
          <NetworkError onRetry={() => dispatch(fetchCart())} />
        )}

        {status === 'success' && safeItems.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <ShoppingCart className="mb-6 h-16 w-16 text-muted-foreground/25" />
            <h2 className="text-3xl font-bold text-foreground">{t('cart.empty_title')}</h2>
            <p className="mt-3 text-sm text-muted-foreground">{t('cart.empty_desc')}</p>
            <button
              type="button"
              onClick={() => navigate('/products')}
              className="mt-8 rounded-[4px] bg-[#DB4444] px-10 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            >
              {t('cart.continue_shopping')}
            </button>
          </div>
        )}

        {/* ─── Cart content ────────────────────────────────────────── */}
        {safeItems.length > 0 && (
          <div className={clearing ? 'pointer-events-none opacity-50 transition-opacity' : 'transition-opacity'}>

            <div className="w-full overflow-x-auto">

              {/* Column headers */}
              <div className="hidden min-w-[680px] grid-cols-[2.5fr_1fr_148px_1fr_40px] items-center gap-4 rounded-[4px] bg-background px-5 py-3.5 shadow-sm sm:grid">
                <span className="text-sm font-semibold text-foreground">{t('cart.col_product')}</span>
                <span className="text-center text-sm font-semibold text-foreground">{t('cart.col_price')}</span>
                <span className="text-center text-sm font-semibold text-foreground">{t('cart.col_quantity')}</span>
                <span className="text-center text-sm font-semibold text-foreground">{t('cart.col_subtotal')}</span>
                <span />
              </div>

              {/* Item rows */}
              <div className="mt-2 space-y-2">
                {safeItems.map((item) => {
                  const product   = item.product
                  const unitPrice = product?.hasDiscount
                    ? (product.discountPrice ?? product.price)
                    : (product?.price ?? 0)
                  const subtotal  = unitPrice * item.quantity
                  const img       =
                    product?.image ??
                    product?.images?.[0]?.images ??
                    product?.images?.[0]?.imageName
                  /* Only the remove X button gets a pending lock */
                  const isRemoving = mutatingIds.includes(item.productId)

                  return (
                    <div
                      key={item.productId}
                      className={[
                        'group flex flex-col gap-3 rounded-[4px] bg-background px-5 py-3 shadow-sm',
                        'transition-colors duration-150',
                        'hover:bg-neutral-50/80 dark:hover:bg-neutral-900/50',
                        'sm:min-w-[680px] sm:grid sm:grid-cols-[2.5fr_1fr_148px_1fr_40px] sm:items-center sm:gap-4',
                      ].join(' ')}
                    >
                      {/* Thumbnail + name */}
                      <div className="flex items-center gap-3">
                        <div className="h-14 w-14 shrink-0 overflow-hidden rounded-[4px] bg-[#F5F5F5] dark:bg-neutral-800">
                          <img
                            src={getImageUrl(img)}
                            alt={product?.productName ?? ''}
                            className="h-full w-full object-cover object-center"
                            onError={(e) => { (e.target as HTMLImageElement).src = IMAGE_PLACEHOLDER }}
                          />
                        </div>
                        <Link
                          to={`/product/${item.productId}`}
                          className="line-clamp-2 text-sm font-medium text-foreground transition-colors hover:text-[#DB4444]"
                        >
                          {product?.productName}
                        </Link>
                      </div>

                      {/* Unit price */}
                      <div className="flex items-center justify-between sm:block sm:text-center">
                        <span className="text-xs font-medium text-muted-foreground sm:hidden">
                          {t('cart.col_price')}:
                        </span>
                        <span className="text-sm font-medium tabular-nums text-foreground">
                          ${unitPrice.toFixed(2)}
                        </span>
                      </div>

                      {/* ── Quantity stepper ──────────────────────────────────
                          + and - are NEVER disabled. They call the synchronous
                          reducer first (instant Redux + localStorage), then fire
                          the API thunk in the background. No waiting, no rollback. */}
                      <div className="flex items-center justify-between sm:justify-center">
                        <span className="text-xs font-medium text-muted-foreground sm:hidden">
                          {t('cart.col_quantity')}:
                        </span>
                        <div className="inline-flex h-9 items-center overflow-hidden rounded-[4px] border border-border">
                          <button
                            type="button"
                            aria-label="Decrease quantity"
                            onClick={() => handleDecrease(item.productId, item.quantity)}
                            className="flex h-full w-9 cursor-pointer items-center justify-center text-foreground transition-colors hover:bg-accent active:scale-90"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>

                          {/* Quantity display — driven purely by Redux state */}
                          <span className="min-w-[36px] select-none text-center text-sm font-semibold tabular-nums text-foreground">
                            {String(item.quantity).padStart(2, '0')}
                          </span>

                          <button
                            type="button"
                            aria-label="Increase quantity"
                            onClick={() => handleIncrease(item.productId)}
                            className="flex h-full w-9 cursor-pointer items-center justify-center text-foreground transition-colors hover:bg-accent active:scale-90"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Subtotal — recomputed from live Redux state on every click */}
                      <div className="flex items-center justify-between sm:block sm:text-center">
                        <span className="text-xs font-medium text-muted-foreground sm:hidden">
                          {t('cart.col_subtotal')}:
                        </span>
                        <span className="text-sm font-semibold tabular-nums text-foreground">
                          ${subtotal.toFixed(2)}
                        </span>
                      </div>

                      {/* Remove */}
                      <div className="flex justify-end sm:justify-center">
                        <button
                          type="button"
                          aria-label={t('cart.remove')}
                          disabled={isRemoving}
                          onClick={() => setConfirmRemoveId(item.productId)}
                          className="flex h-6 w-6 items-center justify-center rounded-full bg-[#DB4444] text-white transition-opacity hover:opacity-75 disabled:opacity-40"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Action row */}
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
              <Link
                to="/products"
                className="rounded-[4px] border border-border px-7 py-2.5 text-sm font-semibold text-foreground transition-colors hover:border-foreground"
              >
                {t('cart.return_to_shop')}
              </Link>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  className="rounded-[4px] border border-border px-7 py-2.5 text-sm font-semibold text-foreground transition-colors hover:border-foreground"
                >
                  {t('cart.update_cart')}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmClear(true)}
                  className="rounded-[4px] border border-[#DB4444] px-7 py-2.5 text-sm font-semibold text-[#DB4444] transition-colors hover:bg-[#DB4444] hover:text-white"
                >
                  {t('cart.remove_all')}
                </button>
              </div>
            </div>

            {/* Coupon + Cart Total */}
            <div className="mt-8 flex flex-col gap-8 lg:flex-row lg:items-start">

              <div className="flex flex-1 gap-3">
                <input
                  type="text"
                  value={coupon}
                  onChange={(e) => setCoupon(e.target.value)}
                  placeholder={t('cart.coupon_placeholder')}
                  className="flex-1 rounded-[4px] border border-border bg-background px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-foreground"
                />
                <button
                  type="button"
                  className="shrink-0 rounded-[4px] bg-[#DB4444] px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                >
                  {t('cart.apply_coupon')}
                </button>
              </div>

              {/* Cart Total — reads selectCartTotal which re-derives on every qty change */}
              <div className="w-full shrink-0 rounded-[4px] border border-border p-6 lg:w-[420px]">
                <h2 className="text-lg font-semibold text-foreground">{t('cart.cart_total')}</h2>
                <div className="mt-5">
                  <div className="flex items-center justify-between border-b border-border py-3.5">
                    <span className="text-sm text-foreground">{t('cart.subtotal')}</span>
                    <span className="text-sm font-medium tabular-nums text-foreground">
                      ${total.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-b border-border py-3.5">
                    <span className="text-sm text-foreground">{t('cart.shipping')}</span>
                    <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                      {t('cart.free_shipping')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-3.5">
                    <span className="text-sm font-semibold text-foreground">{t('cart.total')}</span>
                    <span className="text-base font-bold tabular-nums text-foreground">
                      ${total.toFixed(2)}
                    </span>
                  </div>
                </div>
                <Link
                  to="/checkout"
                  className="mt-3 flex w-full items-center justify-center rounded-[4px] bg-[#DB4444] py-3.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                >
                  {t('cart.proceed_to_checkout')}
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
