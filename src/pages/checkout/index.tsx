import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslation } from 'react-i18next'
import { CheckCircle2, Package, Truck, Hash, DollarSign, ChevronRight } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { clearCart, selectCartTotal } from '@/features/cart/model/cartSlice'
import { Input } from '@/shared/ui/input'
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/shared/ui/dialog'
import { Header } from '@/widgets/header'
import { Footer } from '@/widgets/footer'
import { getImageUrl, IMAGE_PLACEHOLDER } from '@/shared/lib/image'

/* ── Order ID generator ──────────────────────────────────────────── */
function generateOrderId(): string {
  const year = new Date().getFullYear()
  const rand = Math.floor(100000 + Math.random() * 900000)
  return `FC-${year}-${rand}`
}

/* ── Zod schema ───────────────────────────────────────────────────── */
const schema = z.object({
  firstName:     z.string().min(1, 'Required'),
  lastName:      z.string().min(1, 'Required'),
  streetAddress: z.string().min(1, 'Required'),
  apartment:     z.string().optional(),
  city:          z.string().min(1, 'Required'),
  phone:         z.string().min(6, 'Required'),
  email:         z.string().email('Invalid email'),
  saveInfo:      z.boolean().optional(),
})
type FormValues = z.infer<typeof schema>

const fieldCls =
  'h-12 rounded-[4px] border-border bg-background text-foreground placeholder:text-muted-foreground ' +
  'focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-foreground transition-colors'

