import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Header } from '@/widgets/header'
import { Footer } from '@/widgets/footer'

export default function NotFoundPage() {
  const { t } = useTranslation()

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />

      <main className="flex flex-1 flex-col items-center justify-center px-4 py-20 text-center">
        <h1 className="text-[80px] font-medium leading-none tracking-tight text-foreground sm:text-[96px] lg:text-[110px]">
          {t('page404.title')}
        </h1>
        <p className="mt-6 text-sm text-muted-foreground">{t('page404.description')}</p>
        <Link
          to="/"
          className="mt-10 inline-block rounded-[4px] bg-[#DB4444] px-12 py-4 text-sm font-medium text-white transition-opacity hover:opacity-90"
        >
          {t('page404.back_home')}
        </Link>
      </main>

      <Footer />
    </div>
  )
}
