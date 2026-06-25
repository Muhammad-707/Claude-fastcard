import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowRight, ChevronRight, ChevronLeft,
  Truck, Headphones, ShieldCheck,
  Smartphone, Monitor, Watch, Camera, Gamepad2,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Pagination } from 'swiper/modules'
import type { Swiper as SwiperType } from 'swiper'
import 'swiper/css'
import 'swiper/css/pagination'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { fetchProducts } from '@/features/products/model/productsSlice'
import { fetchCategories } from '@/features/categories/model/categoriesSlice'
import { ProductCard } from '@/entities/product-card'
import { NetworkError } from '@/shared/ui/network-error'
import { Header } from '@/widgets/header'
import { Footer } from '@/widgets/footer'
import { getImageUrl } from '@/shared/lib/image'

/* ─── Countdown Timer ─── */
function CountdownTimer({ seconds: initial }: { seconds: number }) {
  const [left, setLeft] = useState(initial)
  const { t } = useTranslation()
  useEffect(() => {
    const id = setInterval(() => setLeft((v) => (v > 0 ? v - 1 : 0)), 1000)
    return () => clearInterval(id)
  }, [])
  const h = Math.floor(left / 3600)
  const m = Math.floor((left % 3600) / 60)
  const s = left % 60
  const pad = (n: number) => String(n).padStart(2, '0')
  const units = [
    [t('home.timer_hours'),   h],
    [t('home.timer_minutes'), m],
    [t('home.timer_seconds'), s],
  ] as [string, number][]
  return (
    <div className="flex items-center gap-2">
      {units.map(([label, val], i) => (
        <div key={label} className="flex items-center">
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-foreground/60">{label}</span>
            <span className="text-3xl font-bold tabular-nums text-foreground">{pad(val)}</span>
          </div>
          {i < 2 && <span className="mx-2 self-end pb-0.5 text-2xl font-bold text-[#DB4444]">:</span>}
        </div>
      ))}
    </div>
  )
}

/* ─── Section Label ─── */
function SectionLabel({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-8 w-[14px] shrink-0 rounded-[4px] bg-[#DB4444]" />
      <span className="text-base font-semibold text-[#DB4444]">{label}</span>
    </div>
  )
}

/* ─── Skeleton ─── */
function ProductSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-[290px] rounded-[4px] bg-muted" />
      <div className="mt-3 h-4 w-3/4 rounded bg-muted" />
      <div className="mt-2 h-3 w-1/2 rounded bg-muted" />
    </div>
  )
}

/* ─── Category icon resolver ─── */
const ICON_MAP = [
  { match: ['phone', 'mobile', 'смартфон', 'телефон'],         Icon: Smartphone },
  { match: ['computer', 'laptop', 'компьютер', 'ноутбук'],     Icon: Monitor    },
  { match: ['watch', 'часы', 'соат'],                          Icon: Watch      },
  { match: ['camera', 'камера'],                               Icon: Camera     },
  { match: ['headphone', 'наушник', 'гӯшмонак', 'audio'],     Icon: Headphones },
  { match: ['gaming', 'game', 'игров', 'бозӣ', 'бозиҳо'],     Icon: Gamepad2   },
] as const

function getCategoryIcon(name: string) {
  const n = name.toLowerCase()
  return ICON_MAP.find((e) => e.match.some((kw) => n.includes(kw)))?.Icon ?? null
}

/* ─── Category card icon ─── */
function CategoryIcon({ name, image }: { name: string; image: string }) {
  if (image) {
    return (
      <img
        src={getImageUrl(image)}
        alt={name}
        className="h-full w-full object-contain transition-all duration-300 group-hover:brightness-[200]"
      />
    )
  }
  const Icon = getCategoryIcon(name)
  if (Icon) {
    return <Icon className="h-9 w-9 text-foreground transition-colors duration-300 group-hover:text-white" />
  }
  return (
    <span className="text-3xl transition-all duration-300 group-hover:brightness-[200]">📦</span>
  )
}

