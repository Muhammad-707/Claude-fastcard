import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslation } from 'react-i18next'
import { ChevronRight, CheckCircle2 } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { clearCart, selectCartTotal } from '@/features/cart/model/cartSlice'
import { Header } from '@/widgets/header'
import { Footer } from '@/widgets/footer'
import { getImageUrl } from '@/shared/lib/image'

const schema = z.object({
  firstName: z.string().min(1),
  company: z.string().optional(),
  address: z.string().min(1),
  apartment: z.string().optional(),
  city: z.string().min(1),
  phone: z.string().min(6),
  email: z.string().email(),
  saveInfo: z.boolean().optional(),
})
type FormValues = z.infer<typeof schema>

export default function CheckoutPage() {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { items } = useAppSelector((s) => s.cart)
  const total = useAppSelector(selectCartTotal)
  const [success, setSuccess] = useState(false)
  const [payMethod, setPayMethod] = useState<'bank' | 'cash'>('cash')

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
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
            <p className="text-sm text-[#8D8D8D]">{t('checkout.success_desc')}</p>
            <button
              onClick={() => navigate('/')}
              className="mt-2 rounded-[4px] bg-primary px-10 py-3 text-sm font-medium text-white hover:opacity-90 transition-opacity"
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
        <nav className="mb-8 flex items-center gap-2 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-[#DB4444] transition-colors">{t('nav.home')}</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link to="/cart" className="hover:text-[#DB4444] transition-colors">{t('cart.title')}</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-foreground">{t('checkout.title')}</span>
        </nav>

        <div className="flex flex-col gap-10 lg:flex-row lg:items-start">
          {/* ── Billing form ── */}
          <form onSubmit={handleSubmit(onSubmit)} className="flex-1 space-y-5">
            <h1 className="text-xl font-semibold text-foreground">{t('checkout.title')}</h1>

            {[
              { name: 'firstName', label: t('checkout.first_name'), required: true },
              { name: 'company', label: t('checkout.company'), required: false },
              { name: 'address', label: t('checkout.address'), required: true },
              { name: 'apartment', label: t('checkout.apartment'), required: false },
              { name: 'city', label: t('checkout.city'), required: true },
              { name: 'phone', label: t('checkout.phone'), required: true },
              { name: 'email', label: t('checkout.email'), required: true },
            ].map(({ name, label, required }) => (
              <div key={name}>
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  {label}{required && <span className="text-primary">*</span>}
                </label>
                <input
                  {...register(name as keyof FormValues)}
                  className={`w-full rounded-[4px] border bg-background px-4 py-3 text-sm text-foreground outline-none placeholder:text-[#8D8D8D] transition-colors focus:border-primary ${
                    errors[name as keyof FormValues] ? 'border-primary' : 'border-[#C4C4C4]'
                  }`}
                />
                {errors[name as keyof FormValues] && (
                  <p className="mt-1 text-xs text-primary">
                    {String(errors[name as keyof FormValues]?.message ?? 'Required')}
                  </p>
                )}
              </div>
            ))}

            {/* Save info */}
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                {...register('saveInfo')}
                className="h-4 w-4 accent-primary"
              />
              <span className="text-sm text-foreground">{t('checkout.save_info')}</span>
            </label>

            {/* Payment method */}
            <div>
              <h2 className="mb-3 text-sm font-semibold text-foreground">{t('checkout.payment_method')}</h2>
              <div className="space-y-2">
                {([['cash', t('checkout.pay_cash')], ['bank', t('checkout.pay_bank')]] as const).map(([val, label]) => (
                  <label key={val} className="flex cursor-pointer items-center gap-3">
                    <div
                      onClick={() => setPayMethod(val)}
                      className={`flex h-5 w-5 items-center justify-center rounded-full border-2 transition-colors ${
                        payMethod === val ? 'border-primary' : 'border-[#C4C4C4]'
                      }`}
                    >
                      {payMethod === val && <div className="h-2.5 w-2.5 rounded-full bg-primary" />}
                    </div>
                    <span className="text-sm text-foreground">{label}</span>
                  </label>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-[4px] bg-primary py-4 text-sm font-medium text-white hover:opacity-90 transition-opacity disabled:opacity-60"
            >
              {isSubmitting ? '...' : t('checkout.place_order')}
            </button>
          </form>

          {/* ── Order summary ── */}
          <div className="w-full lg:w-[325px] shrink-0">
            <div className="space-y-4">
              {items.map((item) => {
                const price = item.product.hasDiscount
                  ? item.product.discountPrice ?? item.product.price
                  : item.product.price
                const img = item.product.images?.[0]?.imageName
                return (
                  <div key={item.productId} className="flex items-center gap-4">
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-[4px] bg-[#F5F5F5]">
                      <img
                        src={getImageUrl(img)}
                        alt={item.product.productName}
                        className="h-full w-full object-cover"
                      />
                      <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#8D8D8D] text-[10px] font-medium text-white">
                        {item.quantity}
                      </span>
                    </div>
                    <p className="flex-1 text-sm text-foreground line-clamp-2">{item.product.productName}</p>
                    <span className="text-sm font-medium text-foreground">${(price * item.quantity).toFixed(2)}</span>
                  </div>
                )
              })}

              <div className="h-px bg-[#EBEBEB]" />

              <div className="flex justify-between text-sm">
                <span className="text-[#8D8D8D]">{t('cart.subtotal')}</span>
                <span className="font-medium text-foreground">${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#8D8D8D]">{t('cart.shipping')}</span>
                <span className="font-medium text-[#00FF66]">{t('cart.free_shipping')}</span>
              </div>
              <div className="h-px bg-[#EBEBEB]" />
              <div className="flex justify-between text-sm font-semibold">
                <span className="text-foreground">{t('cart.total')}</span>
                <span className="text-foreground">${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
