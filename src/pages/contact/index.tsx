import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ChevronRight, Phone, Mail, MapPin } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Header } from '@/widgets/header'
import { Footer } from '@/widgets/footer'

const schema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  message: z.string().min(10),
})
type FormValues = z.infer<typeof schema>

export default function ContactPage() {
  const { t } = useTranslation()
  const [sending, setSending] = useState(false)

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (_data: FormValues) => {
    setSending(true)
    await new Promise((r) => setTimeout(r, 800))
    setSending(false)
    reset()
    toast.success(t('contact.sent'))
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />

      <main className="flex-1">
        {/* ── Breadcrumb ── */}
        <div className="mx-auto w-full max-w-[1280px] px-4 py-5 xl:px-0">
          <nav className="flex items-center gap-2 text-sm text-[#8D8D8D]">
            <Link to="/" className="transition-colors hover:text-foreground">
              {t('nav.home')}
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground">{t('nav.contact')}</span>
          </nav>
        </div>

        <section className="mx-auto max-w-[1280px] px-4 py-10 xl:px-0">
          <div className="flex flex-col gap-8 lg:flex-row">

            {/* ── Contact info ── */}
            <div className="w-full rounded-[4px] border border-[#EBEBEB] p-8 shadow-sm lg:w-[340px] lg:shrink-0">
              <div className="space-y-8">
                {/* Phone */}
                <div>
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white">
                      <Phone className="h-5 w-5" />
                    </div>
                    <h3 className="text-base font-medium text-foreground">{t('contact.phone_label')}</h3>
                  </div>
                  <p className="text-sm text-[#8D8D8D]">We are available 24/7, 7 days a week.</p>
                  <p className="mt-2 text-sm font-medium text-foreground">Phone: +8801611112222</p>
                  <p className="text-sm font-medium text-foreground">Whatsapp: +8801611112222</p>
                </div>

                <div className="h-px bg-[#EBEBEB]" />

                {/* Email */}
                <div>
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white">
                      <Mail className="h-5 w-5" />
                    </div>
                    <h3 className="text-base font-medium text-foreground">{t('contact.email_label')}</h3>
                  </div>
                  <p className="text-sm text-[#8D8D8D]">Fill out our form and we will contact you within 24 hours.</p>
                  <p className="mt-2 text-sm font-medium text-foreground">Emails: customer@exclusive.com</p>
                  <p className="text-sm font-medium text-foreground">Emails: support@exclusive.com</p>
                </div>

                <div className="h-px bg-[#EBEBEB]" />

                {/* Address */}
                <div>
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <h3 className="text-base font-medium text-foreground">{t('contact.address_label')}</h3>
                  </div>
                  <p className="text-sm text-[#8D8D8D]">{t('contact.working_hours')}</p>
                  <p className="mt-2 text-sm font-medium text-foreground">
                    111 Bijoy sarani, Dhaka, DH 1515, Bangladesh.
                  </p>
                </div>
              </div>
            </div>

            {/* ── Contact form ── */}
            <div className="flex-1 rounded-[4px] border border-[#EBEBEB] p-8 shadow-sm">
              <h1 className="mb-2 text-xl font-semibold text-foreground">{t('contact.title')}</h1>
              <p className="mb-8 text-sm text-[#8D8D8D]">{t('contact.subtitle')}</p>

              <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
                {/* Name / Email / Phone row */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <input
                      {...register('name')}
                      placeholder={t('contact.name_placeholder')}
                      className={`w-full rounded-[4px] border bg-[#F5F5F5] px-4 py-3.5 text-sm text-foreground outline-none placeholder:text-[#8D8D8D] transition-colors focus:border-primary ${
                        errors.name ? 'border-primary' : 'border-transparent'
                      }`}
                    />
                  </div>
                  <div>
                    <input
                      {...register('email')}
                      type="email"
                      placeholder={t('contact.email_placeholder')}
                      className={`w-full rounded-[4px] border bg-[#F5F5F5] px-4 py-3.5 text-sm text-foreground outline-none placeholder:text-[#8D8D8D] transition-colors focus:border-primary ${
                        errors.email ? 'border-primary' : 'border-transparent'
                      }`}
                    />
                  </div>
                  <div>
                    <input
                      {...register('phone')}
                      type="tel"
                      placeholder={t('contact.phone_placeholder')}
                      className="w-full rounded-[4px] border border-transparent bg-[#F5F5F5] px-4 py-3.5 text-sm text-foreground outline-none placeholder:text-[#8D8D8D] transition-colors focus:border-primary"
                    />
                  </div>
                </div>

                {/* Message */}
                <div>
                  <textarea
                    {...register('message')}
                    placeholder={t('contact.message_placeholder')}
                    rows={7}
                    className={`w-full resize-none rounded-[4px] border bg-[#F5F5F5] px-4 py-3.5 text-sm text-foreground outline-none placeholder:text-[#8D8D8D] transition-colors focus:border-primary ${
                      errors.message ? 'border-primary' : 'border-transparent'
                    }`}
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={sending}
                    className="rounded-[4px] bg-primary px-12 py-4 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
                  >
                    {sending ? '...' : t('contact.send')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