/* ─── Hero slide visual configs (no text — text lives in i18n) ─── */
const SLIDE_CONFIGS = [
  { n: 1, bg: 'from-gray-900 via-gray-800 to-gray-700',      img: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=1400&q=85',  cta: '/products' },
  { n: 2, bg: 'from-blue-950 via-blue-900 to-indigo-900',    img: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=1400&q=85',  cta: '/products' },
  { n: 3, bg: 'from-purple-950 via-purple-900 to-pink-900',  img: 'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=1400&q=85',  cta: '/products' },
  { n: 4, bg: 'from-emerald-950 via-emerald-900 to-teal-900',img: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=1400&q=85',  cta: '/products' },
  { n: 5, bg: 'from-orange-950 via-orange-900 to-amber-900', img: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=1400&q=85',  cta: '/products' },
  { n: 6, bg: 'from-indigo-950 via-indigo-900 to-violet-950',img: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1400&q=85',  cta: '/products' },
  { n: 7, bg: 'from-rose-950 via-rose-900 to-pink-950',      img: 'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=1400&q=85',  cta: '/products' },
] as const

/* ─── Product Swiper Section ─── */
interface ProductSwiperProps {
  products: import('@/shared/api/types').Product[]
  showBadge?: 'new' | 'sale'
  prevRef: React.RefObject<HTMLButtonElement | null>
  nextRef: React.RefObject<HTMLButtonElement | null>
}

function ProductSwiperSection({ products, showBadge, prevRef, nextRef }: ProductSwiperProps) {
  const swiperRef = useRef<SwiperType | null>(null)

  useEffect(() => {
    const prev = prevRef.current
    const next = nextRef.current
    if (!prev || !next) return
    const onPrev = () => swiperRef.current?.slidePrev()
    const onNext = () => swiperRef.current?.slideNext()
    prev.addEventListener('click', onPrev)
    next.addEventListener('click', onNext)
    return () => {
      prev.removeEventListener('click', onPrev)
      next.removeEventListener('click', onNext)
    }
  }, [prevRef, nextRef])

  if (products.length === 0) return null

  return (
    <div className="mt-8">
      <Swiper
        onSwiper={(swiper) => { swiperRef.current = swiper }}
        spaceBetween={12}
        slidesPerView={1.4}
        breakpoints={{
          480: { slidesPerView: 2, spaceBetween: 16 },
          640: { slidesPerView: 3, spaceBetween: 20 },
          1024: { slidesPerView: 4, spaceBetween: 20 },
        }}
      >
        {products.map((p) => (
          <SwiperSlide key={p.id}>
            <ProductCard product={p} showBadge={showBadge} />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  )
}

/* ─── Nav button helper ─── */
function NavBtn({ dir, refProp }: { dir: 'prev' | 'next'; refProp: React.RefObject<HTMLButtonElement | null> }) {
  const Icon = dir === 'prev' ? ChevronLeft : ChevronRight
  return (
    <button
      ref={refProp}
      className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F5F5F5] text-foreground transition-colors hover:bg-[#DB4444] hover:text-white dark:bg-white/10"
    >
      <Icon className="h-5 w-5" />
    </button>
  )
}

/* ════════════════════════════════════════════ */
export default function HomePage() {
/* ════════════════════════════════════════════ */
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { list: products, listStatus } = useAppSelector((s) => s.products)
  const { items: categories } = useAppSelector((s) => s.categories)

  const flashPrev    = useRef<HTMLButtonElement>(null)
  const flashNext    = useRef<HTMLButtonElement>(null)
  const bestPrev     = useRef<HTMLButtonElement>(null)
  const bestNext     = useRef<HTMLButtonElement>(null)
  const explorePrev  = useRef<HTMLButtonElement>(null)
  const exploreNext  = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    dispatch(fetchProducts({ pageNumber: 1, pageSize: 20 }))
    dispatch(fetchCategories())
  }, [dispatch])

  /* ── Translated hero slides ── */
  const heroSlides = SLIDE_CONFIGS.map((s) => ({
    ...s,
    tag:   t(`home.slide${s.n}_tag`),
    title: t(`home.slide${s.n}_title`),
    sub:   t(`home.slide${s.n}_sub`),
  }))

  /* ── Figma categories — always shown (merged with API if API has results) ── */
  const figmaCategories = [
    { id: -1, categoryName: t('home.cat_phones'),      categoryImage: '', subCategories: [] },
    { id: -2, categoryName: t('home.cat_computers'),   categoryImage: '', subCategories: [] },
    { id: -3, categoryName: t('home.cat_smartwatch'),  categoryImage: '', subCategories: [] },
    { id: -4, categoryName: t('home.cat_camera'),      categoryImage: '', subCategories: [] },
    { id: -5, categoryName: t('home.cat_headphones'),  categoryImage: '', subCategories: [] },
    { id: -6, categoryName: t('home.cat_gaming'),      categoryImage: '', subCategories: [] },
  ]

  const safeProducts      = Array.isArray(products) ? products : []
  const flashSales        = safeProducts.slice(0, 8)
  const bestSelling       = safeProducts.slice(0, 4)
  const displayCategories = categories.length > 0 ? categories : figmaCategories

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />

      {/* ── Hero banner — mt-6 for breathing room below header ── */}
      <section className="mt-6 border-b border-border">
        <div className="mx-auto flex max-w-[1280px] flex-col lg:flex-row">

          {/* Sidebar categories */}
          <aside className="hidden w-[220px] shrink-0 border-r border-border py-6 lg:block">
            <ul className="space-y-0.5 pr-4">
              {displayCategories.map((cat) => (
                <li key={cat.id} className="group/item relative">
                  <button
                    onClick={() => cat.id > 0 && navigate(`/products?categoryId=${cat.id}`)}
                    className="flex w-full items-center justify-between rounded-[4px] px-4 py-2 text-base text-foreground transition-colors hover:bg-[#DB4444]/5 hover:text-[#DB4444]"
                  >
                    <span>{cat.categoryName}</span>
                    {cat.subCategories.length > 0 && <ChevronRight className="h-3.5 w-3.5 shrink-0" />}
                  </button>
                  {cat.subCategories.length > 0 && (
                    <div className="pointer-events-none absolute left-full top-0 z-30 ml-1 min-w-[180px] rounded-[4px] border border-border bg-background py-2 opacity-0 shadow-lg transition-all duration-150 group-hover/item:pointer-events-auto group-hover/item:opacity-100">
                      {cat.subCategories.map((sub) => (
                        <button
                          key={sub.id}
                          onClick={() =>
                            cat.id > 0
                              ? navigate(`/products?categoryId=${cat.id}&subcategoryId=${sub.id}`)
                              : navigate('/products')
                          }
                          className="block w-full px-4 py-2 text-left text-base text-foreground transition-colors hover:bg-muted hover:text-[#DB4444]"
                        >
                          {sub.subCategoryName}
                        </button>
                      ))}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </aside>

          {/* Hero Swiper — rounded-2xl clips slides to rounded corners */}
          <div className="relative flex-1 overflow-hidden rounded-2xl">
            <Swiper
              modules={[Autoplay, Pagination]}
              autoplay={{ delay: 4500, disableOnInteraction: false }}
              pagination={{ clickable: true }}
              loop
              className="h-[360px] lg:h-[420px]"
            >
              {heroSlides.map((slide) => (
                <SwiperSlide key={slide.n}>
                  <div className={`relative h-full w-full overflow-hidden bg-gradient-to-br ${slide.bg}`}>
                    <img
                      src={slide.img}
                      alt={slide.title}
                      className="absolute inset-0 h-full w-full object-cover opacity-30 mix-blend-luminosity"
                    />
                    <div className="absolute inset-0 flex flex-col justify-center px-10 lg:px-14">
                      <span className="inline-block w-fit rounded bg-[#DB4444]/90 px-3 py-1 text-xs font-bold uppercase tracking-widest text-white">
                        {slide.tag}
                      </span>
                      <h1 className="mt-4 max-w-md text-4xl font-bold leading-tight text-white lg:text-5xl">
                        {slide.title}
                      </h1>
                      <p className="mt-3 max-w-xs text-sm text-white/70">{slide.sub}</p>
                      <Link
                        to={slide.cta}
                        className="mt-7 inline-flex w-fit items-center gap-2 border-b-2 border-white pb-0.5 text-sm font-bold text-white transition-colors hover:border-[#DB4444] hover:text-[#DB4444]"
                      >
                        {t('home.hero_cta')} <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      </section>

      <main className="mx-auto w-full max-w-[1280px] px-4 xl:px-0">

        {/* ── Flash Sales ── */}
        <section className="mt-16">
          <SectionLabel label={t('products.flash_sales')} />
          <div className="mt-5 flex flex-wrap items-end justify-between gap-6">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:gap-12">
              <h2 className="text-4xl font-bold text-foreground">{t('products.flash_sales_title')}</h2>
              <CountdownTimer seconds={3 * 3600 + 23 * 60 + 19} />
            </div>
            <div className="flex gap-2">
              <NavBtn dir="prev" refProp={flashPrev} />
              <NavBtn dir="next" refProp={flashNext} />
            </div>
          </div>

          {listStatus === 'loading' && (
            <div className="mt-8 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => <ProductSkeleton key={i} />)}
            </div>
          )}
          {listStatus === 'error' && (
            <div className="mt-8">
              <NetworkError onRetry={() => dispatch(fetchProducts({ pageNumber: 1, pageSize: 20 }))} />
            </div>
          )}
          {listStatus === 'success' && (
            <ProductSwiperSection products={flashSales} showBadge="sale" prevRef={flashPrev} nextRef={flashNext} />
          )}

          <div className="mt-10 flex justify-center">
            <Link
              to="/products"
              className="rounded-[4px] bg-[#DB4444] px-12 py-3.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            >
              {t('home.view_all')}
            </Link>
          </div>
        </section>

        <div className="my-16 h-px bg-border" />

        {/* ── Browse By Category ── */}
        <section>
          <SectionLabel label={t('products.explore_products')} />
          <h2 className="mt-5 text-4xl font-bold text-foreground">{t('home.categories_title')}</h2>

          <Swiper
            className="mt-10"
            slidesPerView={2.5}
            spaceBetween={16}
            breakpoints={{
              480:  { slidesPerView: 3,   spaceBetween: 16 },
              640:  { slidesPerView: 4,   spaceBetween: 20 },
              768:  { slidesPerView: 5,   spaceBetween: 20 },
              1024: { slidesPerView: 6,   spaceBetween: 24 },
            }}
          >
            {displayCategories.map((cat) => (
              <SwiperSlide key={cat.id} className="h-auto">
                <Link
                  to={cat.id > 0 ? `/products?categoryId=${cat.id}` : '/products'}
                  className="group flex h-full flex-col items-center gap-3 rounded-[4px] border border-border bg-background px-3 py-6 text-center transition-all duration-300 ease-in-out hover:border-[#DB4444] hover:bg-[#DB4444] hover:shadow-lg"
                >
                  <div className="flex h-14 w-14 items-center justify-center">
                    <CategoryIcon name={cat.categoryName} image={cat.categoryImage} />
                  </div>
                  <span className="text-sm font-medium leading-tight text-foreground transition-colors duration-300 group-hover:text-white">
                    {cat.categoryName}
                  </span>
                </Link>
              </SwiperSlide>
            ))}
          </Swiper>
        </section>

        <div className="my-16 h-px bg-border" />

        {/* ── Best Selling ── */}
        <section>
          <SectionLabel label={t('products.best_selling')} />
          <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-4xl font-bold text-foreground">{t('products.best_selling_title')}</h2>
            <div className="flex items-center gap-3">
              <div className="flex gap-2">
                <NavBtn dir="prev" refProp={bestPrev} />
                <NavBtn dir="next" refProp={bestNext} />
              </div>
              <Link
                to="/products"
                className="rounded-[4px] bg-[#DB4444] px-8 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              >
                {t('home.view_all')}
              </Link>
            </div>
          </div>
          {listStatus === 'success' && (
            <ProductSwiperSection products={bestSelling} showBadge="new" prevRef={bestPrev} nextRef={bestNext} />
          )}
          {listStatus === 'loading' && (
            <div className="mt-8 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => <ProductSkeleton key={i} />)}
            </div>
          )}
        </section>

        {/* ── Enhance Your Music ── */}
        <div className="my-16 overflow-hidden rounded-2xl bg-black">
          <div className="flex min-h-[450px] flex-col items-stretch lg:flex-row">
            <div className="flex flex-1 flex-col justify-center px-10 py-16 lg:px-14 lg:py-20">
              <p className="text-sm font-bold uppercase tracking-widest text-[#00FF66]">{t('home.music_label')}</p>
              <h3 className="mt-3 text-3xl font-bold leading-snug text-white lg:text-4xl">
                {t('home.music_title')}
              </h3>
              <div className="mt-8 flex flex-wrap gap-4">
                {([
                  ['23', t('home.timer_hours_abbr')],
                  ['05', t('home.timer_days_abbr')],
                  ['59', t('home.timer_minutes_abbr')],
                  ['35', t('home.timer_seconds_abbr')],
                ] as [string, string][]).map(([num, lbl]) => (
                  <div key={lbl} className="flex min-w-[64px] flex-col items-center rounded-full bg-white px-3 py-2.5">
                    <span className="text-xl font-bold text-black">{num}</span>
                    <span className="text-[10px] text-gray-500">{lbl}</span>
                  </div>
                ))}
              </div>
              <Link
                to="/products"
                className="mt-8 inline-block w-fit rounded-[4px] bg-[#00FF66] px-9 py-3.5 text-sm font-bold text-black transition-opacity hover:opacity-90"
              >
                {t('home.hero_cta')}
              </Link>
            </div>
            <div className="relative flex-1">
              <img
                src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=85"
                alt={t('home.music_img_alt')}
                className="h-full min-h-[300px] w-full object-cover object-center lg:min-h-[450px]"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-transparent opacity-60 lg:hidden" />
            </div>
          </div>
        </div>

        {/* ── Explore Products ── */}
        <section>
          <SectionLabel label={t('products.explore_products')} />
          <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-4xl font-bold text-foreground">{t('products.explore_subtitle')}</h2>
            <div className="flex gap-2">
              <NavBtn dir="prev" refProp={explorePrev} />
              <NavBtn dir="next" refProp={exploreNext} />
            </div>
          </div>
          {listStatus === 'success' && (
            <ProductSwiperSection products={safeProducts} prevRef={explorePrev} nextRef={exploreNext} />
          )}
          {listStatus === 'loading' && (
            <div className="mt-8 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => <ProductSkeleton key={i} />)}
            </div>
          )}
          <div className="mt-10 flex justify-center">
            <Link
              to="/products"
              className="rounded-[4px] bg-[#DB4444] px-12 py-3.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            >
              {t('home.view_all')}
            </Link>
          </div>
        </section>

        {/* ── New Arrival ── */}
        <section className="mt-16">
          <SectionLabel label={t('products.new_arrival')} />
          <h2 className="mt-5 text-4xl font-bold text-foreground">{t('products.new_arrival_title')}</h2>

          <div className="mt-10 grid grid-cols-1 gap-4 lg:grid-cols-2">
            {/* Large card */}
            <div className="relative overflow-hidden rounded-2xl bg-black">
              <img
                src="https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=700&q=85"
                alt={t('home.arrival_ps5')}
                className="h-[550px] w-full object-cover object-center opacity-70"
              />
              <div className="absolute bottom-8 left-8 right-8">
                <p className="text-xl font-bold text-white">{t('home.arrival_ps5')}</p>
                <p className="mt-1.5 max-w-[260px] text-sm leading-relaxed text-white/70">
                  {t('home.arrival_ps5_desc')}
                </p>
                <Link
                  to="/products"
                  className="mt-4 inline-flex items-center gap-1.5 border-b-2 border-white pb-0.5 text-sm font-bold text-white transition-colors hover:border-[#DB4444] hover:text-[#DB4444]"
                >
                  {t('home.hero_cta')} <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            {/* Right column */}
            <div className="flex flex-col gap-4">
              <div className="relative overflow-hidden rounded-2xl bg-black">
                <img
                  src="https://images.unsplash.com/photo-1445205170230-053b83016050?w=700&q=85"
                  alt={t('home.arrival_womens')}
                  className="h-[250px] w-full object-cover object-center opacity-70"
                />
                <div className="absolute bottom-6 left-6">
                  <p className="text-base font-bold text-white">{t('home.arrival_womens')}</p>
                  <p className="mt-1 max-w-[200px] text-xs text-white/70">{t('home.arrival_womens_desc')}</p>
                  <Link to="/products" className="mt-2.5 inline-flex items-center gap-1 border-b border-white pb-0.5 text-xs font-bold text-white transition-colors hover:border-[#DB4444] hover:text-[#DB4444]">
                    {t('home.hero_cta')} <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="relative overflow-hidden rounded-2xl bg-black">
                  <img
                    src="https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&q=85"
                    alt={t('home.arrival_speakers')}
                    className="h-[248px] w-full object-cover object-center opacity-70"
                  />
                  <div className="absolute bottom-5 left-5">
                    <p className="text-sm font-bold text-white">{t('home.arrival_speakers')}</p>
                    <p className="mt-1 text-xs text-white/70">{t('home.arrival_speakers_desc')}</p>
                    <Link to="/products" className="mt-2 inline-flex items-center gap-1 border-b border-white pb-0.5 text-xs font-bold text-white transition-colors hover:border-[#DB4444] hover:text-[#DB4444]">
                      {t('home.hero_cta')} <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
                <div className="relative overflow-hidden rounded-2xl bg-black">
                  <img
                    src="https://images.unsplash.com/photo-1541643600914-78b084683702?w=400&q=85"
                    alt={t('home.arrival_perfume')}
                    className="h-[248px] w-full object-cover object-center opacity-70"
                  />
                  <div className="absolute bottom-5 left-5">
                    <p className="text-sm font-bold text-white">{t('home.arrival_perfume')}</p>
                    <p className="mt-1 text-xs text-white/70">{t('home.arrival_perfume_desc')}</p>
                    <Link to="/products" className="mt-2 inline-flex items-center gap-1 border-b border-white pb-0.5 text-xs font-bold text-white transition-colors hover:border-[#DB4444] hover:text-[#DB4444]">
                      {t('home.hero_cta')} <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Services ── */}
        <section className="my-16 grid grid-cols-1 gap-8 sm:grid-cols-3">
          {[
            { icon: <Truck className="h-10 w-10" />, title: t('home.services_delivery'),   desc: t('home.services_delivery_desc') },
            { icon: <Headphones className="h-10 w-10" />, title: t('home.services_support'), desc: t('home.services_support_desc') },
            { icon: <ShieldCheck className="h-10 w-10" />, title: t('home.services_guarantee'), desc: t('home.services_guarantee_desc') },
          ].map((s) => (
            <div key={s.title} className="flex flex-col items-center gap-4 text-center">
              <div className="flex h-[80px] w-[80px] items-center justify-center rounded-full bg-[#2D2D2D] text-white ring-[10px] ring-[#C1C1C1]/20">
                {s.icon}
              </div>
              <div>
                <p className="text-sm font-bold uppercase tracking-widest text-foreground">{s.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{s.desc}</p>
              </div>
            </div>
          ))}
        </section>
      </main>

      <Footer />
    </div>
  )
}
