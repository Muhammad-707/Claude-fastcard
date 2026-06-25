import { Link } from 'react-router-dom'
import { ChevronRight, ShoppingBag, DollarSign, Users, Star, Truck, Headphones, ShieldCheck } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Header } from '@/widgets/header'
import { Footer } from '@/widgets/footer'

const STATS = [
  { icon: <ShoppingBag className="h-7 w-7" />, value: '10.5k', key: 'about.stat_sellers' },
  { icon: <DollarSign className="h-7 w-7" />, value: '33k', key: 'about.stat_sales' },
  { icon: <Users className="h-7 w-7" />, value: '45.5k', key: 'about.stat_customers' },
  { icon: <Star className="h-7 w-7" />, value: '25k', key: 'about.stat_gross' },
]

const TEAM = [
  {
    name: 'Tom Cruise',
    role: 'Founder & Chairman',
    img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&q=80',
    social: { twitter: '#', instagram: '#', linkedin: '#' },
  },
  {
    name: 'Emma Watson',
    role: 'Managing Director',
    img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&q=80',
    social: { twitter: '#', instagram: '#', linkedin: '#' },
  },
  {
    name: 'Will Smith',
    role: 'Product Designer',
    img: 'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=300&q=80',
    social: { twitter: '#', instagram: '#', linkedin: '#' },
  },
]

const SERVICES = [
  { icon: <Truck className="h-10 w-10" />, key: 'home.services_delivery', descKey: 'home.services_delivery_desc' },
  { icon: <Headphones className="h-10 w-10" />, key: 'home.services_support', descKey: 'home.services_support_desc' },
  { icon: <ShieldCheck className="h-10 w-10" />, key: 'home.services_guarantee', descKey: 'home.services_guarantee_desc' },
]

function TwitterIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
      <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
    </svg>
  )
}
function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  )
}
function LinkedinIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  )
}

export default function AboutPage() {
  const { t } = useTranslation()

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
            <span className="text-foreground">{t('nav.about')}</span>
          </nav>
        </div>

        {/* ── Hero ── */}
        <section className="mx-auto max-w-[1280px] px-4 py-10 xl:px-0">
          <div className="flex flex-col-reverse items-center gap-10 lg:flex-row">
            <div className="flex-1">
              <h1 className="text-4xl font-semibold text-foreground lg:text-5xl">
                {t('about.title')}
              </h1>
              <p className="mt-6 text-sm leading-7 text-[#8D8D8D]">
                {t('about.hero_desc_1')}
              </p>
              <p className="mt-4 text-sm leading-7 text-[#8D8D8D]">
                {t('about.hero_desc_2')}
              </p>
            </div>
            <div className="w-full lg:w-1/2">
              <div className="relative overflow-hidden rounded-[4px] bg-[#F5F5F5]">
                <img
                  src="https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=700&q=80"
                  alt="About us"
                  className="h-[400px] w-full object-cover"
                />
                <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/60 p-8">
                  <p className="text-xl font-semibold text-white">
                    Delivering quality products since 2010
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Stats ── */}
        <section className="mx-auto max-w-[1280px] px-4 py-12 xl:px-0">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {STATS.map((s, i) => (
              <div
                key={i}
                className="flex flex-col items-center gap-4 rounded-[4px] border border-[#EBEBEB] px-6 py-8 text-center transition-all hover:border-primary hover:bg-primary hover:text-white"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-full border-8 border-[#C1C1C1]/30 bg-[#2D2D2D] text-white">
                  {s.icon}
                </div>
                <div>
                  <p className="text-2xl font-bold">{s.value}</p>
                  <p className="mt-1 text-sm">{t(s.key)}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Team ── */}
        <section className="mx-auto max-w-[1280px] px-4 py-12 xl:px-0">
          <h2 className="mb-10 text-center text-2xl font-semibold text-foreground">
            {t('about.team_title')}
          </h2>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {TEAM.map((member) => (
              <div key={member.name} className="group">
                <div className="overflow-hidden rounded-[4px] bg-[#F5F5F5]">
                  <img
                    src={member.img}
                    alt={member.name}
                    className="h-[440px] w-full object-cover object-top transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="mt-4">
                  <p className="text-base font-semibold text-foreground">{member.name}</p>
                  <p className="mt-1 text-sm text-[#8D8D8D]">{member.role}</p>
                  <div className="mt-3 flex items-center gap-3">
                    <a
                      href={member.social.twitter}
                      className="text-foreground transition-colors hover:text-primary"
                      aria-label="Twitter"
                    >
                      <TwitterIcon />
                    </a>
                    <a
                      href={member.social.instagram}
                      className="text-foreground transition-colors hover:text-primary"
                      aria-label="Instagram"
                    >
                      <InstagramIcon />
                    </a>
                    <a
                      href={member.social.linkedin}
                      className="text-foreground transition-colors hover:text-primary"
                      aria-label="LinkedIn"
                    >
                      <LinkedinIcon />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination dots */}
          <div className="mt-10 flex justify-center gap-3">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={`h-3 w-3 rounded-full transition-colors ${i === 0 ? 'bg-primary' : 'bg-[#EBEBEB]'}`}
              />
            ))}
          </div>
        </section>

        {/* ── Services ── */}
        <section className="mx-auto max-w-[1280px] px-4 py-12 xl:px-0">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            {SERVICES.map((s) => (
              <div key={s.key} className="flex flex-col items-center gap-3 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#2D2D2D] text-white ring-8 ring-[#C1C1C1]/20">
                  {s.icon}
                </div>
                <p className="text-sm font-bold text-foreground">{t(s.key)}</p>
                <p className="text-sm text-[#8D8D8D]">{t(s.descKey)}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
