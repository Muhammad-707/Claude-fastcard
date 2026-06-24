import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

interface AuthLayoutProps {
  children: ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
  const { t } = useTranslation()

  return (
    <div className="flex min-h-screen">
      {/* ── Left — illustration ── */}
      <div className="relative hidden overflow-hidden bg-[#F5F5F5] lg:flex lg:w-1/2 lg:flex-col lg:items-center lg:justify-center lg:p-12">
        <Link
          to="/"
          className="absolute left-8 top-8 text-2xl font-bold italic tracking-wide text-foreground"
        >
          fastcart
        </Link>

        <div className="relative z-10 text-center">
          <img
            src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=640&q=80"
            alt="Shopping"
            className="mx-auto h-72 w-72 rounded-2xl object-cover shadow-2xl"
          />

          <div className="mt-8 space-y-2">
            <h2 className="text-2xl font-bold text-foreground">{t('auth.brand_tagline')}</h2>
            <p className="mx-auto max-w-xs text-sm text-[#8D8D8D]">{t('auth.brand_desc')}</p>
          </div>

          <div className="mt-8 flex justify-center gap-10">
            {([
              ['10K+', 'auth.stat_users'],
              ['5K+', 'auth.stat_products'],
              ['98%', 'auth.stat_satisfaction'],
            ] as const).map(([value, key]) => (
              <div key={key} className="text-center">
                <p className="text-2xl font-bold text-foreground">{value}</p>
                <p className="mt-1 text-xs text-[#8D8D8D]">{t(key)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right — form ── */}
      <div className="flex w-full flex-col items-center justify-center bg-background px-6 py-12 sm:px-12 lg:w-1/2">
        <div className="mb-8 lg:hidden">
          <Link to="/" className="text-2xl font-bold italic tracking-wide text-foreground">
            fastcart
          </Link>
        </div>

        <div className="w-full max-w-[428px]">{children}</div>
      </div>
    </div>
  )
}
