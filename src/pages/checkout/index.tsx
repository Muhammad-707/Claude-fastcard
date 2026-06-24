import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslation } from 'react-i18next'
import { CheckCircle2 } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { clearCart, selectCartTotal } from '@/features/cart/model/cartSlice'
import { Header } from '@/widgets/header'
import { Footer } from '@/widgets/footer'
import { getImageUrl } from '@/shared/lib/image'

const schema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  streetAddress: z.string().min(1),
  apartment: z.string().optional(),
  city: z.string().min(1),
  phone: z.string().min(6),
  email: z.string().email(),
  saveInfo: z.boolean().optional(),
})
type FormValues = z.infer<typeof schema>

const inputCls = `w-full rounded-[4px] border border-border bg-background px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground transition-colors focus:border-foreground`

export default function CheckoutPage() {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { items } = useAppSelector((s) => s.cart)
  const total = useAppSelector(selectCartTotal)
  const [success, setSuccess] = useState(false)
  const [payMethod, setPayMethod] = useState<'bank' | 'cash'>('cash')
  const [coupon, setCoupon] = useState('')

  const { register, handleSubmit, formState: { isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (_data: FormValues) => {
    await new Promise((r) => setTimeout(r, 800))
    dispatch(clearCart())
    setSuccess(true)
  }

  if (success) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <main className="flex flex-1 items-center justify-center px-4">
          <div className="flex max-w-sm flex-col items-center gap-4 text-center">
            <CheckCircle2 className="h-20 w-20 text-[#00FF66]" />
            <h1 className="text-2xl font-semibold text-foreground">{t('checkout.success_title')}</h1>
            <p className="text-sm text-muted-foreground">{t('checkout.success_desc')}</p>
            <button
              onClick={() => navigate('/')}
              className="mt-2 rounded-[4px] bg-[#DB4444] px-10 py-3 text-sm font-medium text-white hover:opacity-90 transition-opacity"
            >
              {t('common.back_home')}
            </button>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />

      <main className="mx-auto w-full max-w-[1170px] flex-1 px-4 py-8 xl:px-0">
        {/* Breadcrumb */}
        <nav className="mb-10 flex items-center gap-2 text-sm text-muted-foreground">
          <Link to="/products" className="transition-colors hover:text-foreground">{t('products.title')}</Link>
          <span>/</span>
          <Link to="/cart" className="transition-colors hover:text-foreground">{t('cart.title')}</Link>
          <span>/</span>
          <span className="font-medium text-foreground">{t('checkout.title')}</span>
        </nav>

        <div className="flex flex-col gap-10 lg:flex-row lg:items-start">

          {/* ── LEFT: Billing Details ── */}
          <div className="flex-1">
            <h1 className="mb-6 text-2xl font-medium text-foreground">{t('checkout.billing_details')}</h1>

            <form id="checkout-form" onSubmit={handleSubmit(onSubmit)} className="rounded-[4px] border border-border p-6 space-y-4" noValidate>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <input {...register('firstName')} placeholder={t('checkout.first_name')} className={inputCls} />
                </div>
                <div>
                  <input {...register('lastName')} placeholder={t('checkout.last_name')} className={inputCls} />
                </div>
              </div>
              <input {...register('streetAddress')} placeholder={t('checkout.street_address')} className={inputCls} />
              <input {...register('apartment')} placeholder={t('checkout.apartment')} className={inputCls} />
              <input {...register('city')} placeholder={t('checkout.city')} className={inputCls} />
              <input {...register('phone')} type="tel" placeholder={t('checkout.phone')} className={inputCls} />
              <input {...register('email')} type="email" placeholder={t('checkout.email_address')} className={inputCls} />

              <label className="flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  {...register('saveInfo')}
                  className="h-4 w-4 accent-[#DB4444]"
                  defaultChecked
                />
                <span className="text-sm text-foreground">{t('checkout.save_info')}</span>
              </label>
            </form>
          </div>

          {/* ── RIGHT: Order summary + Payment + Coupon + Place Order ── */}
          <div className="w-full lg:w-[430px] lg:shrink-0">

            {/* Items */}
            <div className="space-y-4 mb-6">
              {items.map((item) => {
                const price = item.product.hasDiscount
                  ? item.product.discountPrice ?? item.product.price
                  : item.product.price
                const img = item.product.images?.[0]?.imageName
                return (
                  <div key={item.productId} className="flex items-center gap-4">
                    <div className="relative h-[54px] w-[54px] shrink-0 overflow-hidden rounded-[4px] bg-muted">
                      <img src={getImageUrl(img)} alt={item.product.productName} className="h-full w-full object-cover" />
                      <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#8D8D8D] text-[10px] font-medium text-white">
                        {item.quantity}
                      </span>
                    </div>
                    <p className="flex-1 text-sm text-foreground line-clamp-1">{item.product.productName}</p>
                    <span className="text-sm font-medium text-foreground">${(price * item.quantity).toFixed(2)}</span>
                  </div>
                )
              })}
            </div>

            {/* Totals */}
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-foreground">{t('cart.subtotal')}:</span>
                <span className="font-medium text-foreground">${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-b border-border pb-4 text-sm">
                <span className="text-foreground">{t('cart.shipping')}:</span>
                <span className="font-medium text-foreground">{t('cart.free_shipping')}</span>
              </div>
              <div className="flex justify-between text-sm font-semibold">
                <span className="text-foreground">{t('cart.total')}:</span>
                <span className="text-foreground">${total.toFixed(2)}</span>
              </div>
            </div>

            {/* Payment options */}
            <div className="space-y-3 rounded-[4px] border border-border p-4 mb-4">
              {/* Bank option */}
              <label className="flex cursor-pointer items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    onClick={() => setPayMethod('bank')}
                    className={`flex h-5 w-5 items-center justify-center rounded-full border-2 transition-colors ${payMethod === 'bank' ? 'border-foreground' : 'border-muted-foreground'}`}
                  >
                    {payMethod === 'bank' && <div className="h-2.5 w-2.5 rounded-full bg-foreground" />}
                  </div>
                  <span className="text-sm text-foreground">{t('checkout.pay_bank')}</span>
                </div>
                {/* Card logos placeholder */}
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <span className="rounded bg-[#E2136E] px-1.5 py-0.5 text-[10px] font-bold text-white">bKash</span>
                  <span className="rounded bg-[#1A1F71] px-1.5 py-0.5 text-[10px] font-bold text-white">VISA</span>
                </div>
              </label>

              {/* Cash option */}
              <label className="flex cursor-pointer items-center gap-3">
                <div
                  onClick={() => setPayMethod('cash')}
                  className={`flex h-5 w-5 items-center justify-center rounded-full border-2 transition-colors ${payMethod === 'cash' ? 'border-foreground' : 'border-muted-foreground'}`}
                >
                  {payMethod === 'cash' && <div className="h-2.5 w-2.5 rounded-full bg-foreground" />}
                </div>
                <span className="text-sm text-foreground">{t('checkout.pay_cash')}</span>
              </label>
            </div>

            {/* Coupon */}
            <div className="flex gap-3 mb-4">
              <input
                type="text"
                value={coupon}
                onChange={(e) => setCoupon(e.target.value)}
                placeholder={t('cart.coupon_placeholder')}
                className="flex-1 rounded-[4px] border border-border bg-background px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-foreground"
              />
              <button className="rounded-[4px] border border-[#DB4444] px-5 py-3 text-sm font-medium text-[#DB4444] transition-colors hover:bg-[#DB4444] hover:text-white">
                {t('cart.apply_coupon')}
              </button>
            </div>

            {/* Place Order */}
            <button
              type="submit"
              form="checkout-form"
              disabled={isSubmitting}
              className="w-full rounded-[4px] bg-[#DB4444] py-4 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {isSubmitting ? '...' : t('checkout.place_order')}
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
