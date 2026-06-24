import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ShoppingBag, Shield, Zap } from 'lucide-react'

export function AuthLayout({ children }: { children: ReactNode }) {
  const { t } = useTranslation()

  return (
    <div className="flex min-h-screen">
      {/* ── Left panel ── */}
      <div className="relative hidden overflow-hidden lg:flex lg:w-1/2">
        {/* Background image */}
        <img
          src="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1400&q=85"
          alt="Shopping"
          className="absolute inset-0 h-full w-full object-cover"
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/60 to-[#DB4444]/30" />

        {/* Content */}
        <div className="relative z-10 flex h-full w-full flex-col justify-between p-12">
          {/* Logo */}
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-[4px] bg-[#DB4444]">
              <ShoppingBag className="h-5 w-5 text-white" />
            </div>
            <span className="text-2xl font-bold italic tracking-wide text-white">fastcart</span>
          </Link>

          {/* Center text */}
          <div>
            <h1 className="text-4xl font-bold leading-tight text-white">
              {t('auth.brand_tagline')}
            </h1>
            <p className="mt-4 max-w-sm text-base text-white/70">{t('auth.brand_desc')}</p>

            {/* Feature bullets */}
            <div className="mt-8 space-y-3">
              {([
                ['Shield', t('home.services_guarantee')],
                ['Zap', t('home.services_delivery')],
                ['ShoppingBag', t('home.services_support')],
              ] as const).map(([icon, text]) => (
                <div key={icon} className="flex items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-white">
                    {icon === 'Shield' && <Shield className="h-4 w-4" />}
                    {icon === 'Zap' && <Zap className="h-4 w-4" />}
                    {icon === 'ShoppingBag' && <ShoppingBag className="h-4 w-4" />}
                  </div>
                  <span className="text-sm font-medium text-white/80">{text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            {([
              ['10K+', t('auth.stat_users')],
              ['5K+', t('auth.stat_products')],
              ['98%', t('auth.stat_satisfaction')],
            ] as const).map(([val, label]) => (
              <div key={val} className="rounded-[4px] bg-white/10 px-4 py-3 text-center backdrop-blur-sm">
                <p className="text-2xl font-bold text-white">{val}</p>
                <p className="mt-0.5 text-xs text-white/60">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right panel ── */}
      <div className="flex w-full flex-col bg-background lg:w-1/2">
        {/* Mobile logo */}
        <div className="flex items-center gap-2 p-6 lg:hidden">
          <div className="flex h-8 w-8 items-center justify-center rounded-[4px] bg-[#DB4444]">
            <ShoppingBag className="h-4 w-4 text-white" />
          </div>
          <Link to="/" className="text-xl font-bold italic tracking-wide text-foreground">
            fastcart
          </Link>
        </div>

        {/* Form area */}
        <div className="flex flex-1 items-center justify-center px-6 py-8 sm:px-12">
          <div className="w-full max-w-[428px]">{children}</div>
        </div>
      </div>
    </div>
  )
}
