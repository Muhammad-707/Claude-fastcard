import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, ChevronRight, ChevronLeft, Truck, Headphones, ShieldCheck } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Pagination, Navigation } from 'swiper/modules'
import type { Swiper as SwiperType } from 'swiper'
import 'swiper/css'
import 'swiper/css/pagination'
import 'swiper/css/navigation'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { fetchProducts } from '@/features/products/model/productsSlice'
import { fetchCategories } from '@/features/categories/model/categoriesSlice'
import { ProductCard } from '@/entities/product-card'
import { NetworkError } from '@/shared/ui/network-error'
import { Header } from '@/widgets/header'
import { Footer } from '@/widgets/footer'
import { getImageUrl } from '@/shared/lib/image'

function CountdownTimer({ seconds: initial }: { seconds: number }) {
  const [left, setLeft] = useState(initial)
  useEffect(() => {
    const id = setInterval(() => setLeft((v) => (v > 0 ? v - 1 : 0)), 1000)
    return () => clearInterval(id)
  }, [])
  const h = Math.floor(left / 3600)
  const m = Math.floor((left % 3600) / 60)
  const s = left % 60
  const pad = (n: number) => String(n).padStart(2, '0')
  return (
    <div className="flex items-center gap-2">
      {([['Hours', h], ['Minutes', m], ['Seconds', s]] as [string, number][]).map(([label, val], i) => (
        <div key={label} className="flex items-center">
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-semibold uppercase tracking-wide text-foreground/60">{label}</span>
            <span className="text-3xl font-bold tabular-nums text-foreground">{pad(val)}</span>
          </div>
          {i < 2 && <span className="mx-2 self-end pb-1 text-2xl font-bold text-[#DB4444]">:</span>}
        </div>
      ))}
    </div>
  )
}

const SECTION_MARK = 'flex h-5 w-1 rounded-sm bg-[#DB4444]'

function ProductSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-[280px] rounded-[4px] bg-muted" />
      <div className="mt-3 h-4 w-3/4 rounded bg-muted" />
      <div className="mt-2 h-3 w-1/2 rounded bg-muted" />
      <div className="mt-2 h-3 w-1/3 rounded bg-muted" />
    </div>
  )
}

const HERO_SLIDES = [
  {
    bg: 'from-gray-900 to-gray-800',
    img: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=1400&q=85',
    tag: 'New Arrival',
    title: 'iPhone 15 Pro Max',
    sub: 'Up to 20% off on selected models. Limited time deal.',
  },
  {
    bg: 'from-blue-900 to-indigo-900',
    img: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=1400&q=85',
    tag: 'Best Seller',
    title: 'MacBook Pro M3',
    sub: 'Power meets portability. Experience the future.',
  },
  {
    bg: 'from-purple-900 to-pink-900',
    img: 'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=1400&q=85',
    tag: 'Flash Deal',
    title: 'Nike Air Max 2024',
    sub: 'Run faster. Jump higher. Live bolder.',
  },
]