/* ── Custom radio ─────────────────────────────────────────────────── */
function PayRadio({ checked, label, children }: { checked: boolean; label: string; children?: React.ReactNode }) {
  return (
    <div className={`flex cursor-pointer items-center justify-between rounded-[4px] p-3 transition-colors ${checked ? 'bg-accent/50' : ''}`}>
      <div className="flex items-center gap-3">
        <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-all ${checked ? 'border-[#DB4444]' : 'border-muted-foreground'}`}>
          {checked && <div className="h-2.5 w-2.5 rounded-full bg-[#DB4444]" />}
        </div>
        <span className="text-sm font-medium text-foreground">{label}</span>
      </div>
      {children}
    </div>
  )
}

/* ── Order Success Dialog ─────────────────────────────────────────── */
function OrderSuccessDialog({ open, orderId, total, onContinue, onViewOrders }: {
  open: boolean
  orderId: string
  total: number
  onContinue: () => void
  onViewOrders: () => void
}) {
  const { t } = useTranslation()

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent showCloseButton={false} className="max-w-md overflow-hidden p-0">
        {/* Gradient header */}
        <div className="relative flex flex-col items-center bg-gradient-to-br from-[#DB4444] to-[#c73434] px-8 pb-8 pt-10">
          {/* Animated check */}
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
            <CheckCircle2 className="h-10 w-10 text-white" strokeWidth={1.5} />
          </div>
          <DialogTitle className="mt-4 text-center text-2xl font-bold text-white">
            {t('checkout.success_thank_you')}
          </DialogTitle>
          <DialogDescription className="mt-1.5 text-center text-sm text-white/80">
            {t('checkout.success_desc')}
          </DialogDescription>
        </div>

        {/* Order summary card */}
        <div className="px-6 py-5">
          <div className="divide-y divide-border rounded-xl border border-border bg-muted/30">
            {/* Order ID */}
            <div className="flex items-center gap-3 px-4 py-3.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#DB4444]/10">
                <Hash className="h-4 w-4 text-[#DB4444]" />
              </div>
              <div className="flex flex-1 items-center justify-between">
                <span className="text-sm text-muted-foreground">{t('checkout.success_order_id')}</span>
                <span className="font-mono text-sm font-semibold text-foreground">{orderId}</span>
              </div>
            </div>

            {/* Total paid */}
            <div className="flex items-center gap-3 px-4 py-3.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#DB4444]/10">
                <DollarSign className="h-4 w-4 text-[#DB4444]" />
              </div>
              <div className="flex flex-1 items-center justify-between">
                <span className="text-sm text-muted-foreground">{t('checkout.success_total_paid')}</span>
                <span className="text-sm font-bold text-foreground">${total.toFixed(2)}</span>
              </div>
            </div>

            {/* Shipping */}
            <div className="flex items-center gap-3 px-4 py-3.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#DB4444]/10">
                <Truck className="h-4 w-4 text-[#DB4444]" />
              </div>
              <div className="flex flex-1 items-center justify-between">
                <span className="text-sm text-muted-foreground">{t('checkout.success_shipping_time')}</span>
                <span className="text-sm font-semibold text-foreground">{t('checkout.success_shipping_days')}</span>
              </div>
            </div>

            {/* Package status */}
            <div className="flex items-center gap-3 px-4 py-3.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500/10">
                <Package className="h-4 w-4 text-emerald-500" />
              </div>
              <div className="flex flex-1 items-center justify-between">
                <span className="text-sm text-muted-foreground">{t('checkout.success_status')}</span>
                <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  {t('checkout.success_status_value')}
                </span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="mt-5 flex flex-col gap-3">
            {/* Continue Shopping — glassmorphic style */}
            <button
              onClick={onContinue}
              className="w-full rounded-[4px] border border-[#DB4444] py-3.5 text-sm font-semibold text-[#DB4444] backdrop-blur-sm transition-all hover:bg-[#DB4444]/10 active:scale-[0.98]"
            >
              {t('checkout.continue_shopping')}
            </button>
            {/* View Orders — filled */}
            <button
              onClick={onViewOrders}
              className="w-full rounded-[4px] bg-[#DB4444] py-3.5 text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98]"
            >
              {t('checkout.view_orders')}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

/* ════════════════════════════════════════════════════════════════════ */
export default function CheckoutPage() {
/* ════════════════════════════════════════════════════════════════════ */
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { items } = useAppSelector((s) => s.cart)
  const total = useAppSelector(selectCartTotal)

  const [orderId,    setOrderId]    = useState<string | null>(null)
  const [orderTotal, setOrderTotal] = useState(0)
  const [payMethod,  setPayMethod]  = useState<'bank' | 'cash'>('cash')
  const [coupon,     setCoupon]     = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  const onSubmit = async (_data: FormValues) => {
    await new Promise((r) => setTimeout(r, 900))
    const id = generateOrderId()
    setOrderTotal(total)
    dispatch(clearCart())
    setOrderId(id)
  }

  const safeItems = (Array.isArray(items) ? items : []).filter((i) => i?.product != null)

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />

      <main className="mx-auto w-full max-w-[1280px] flex-1 px-4 py-10 xl:px-0">

        {/* Breadcrumb */}
        <nav className="mb-10 flex items-center gap-2 text-sm text-muted-foreground">
          <Link to="/" className="transition-colors hover:text-foreground">{t('nav.home')}</Link>
          <ChevronRight className="h-3.5 w-3.5 shrink-0" />
          <Link to="/cart" className="transition-colors hover:text-foreground">{t('cart.title')}</Link>
          <ChevronRight className="h-3.5 w-3.5 shrink-0" />
          <span className="font-medium text-foreground">{t('checkout.title')}</span>
        </nav>

        <div className="flex flex-col gap-10 lg:flex-row lg:items-start">

          {/* ── LEFT: Billing Details form ── */}
          <div className="flex-1">
            <h1 className="mb-8 text-2xl font-medium text-foreground">{t('checkout.billing_details')}</h1>

            <form id="checkout-form" onSubmit={handleSubmit(onSubmit)} noValidate>
              <div className="space-y-4">

                {/* First + Last name row */}
                <div className="flex flex-col gap-4 sm:flex-row">
                  <div className="flex-1">
                    <label className="mb-1.5 block text-sm font-medium text-foreground">{t('checkout.first_name')}</label>
                    <Input {...register('firstName')} placeholder={t('checkout.first_name')} className={fieldCls} />
                    {errors.firstName && <p className="mt-1 text-xs text-[#DB4444]">{errors.firstName.message}</p>}
                  </div>
                  <div className="flex-1">
                    <label className="mb-1.5 block text-sm font-medium text-foreground">{t('checkout.last_name')}</label>
                    <Input {...register('lastName')} placeholder={t('checkout.last_name')} className={fieldCls} />
                    {errors.lastName && <p className="mt-1 text-xs text-[#DB4444]">{errors.lastName.message}</p>}
                  </div>
                </div>

                {/* Street address */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">{t('checkout.street_address')} *</label>
                  <Input {...register('streetAddress')} placeholder={t('checkout.street_address')} className={fieldCls} />
                  {errors.streetAddress && <p className="mt-1 text-xs text-[#DB4444]">{errors.streetAddress.message}</p>}
                </div>

                {/* Apartment */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">{t('checkout.apartment')}</label>
                  <Input {...register('apartment')} placeholder={t('checkout.apartment')} className={fieldCls} />
                </div>

                {/* City */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">{t('checkout.city')} *</label>
                  <Input {...register('city')} placeholder={t('checkout.city')} className={fieldCls} />
                  {errors.city && <p className="mt-1 text-xs text-[#DB4444]">{errors.city.message}</p>}
                </div>

                {/* Phone */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">{t('checkout.phone')} *</label>
                  <Input {...register('phone')} type="tel" placeholder={t('checkout.phone')} className={fieldCls} />
                  {errors.phone && <p className="mt-1 text-xs text-[#DB4444]">{errors.phone.message}</p>}
                </div>

                {/* Email */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">{t('checkout.email_address')} *</label>
                  <Input {...register('email')} type="email" placeholder={t('checkout.email_address')} className={fieldCls} />
                  {errors.email && <p className="mt-1 text-xs text-[#DB4444]">{errors.email.message}</p>}
                </div>

                {/* Save info checkbox */}
                <label className="flex cursor-pointer items-center gap-3 pt-1">
                  <input
                    type="checkbox"
                    {...register('saveInfo')}
                    defaultChecked
                    className="h-4 w-4 cursor-pointer accent-[#DB4444]"
                  />
                  <span className="text-sm text-foreground">{t('checkout.save_info')}</span>
                </label>
              </div>
            </form>
          </div>

          {/* ── RIGHT: Order summary ── */}
          <div className="w-full space-y-6 lg:w-[430px] lg:shrink-0">

            {/* Items list */}
            <div className="space-y-4">
              {safeItems.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t('cart.empty_title')}</p>
              ) : (
                safeItems.map((item) => {
                  // Price logic mirrors cart page exactly
                  const price = item.product.hasDiscount
                    ? (item.product.discountPrice ?? item.product.price)
                    : (item.product.price ?? 0)
                  // Fallback chain matches cart page order
                  const img =
                    item.product.image ??
                    item.product.images?.[0]?.images ??
                    item.product.images?.[0]?.imageName
                  return (
                    <div key={item.productId} className="flex items-center gap-3">
                      {/* Thumbnail with quantity badge */}
                      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-[4px] bg-[#F5F5F5] dark:bg-neutral-800">
                        <img
                          src={getImageUrl(img)}
                          alt={item.product.productName}
                          className="h-full w-full object-cover object-center"
                          onError={(e) => { (e.target as HTMLImageElement).src = IMAGE_PLACEHOLDER }}
                        />
                        <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#8D8D8D] text-[10px] font-semibold text-white">
                          {item.quantity}
                        </span>
                      </div>
                      <p className="flex-1 line-clamp-1 text-sm text-foreground">
                        {item.product.productName}
                      </p>
                      <span className="shrink-0 text-sm font-semibold tabular-nums text-foreground">
                        ${(price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  )
                })
              )}
            </div>

            {/* Totals — both values derived from selectCartTotal, reactive to quantity changes */}
            <div className="space-y-0 border-t border-border pt-4">
              <div className="flex items-center justify-between py-3 text-sm">
                <span className="text-muted-foreground">{t('cart.subtotal')}</span>
                <span className="font-medium tabular-nums text-foreground">${total.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between border-b border-border py-3 text-sm">
                <span className="text-muted-foreground">{t('cart.shipping')}</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">{t('cart.free_shipping')}</span>
              </div>
              <div className="flex items-center justify-between pt-3">
                <span className="text-sm font-semibold text-foreground">{t('cart.total')}</span>
                <span className="text-base font-bold tabular-nums text-foreground">${total.toFixed(2)}</span>
              </div>
            </div>

            {/* Payment method */}
            <div className="space-y-1 rounded-[4px] border border-border p-2">
              <h3 className="px-2 pb-1 pt-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {t('checkout.payment_method')}
              </h3>
              <div onClick={() => setPayMethod('bank')} role="radio" aria-checked={payMethod === 'bank'} tabIndex={0}>
                <PayRadio checked={payMethod === 'bank'} label={t('checkout.pay_bank')}>
                  <div className="flex items-center gap-1">
                    <span className="rounded bg-[#E2136E] px-1.5 py-0.5 text-[9px] font-bold text-white">bKash</span>
                    <span className="rounded bg-[#1A1F71] px-1.5 py-0.5 text-[9px] font-bold text-white">VISA</span>
                    <span className="rounded bg-[#EB001B] px-1.5 py-0.5 text-[9px] font-bold text-white">MC</span>
                  </div>
                </PayRadio>
              </div>
              <div onClick={() => setPayMethod('cash')} role="radio" aria-checked={payMethod === 'cash'} tabIndex={0}>
                <PayRadio checked={payMethod === 'cash'} label={t('checkout.pay_cash')} />
              </div>
            </div>

            {/* Coupon code */}
            <div className="flex gap-3">
              <Input
                value={coupon}
                onChange={(e) => setCoupon(e.target.value)}
                placeholder={t('cart.coupon_placeholder')}
                className={`flex-1 ${fieldCls}`}
              />
              <button
                type="button"
                className="shrink-0 rounded-[4px] border border-[#DB4444] px-5 text-sm font-medium text-[#DB4444] transition-colors hover:bg-[#DB4444] hover:text-white"
              >
                {t('cart.apply_coupon')}
              </button>
            </div>

            {/* Place order button */}
            <button
              type="submit"
              form="checkout-form"
              disabled={isSubmitting || safeItems.length === 0}
              className="w-full rounded-[4px] bg-[#DB4444] py-4 text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? '...' : t('checkout.place_order')}
            </button>
          </div>
        </div>
      </main>

      <Footer />

      {/* Order Success Dialog */}
      {orderId && (
        <OrderSuccessDialog
          open={!!orderId}
          orderId={orderId}
          total={orderTotal}
          onContinue={() => navigate('/products')}
          onViewOrders={() => navigate('/profile')}
        />
      )}
    </div>
  )
}
