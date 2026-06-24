import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Header } from '@/widgets/header'
import { Footer } from '@/widgets/footer'

export default function NotFoundPage() {
  const { t } = useTranslation()

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />

      <main className="flex flex-1 flex-col">
        {/* Breadcrumb */}
        <div className="mx-auto w-full max-w-[1170px] px-4 py-5 xl:px-0">
          <nav className="flex items-center gap-2 text-sm text-[#8D8D8D]">
            <Link to="/" className="transition-colors hover:text-foreground">
              {t('nav.home')}
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground">{t('page404.breadcrumb')}</span>
          </nav>
        </div>

        {/* 404 content */}
        <div className="flex flex-1 flex-col items-center justify-center px-4 py-16 text-center">
          <h1 className="text-4xl font-medium text-foreground sm:text-5xl">
            {t('page404.title')}
          </h1>
          <p className="mt-5 text-base text-[#8D8D8D]">{t('page404.description')}</p>
          <Link
            to="/"
            className="mt-10 inline-block rounded-[4px] bg-primary px-12 py-4 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            {t('page404.back_home')}
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  )
}