export default function HomePage() {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { list: products, listStatus } = useAppSelector((s) => s.products)
  const { items: categories } = useAppSelector((s) => s.categories)

  const flashPrevRef = useRef<HTMLButtonElement>(null)
  const flashNextRef = useRef<HTMLButtonElement>(null)
  const bestPrevRef = useRef<HTMLButtonElement>(null)
  const bestNextRef = useRef<HTMLButtonElement>(null)
  const explorePrevRef = useRef<HTMLButtonElement>(null)
  const exploreNextRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    dispatch(fetchProducts({ pageNumber: 1, pageSize: 20 }))
    dispatch(fetchCategories())
  }, [dispatch])

  const safeProducts = Array.isArray(products) ? products : []
  const flashSales = safeProducts.slice(0, 8)
  const bestSelling = safeProducts.slice(0, 4)
  const exploreProducts = safeProducts

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />

      {/* ── Hero banner ── */}
      <section className="border-b border-border">
        <div className="mx-auto flex max-w-[1280px] flex-col lg:flex-row">
          {/* Sidebar categories */}
          <aside className="hidden w-[220px] shrink-0 border-r border-border py-6 lg:block">
            <ul className="space-y-0.5">
              {(categories.length > 0
                ? categories
                : [
                    { id: -1, categoryName: 'Fashion', categoryImage: '', subCategories: [{ id: -11, subCategoryName: "Men's" }, { id: -12, subCategoryName: "Women's" }] },
                    { id: -2, categoryName: 'Electronics', categoryImage: '', subCategories: [{ id: -21, subCategoryName: 'Phones' }, { id: -22, subCategoryName: 'Laptops' }] },
                    { id: -3, categoryName: 'Home & Lifestyle', categoryImage: '', subCategories: [{ id: -31, subCategoryName: 'Furniture' }] },
                    { id: -4, categoryName: 'Sports & Outdoor', categoryImage: '', subCategories: [] },
                    { id: -5, categoryName: 'Baby & Toys', categoryImage: '', subCategories: [] },
                    { id: -6, categoryName: 'Health & Beauty', categoryImage: '', subCategories: [] },
                  ]
              ).map((cat) => (
                <li key={cat.id} className="group/item relative">
                  <button
                    onClick={() => cat.id > 0 && navigate(`/products?categoryId=${cat.id}`)}
                    className="flex w-full items-center justify-between rounded-[2px] px-4 py-2 text-sm text-foreground transition-colors hover:bg-[#DB4444]/5 hover:text-[#DB4444]"
                  >
                    {cat.categoryName}
                    {cat.subCategories.length > 0 && <ChevronRight className="h-3.5 w-3.5 shrink-0" />}
                  </button>
                  {cat.subCategories.length > 0 && (
                    <div className="pointer-events-none absolute left-full top-0 z-30 ml-0.5 min-w-[180px] rounded-[4px] border border-border bg-background py-2 opacity-0 shadow-lg transition-all duration-150 group-hover/item:pointer-events-auto group-hover/item:opacity-100">
                      {cat.subCategories.map((sub) => (
                        <button
                          key={sub.id}
                          onClick={() => cat.id > 0 ? navigate(`/products?categoryId=${cat.id}&subcategoryId=${sub.id}`) : navigate('/products')}
                          className="block w-full px-4 py-2 text-left text-sm text-foreground transition-colors hover:text-[#DB4444]"
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

          {/* Hero Swiper */}
          <div className="relative flex-1 overflow-hidden">
            <Swiper
              modules={[Autoplay, Pagination]}
              autoplay={{ delay: 4000, disableOnInteraction: false }}
              pagination={{ clickable: true }}
              loop
              className="h-[360px] lg:h-[400px]"
            >
              {HERO_SLIDES.map((slide) => (
                <SwiperSlide key={slide.title}>
                  <div className={`relative h-full w-full bg-gradient-to-r ${slide.bg} overflow-hidden`}>
                    <img
                      src={slide.img}
                      alt={slide.title}
                      className="absolute inset-0 h-full w-full object-cover object-center opacity-40 mix-blend-overlay"
                    />
                    <div className="absolute inset-0 flex flex-col justify-center px-10 lg:px-16">
                      <span className="inline-block rounded bg-[#DB4444] px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white w-fit">
                        {slide.tag}
                      </span>
                      <h1 className="mt-4 max-w-sm text-4xl font-bold leading-tight text-white lg:text-5xl">
                        {slide.title}
                      </h1>
                      <p className="mt-3 max-w-xs text-sm text-white/80">{slide.sub}</p>
                      <Link
                        to="/products"
                        className="mt-7 inline-flex w-fit items-center gap-2 border-b-2 border-white pb-0.5 text-sm font-semibold text-white transition-colors hover:border-[#DB4444] hover:text-[#DB4444]"
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
        <section className="mt-14">
          <div className="flex items-center gap-4">
            <span className={SECTION_MARK} />
            <span className="text-sm font-semibold text-[#DB4444]">{t('products.flash_sales')}</span>
          </div>
          <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-10">
              <h2 className="text-4xl font-bold text-foreground">{t('products.flash_sales_title')}</h2>
              <CountdownTimer seconds={3 * 3600 + 23 * 60 + 19} />
            </div>
            <div className="flex gap-2">
              <button ref={flashPrevRef} className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-foreground transition-colors hover:bg-[#DB4444] hover:text-white">
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button ref={flashNextRef} className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-foreground transition-colors hover:bg-[#DB4444] hover:text-white">
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>

          {listStatus === 'loading' && (
            <div className="mt-8 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => <ProductSkeleton key={i} />)}
            </div>
          )}
          {listStatus === 'error' && (
            <NetworkError onRetry={() => dispatch(fetchProducts({ pageNumber: 1, pageSize: 20 }))} />
          )}
          {listStatus === 'success' && flashSales.length > 0 && (
            <FlashSwiperSection
              products={flashSales}
              showBadge="sale"
              prevRef={flashPrevRef}
              nextRef={flashNextRef}
            />
          )}

          <div className="mt-10 flex justify-center">
            <Link to="/products" className="rounded-[4px] bg-[#DB4444] px-12 py-3.5 text-sm font-medium text-white transition-opacity hover:opacity-90">
              {t('home.view_all')}
            </Link>
          </div>
        </section>

        <div className="my-14 h-px bg-border" />

        {/* ── Categories ── */}
        <section>
          <div className="flex items-center gap-4">
            <span className={SECTION_MARK} />
            <span className="text-sm font-semibold text-[#DB4444]">{t('products.explore_products')}</span>
          </div>
          <h2 className="mt-4 text-4xl font-bold text-foreground">{t('home.categories_title')}</h2>
          <div className="mt-8 grid grid-cols-3 gap-4 sm:grid-cols-4 lg:grid-cols-6">
            {(categories.length > 0 ? categories : [
              { id: -1, categoryName: 'Electronics', categoryImage: '', subCategories: [] },
              { id: -2, categoryName: 'Fashion', categoryImage: '', subCategories: [] },
              { id: -3, categoryName: 'Home', categoryImage: '', subCategories: [] },
              { id: -4, categoryName: 'Sports', categoryImage: '', subCategories: [] },
              { id: -5, categoryName: 'Books', categoryImage: '', subCategories: [] },
              { id: -6, categoryName: 'Toys', categoryImage: '', subCategories: [] },
            ]).slice(0, 6).map((cat) => (
              <Link
                key={cat.id}
                to={cat.id > 0 ? `/products?categoryId=${cat.id}` : '/products'}
                className="group flex flex-col items-center gap-3 rounded-[4px] border border-border px-4 py-6 text-center transition-all hover:border-[#DB4444] hover:bg-[#DB4444]"
              >
                {cat.categoryImage ? (
                  <img
                    src={getImageUrl(cat.categoryImage)}
                    alt={cat.categoryName}
                    className="h-14 w-14 object-contain transition-all group-hover:brightness-[200]"
                  />
                ) : (
                  <div className="h-14 w-14 rounded-full bg-muted transition-colors group-hover:bg-white/20" />
                )}
                <span className="text-sm font-medium text-foreground transition-colors group-hover:text-white">
                  {cat.categoryName}
                </span>
              </Link>
            ))}
          </div>
        </section>

        <div className="my-14 h-px bg-border" />

        {/* ── Best Selling ── */}
        <section>
          <div className="flex items-center gap-4">
            <span className={SECTION_MARK} />
            <span className="text-sm font-semibold text-[#DB4444]">{t('products.best_selling')}</span>
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-4xl font-bold text-foreground">{t('products.best_selling_title')}</h2>
            <div className="flex items-center gap-3">
              <div className="flex gap-2">
                <button ref={bestPrevRef} className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-foreground transition-colors hover:bg-[#DB4444] hover:text-white">
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button ref={bestNextRef} className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-foreground transition-colors hover:bg-[#DB4444] hover:text-white">
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
              <Link to="/products" className="rounded-[4px] bg-[#DB4444] px-8 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90">
                {t('home.view_all')}
              </Link>
            </div>
          </div>
          {listStatus === 'success' && bestSelling.length > 0 && (
            <FlashSwiperSection
              products={bestSelling}
              showBadge="new"
              prevRef={bestPrevRef}
              nextRef={bestNextRef}
            />
          )}
          {listStatus === 'loading' && (
            <div className="mt-8 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => <ProductSkeleton key={i} />)}
            </div>
          )}
        </section>

        {/* ── Promo banner ── */}
        <div className="my-14 overflow-hidden rounded-2xl bg-black">
          <div className="flex flex-col items-center justify-between gap-6 p-8 sm:flex-row sm:p-12">
            <div className="text-center sm:text-left">
              <p className="text-sm font-semibold text-[#00FF66]">Categories</p>
              <h3 className="mt-2 text-3xl font-bold leading-tight text-white lg:text-4xl">
                Enhance Your Music Experience
              </h3>
              <div className="mt-6 flex flex-wrap justify-center gap-4 sm:justify-start">
                {[['23', 'Hours'], ['05', 'Days'], ['59', 'Minutes'], ['35', 'Seconds']].map(([num, lbl]) => (
                  <div key={lbl} className="flex min-w-[64px] flex-col items-center rounded-full bg-white px-3 py-2">
                    <span className="text-xl font-bold text-foreground">{num}</span>
                    <span className="text-xs text-muted-foreground">{lbl}</span>
                  </div>
                ))}
              </div>
              <Link
                to="/products"
                className="mt-6 inline-block rounded-[4px] bg-[#00FF66] px-8 py-3 text-sm font-medium text-black transition-opacity hover:opacity-90"
              >
                {t('home.hero_cta')}
              </Link>
            </div>
            <img
              src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80"
              alt="Promo"
              className="h-48 w-48 rounded-full object-cover sm:h-56 sm:w-56"
            />
          </div>
        </div>

        {/* ── Explore Products ── */}
        <section>
          <div className="flex items-center gap-4">
            <span className={SECTION_MARK} />
            <span className="text-sm font-semibold text-[#DB4444]">{t('products.explore_products')}</span>
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-4xl font-bold text-foreground">{t('products.explore_subtitle')}</h2>
            <div className="flex gap-2">
              <button ref={explorePrevRef} className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-foreground transition-colors hover:bg-[#DB4444] hover:text-white">
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button ref={exploreNextRef} className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-foreground transition-colors hover:bg-[#DB4444] hover:text-white">
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
          {listStatus === 'success' && exploreProducts.length > 0 && (
            <FlashSwiperSection
              products={exploreProducts}
              prevRef={explorePrevRef}
              nextRef={exploreNextRef}
            />
          )}
          {listStatus === 'loading' && (
            <div className="mt-8 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => <ProductSkeleton key={i} />)}
            </div>
          )}
          <div className="mt-10 flex justify-center">
            <Link to="/products" className="rounded-[4px] bg-[#DB4444] px-12 py-3.5 text-sm font-medium text-white transition-opacity hover:opacity-90">
              {t('home.view_all')}
            </Link>
          </div>
        </section>

        {/* ── New Arrival ── */}
        <section className="mt-14">
          <div className="flex items-center gap-4">
            <span className={SECTION_MARK} />
            <span className="text-sm font-semibold text-[#DB4444]">{t('products.new_arrival')}</span>
          </div>
          <h2 className="mt-4 text-4xl font-bold text-foreground">{t('products.new_arrival_title')}</h2>
          <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="relative overflow-hidden rounded-2xl bg-black">
              <img
                src="https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=600&q=80"
                alt="PlayStation"
                className="h-[420px] w-full object-cover opacity-70"
              />
              <div className="absolute bottom-8 left-8">
                <p className="text-xl font-bold text-white">PlayStation 5</p>
                <p className="mt-1 max-w-xs text-sm text-white/70">Black and White version of the PS5 coming out on sale.</p>
                <Link to="/products" className="mt-3 inline-flex items-center gap-1.5 border-b border-white pb-0.5 text-sm font-semibold text-white transition-colors hover:border-[#DB4444] hover:text-[#DB4444]">
                  {t('home.hero_cta')} <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
            <div className="grid grid-rows-3 gap-4">
              {[
                { title: "Women's Collections", sub: "Featured woman collections that give you another vibe.", img: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&q=80" },
                { title: "Speakers", sub: "Amazon wireless speakers", img: "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=400&q=80" },
                { title: "Perfume", sub: "GUCCI INTENSE OUD EDP", img: "https://images.unsplash.com/photo-1541643600914-78b084683702?w=400&q=80" },
              ].map((item) => (
                <div key={item.title} className="relative overflow-hidden rounded-2xl bg-black">
                  <img src={item.img} alt={item.title} className="h-full max-h-[130px] w-full object-cover opacity-70" />
                  <div className="absolute bottom-4 left-4">
                    <p className="text-sm font-bold text-white">{item.title}</p>
                    <p className="line-clamp-1 max-w-[180px] text-xs text-white/70">{item.sub}</p>
                    <Link to="/products" className="mt-1 inline-flex items-center gap-1 border-b border-white pb-0.5 text-xs font-medium text-white transition-colors hover:border-[#DB4444] hover:text-[#DB4444]">
                      {t('home.hero_cta')} <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Services ── */}
        <section className="my-16 grid grid-cols-1 gap-8 sm:grid-cols-3">
          {[
            { icon: <Truck className="h-10 w-10" />, title: t('home.services_delivery'), desc: t('home.services_delivery_desc') },
            { icon: <Headphones className="h-10 w-10" />, title: t('home.services_support'), desc: t('home.services_support_desc') },
            { icon: <ShieldCheck className="h-10 w-10" />, title: t('home.services_guarantee'), desc: t('home.services_guarantee_desc') },
          ].map((s) => (
            <div key={s.title} className="flex flex-col items-center gap-3 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#2D2D2D] text-white ring-8 ring-[#C1C1C1]/20">
                {s.icon}
              </div>
              <p className="text-sm font-bold uppercase tracking-wide text-foreground">{s.title}</p>
              <p className="text-sm text-muted-foreground">{s.desc}</p>
            </div>
          ))}
        </section>
      </main>

      <Footer />
    </div>
  )
}

interface FlashSwiperProps {
  products: import('@/shared/api/types').Product[]
  showBadge?: 'new' | 'sale'
  prevRef: React.RefObject<HTMLButtonElement | null>
  nextRef: React.RefObject<HTMLButtonElement | null>
}

function FlashSwiperSection({ products, showBadge, prevRef, nextRef }: FlashSwiperProps) {
  const swiperRef = useRef<SwiperType | null>(null)

  useEffect(() => {
    const prev = prevRef.current
    const next = nextRef.current
    if (!prev || !next) return
    const handlePrev = () => swiperRef.current?.slidePrev()
    const handleNext = () => swiperRef.current?.slideNext()
    prev.addEventListener('click', handlePrev)
    next.addEventListener('click', handleNext)
    return () => {
      prev.removeEventListener('click', handlePrev)
      next.removeEventListener('click', handleNext)
    }
  }, [prevRef, nextRef])

  return (
    <div className="mt-8">
      <Swiper
        onSwiper={(swiper) => { swiperRef.current = swiper }}
        modules={[Navigation]}
        spaceBetween={20}
        slidesPerView={2}
        breakpoints={{
          640: { slidesPerView: 3 },
          1024: { slidesPerView: 4 },
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
