import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslation } from 'react-i18next'
import { CheckCircle2 } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { clearCart, selectCartTotal } from '@/features/cart/model/cartSlice'
import { Input } from '@/shared/ui/input'
import { Header } from '@/widgets/header'
import { Footer } from '@/widgets/footer'
import { getImageUrl } from '@/shared/lib/image'

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

const fieldCls = 'h-12 rounded-[4px] border-border focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-foreground'

export default function CheckoutPage() {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { items } = useAppSelector((s) => s.cart)
  const total = useAppSelector(selectCartTotal)

  const [success,   setSuccess]   = useState(false)
  const [payMethod, setPayMethod] = useState<'bank' | 'cash'>('cash')
  const [coupon,    setCoupon]    = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  const onSubmit = async (_data: FormValues) => {
    await new Promise((r) => setTimeout(r, 900))
    dispatch(clearCart())
    setSuccess(true)
  }

  /* ── Success screen ── */
  if (success) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <main className="flex flex-1 items-center justify-center px-4 py-16">
          <div className="flex max-w-sm flex-col items-center gap-6 text-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#DB4444]/10">
              <CheckCircle2 className="h-12 w-12 text-[#DB4444]" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-foreground">{t('checkout.success_title')}</h1>
              <p className="mt-2 text-sm text-muted-foreground">{t('checkout.success_desc')}</p>
            </div>
            <button
              onClick={() => navigate('/')}
              className="rounded-[4px] bg-[#DB4444] px-12 py-3.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
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

      <main className="mx-auto w-full max-w-[1280px] flex-1 px-4 py-10 xl:px-0">

        {/* Breadcrumb */}
        <nav className="mb-10 flex items-center gap-2 text-sm text-muted-foreground">
          <Link to="/products" className="transition-colors hover:text-[#DB4444]">{t('products.title')}</Link>
          <span>/</span>
          <Link to="/cart" className="transition-colors hover:text-[#DB4444]">{t('cart.title')}</Link>
          <span>/</span>
          <span className="font-medium text-foreground">{t('checkout.title')}</span>
        </nav>

        <div className="flex flex-col gap-10 lg:flex-row lg:items-start">

          {/* ── LEFT: Billing Details ── */}
          <div className="flex-1">
            <h1 className="mb-8 text-2xl font-medium text-foreground">{t('checkout.billing_details')}</h1>

            <form id="checkout-form" onSubmit={handleSubmit(onSubmit)} noValidate>
              <div className="space-y-4 rounded-[4px] border border-border p-6">

                <div>
                  <Input
                    {...register('firstName')}
                    placeholder={t('checkout.first_name')}
                    className={fieldCls}
                  />
                  {errors.firstName && <p className="mt-1 text-xs text-[#DB4444]">{errors.firstName.message}</p>}
                </div>

                <div>
                  <Input
                    {...register('lastName')}
                    placeholder={t('checkout.last_name')}
                    className={fieldCls}
                  />
                  {errors.lastName && <p className="mt-1 text-xs text-[#DB4444]">{errors.lastName.message}</p>}
                </div>

                <div>
                  <Input
                    {...register('streetAddress')}
                    placeholder={t('checkout.street_address')}
                    className={fieldCls}
                  />
                  {errors.streetAddress && <p className="mt-1 text-xs text-[#DB4444]">{errors.streetAddress.message}</p>}
                </div>

                <div>
                  <Input
                    {...register('apartment')}
                    placeholder={t('checkout.apartment')}
                    className={fieldCls}
                  />
                </div>

                <div>
                  <Input
                    {...register('city')}
                    placeholder={t('checkout.city')}
                    className={fieldCls}
                  />
                  {errors.city && <p className="mt-1 text-xs text-[#DB4444]">{errors.city.message}</p>}
                </div>

                <div>
                  <Input
                    {...register('phone')}
                    type="tel"
                    placeholder={t('checkout.phone')}
                    className={fieldCls}
                  />
                  {errors.phone && <p className="mt-1 text-xs text-[#DB4444]">{errors.phone.message}</p>}
                </div>

                <div>
                  <Input
                    {...register('email')}
                    type="email"
                    placeholder={t('checkout.email_address')}
                    className={fieldCls}
                  />
                  {errors.email && <p className="mt-1 text-xs text-[#DB4444]">{errors.email.message}</p>}
                </div>

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
            <div className="space-y-5">
              {items.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t('cart.empty_title')}</p>
              ) : (
                items.map((item) => {
                  const price = item.product.hasDiscount
                    ? item.product.discountPrice ?? item.product.price
                    : item.product.price
                  const img = item.product.images?.[0]?.imageName
                  return (
                    <div key={item.productId} className="flex items-center gap-4">
                      <div className="relative h-[54px] w-[54px] shrink-0 overflow-hidden rounded-[4px] bg-muted">
                        <img
                          src={getImageUrl(img)}
                          alt={item.product.productName}
                          className="h-full w-full object-cover"
                        />
                        <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#8D8D8D] text-[10px] font-medium text-white">
                          {item.quantity}
                        </span>
                      </div>
                      <p className="flex-1 text-sm text-foreground line-clamp-1">
                        {item.product.productName}
                      </p>
                      <span className="shrink-0 text-sm font-medium text-foreground">
                        ${(price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  )
                })
              )}
            </div>

            {/* Totals */}
            <div className="space-y-3 border-t border-border pt-4">
              <div className="flex justify-between text-sm">
                <span className="text-foreground">{t('cart.subtotal')}:</span>
                <span className="font-medium text-foreground">${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-b border-border pb-4 text-sm">
                <span className="text-foreground">{t('cart.shipping')}:</span>
                <span className="font-medium text-foreground">{t('cart.free_shipping')}</span>
              </div>
              <div className="flex justify-between text-sm font-bold">
                <span className="text-foreground">{t('cart.total')}:</span>
                <span className="text-lg text-foreground">${total.toFixed(2)}</span>
              </div>
            </div>

            {/* Payment options */}
            <div className="space-y-3 rounded-[4px] border border-border p-5">
              {/* Bank */}
              <label
                onClick={() => setPayMethod('bank')}
                className="flex cursor-pointer items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-[18px] w-[18px] items-center justify-center rounded-full border-2 transition-colors ${
                      payMethod === 'bank' ? 'border-foreground' : 'border-muted-foreground'
                    }`}
                  >
                    {payMethod === 'bank' && <div className="h-2.5 w-2.5 rounded-full bg-foreground" />}
                  </div>
                  <span className="text-sm text-foreground">{t('checkout.pay_bank')}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="rounded bg-[#E2136E] px-1.5 py-0.5 text-[9px] font-bold text-white">bKash</span>
                  <span className="rounded bg-[#1A1F71] px-1.5 py-0.5 text-[9px] font-bold text-white">VISA</span>
                  <span className="rounded bg-[#EB001B] px-1.5 py-0.5 text-[9px] font-bold text-white">MC</span>
                </div>
              </label>

              {/* Cash on delivery */}
              <label
                onClick={() => setPayMethod('cash')}
                className="flex cursor-pointer items-center gap-3"
              >
                <div
                  className={`flex h-[18px] w-[18px] items-center justify-center rounded-full border-2 transition-colors ${
                    payMethod === 'cash' ? 'border-foreground' : 'border-muted-foreground'
                  }`}
                >
                  {payMethod === 'cash' && <div className="h-2.5 w-2.5 rounded-full bg-foreground" />}
                </div>
                <span className="text-sm text-foreground">{t('checkout.pay_cash')}</span>
              </label>
            </div>

            {/* Coupon code */}
            <div className="flex gap-3">
              <Input
                value={coupon}
                onChange={(e) => setCoupon(e.target.value)}
                placeholder={t('cart.coupon_placeholder')}
                className="h-12 flex-1 rounded-[4px] border-border focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-foreground"
              />
              <button className="shrink-0 rounded-[4px] border border-[#DB4444] px-6 text-sm font-medium text-[#DB4444] transition-colors hover:bg-[#DB4444] hover:text-white">
                {t('cart.apply_coupon')}
              </button>
            </div>

            {/* Place Order */}
            <button
              type="submit"
              form="checkout-form"
              disabled={isSubmitting}
              className="w-full rounded-[4px] bg-[#DB4444] py-4 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
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
