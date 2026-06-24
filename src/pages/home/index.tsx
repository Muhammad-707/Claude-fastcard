import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ChevronRight, ChevronLeft, Truck, Headphones, ShieldCheck } from 'lucide-react'
import { useTranslation } from 'react-i18next'
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
    <div className="flex items-center gap-1">
      {[['Hours', h], ['Minutes', m], ['Seconds', s]].map(([label, val], i) => (
        <div key={label as string} className="flex items-center">
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-medium text-foreground">{label}</span>
            <span className="text-2xl font-bold text-foreground">{pad(val as number)}</span>
          </div>
          {i < 2 && <span className="mx-1 text-xl font-bold text-primary self-end pb-0.5">:</span>}
        </div>
      ))}
    </div>
  )
}

const SECTION_HEADER_STYLE = 'flex h-5 w-1 rounded-sm bg-primary'

export default function HomePage() {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const { list: products, listStatus } = useAppSelector((s) => s.products)
  const { items: categories } = useAppSelector((s) => s.categories)

  useEffect(() => {
    dispatch(fetchProducts({ pageNumber: 1, pageSize: 20 }))
    dispatch(fetchCategories())
  }, [dispatch])

  const safeProducts = Array.isArray(products) ? products : []
  const flashSales = safeProducts.slice(0, 8)
  const bestSelling = safeProducts.slice(0, 4)
  const exploreProducts = safeProducts.slice(0, 8)

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />

      {/* ── Hero banner ── */}
      <section className="border-b border-[#EBEBEB]">
        <div className="mx-auto flex max-w-[1170px] flex-col lg:flex-row">
          {/* Sidebar categories */}
          <aside className="hidden w-56 shrink-0 border-r border-[#EBEBEB] py-6 lg:block">
            <ul className="space-y-3">
              {['Woman\'s Fashion', 'Men\'s Fashion', 'Electronics', 'Home & Lifestyle',
                'Medicine', 'Sports & Outdoor', 'Baby\'s & Toys', 'Groceries & Pets', 'Health & Beauty'].map((cat) => (
                <li key={cat}>
                  <Link
                    to="/products"
                    className="flex items-center justify-between px-4 py-1 text-sm text-foreground hover:text-primary transition-colors"
                  >
                    {cat}
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                </li>
              ))}
            </ul>
          </aside>

          {/* Hero */}
          <div className="relative flex-1 overflow-hidden bg-black">
            <img
              src="https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=1200&q=80"
              alt="Hero"
              className="h-[340px] w-full object-cover opacity-70 lg:h-[380px]"
            />
            <div className="absolute inset-0 flex flex-col justify-center px-8 lg:px-12">
              <p className="text-sm font-medium text-[#FAFAFA]">{t('home.hero_title')}</p>
              <h1 className="mt-4 max-w-xs text-4xl font-semibold text-white lg:text-5xl">
                {t('home.hero_title')}
              </h1>
              <p className="mt-4 text-sm text-[#FAFAFA]">{t('home.hero_subtitle')}</p>
              <Link
                to="/products"
                className="mt-6 inline-flex w-fit items-center gap-2 border-b border-white pb-0.5 text-sm font-semibold text-white hover:text-primary hover:border-primary transition-colors"
              >
                {t('home.hero_cta')} <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto w-full max-w-[1170px] px-4 xl:px-0">

        {/* ── Flash Sales ── */}
        <section className="mt-14">
          <div className="flex items-center gap-4">
            <span className={SECTION_HEADER_STYLE} />
            <span className="text-sm font-semibold text-primary">{t('products.flash_sales')}</span>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-10">
              <h2 className="text-2xl font-semibold text-foreground">{t('products.flash_sales_title')}</h2>
              <CountdownTimer seconds={3 * 3600 + 23 * 60 + 19} />
            </div>
            <div className="flex gap-2">
              <button className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F5F5F5] text-foreground hover:bg-primary hover:text-white transition-colors">
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F5F5F5] text-foreground hover:bg-primary hover:text-white transition-colors">
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>

          {listStatus === 'loading' && (
            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-[260px] rounded-[4px] bg-[#F5F5F5]" />
                  <div className="mt-3 h-4 w-3/4 rounded bg-[#F5F5F5]" />
                  <div className="mt-2 h-3 w-1/2 rounded bg-[#F5F5F5]" />
                </div>
              ))}
            </div>
          )}
          {listStatus === 'error' && (
            <NetworkError onRetry={() => dispatch(fetchProducts({ pageNumber: 1, pageSize: 20 }))} />
          )}
          {listStatus === 'success' && (
            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {flashSales.map((p) => (
                <ProductCard key={p.id} product={p} showBadge="sale" />
              ))}
            </div>
          )}

          <div className="mt-10 flex justify-center">
            <Link
              to="/products"
              className="rounded-[4px] bg-primary px-12 py-3.5 text-sm font-medium text-white hover:opacity-90 transition-opacity"
            >
              {t('home.view_all')}
            </Link>
          </div>
        </section>

        {/* Divider */}
        <div className="my-14 h-px bg-[#EBEBEB]" />

        {/* ── Categories ── */}
        <section>
          <div className="flex items-center gap-4">
            <span className={SECTION_HEADER_STYLE} />
            <span className="text-sm font-semibold text-primary">{t('products.flash_sales')}</span>
          </div>
          <h2 className="mt-4 text-2xl font-semibold text-foreground">{t('home.categories_title')}</h2>
          <div className="mt-8 grid grid-cols-3 gap-4 sm:grid-cols-4 lg:grid-cols-6">
            {categories.slice(0, 6).map((cat) => (
              <Link
                key={cat.id}
                to={`/products?categoryId=${cat.id}`}
                className="group flex flex-col items-center gap-3 rounded-[4px] border border-[#EBEBEB] px-4 py-6 text-center transition-all hover:border-primary hover:bg-primary"
              >
                <img
                  src={getImageUrl(cat.categoryImage)}
                  alt={cat.categoryName}
                  className="h-14 w-14 object-contain group-hover:brightness-200 transition-all"
                />
                <span className="text-sm font-medium text-foreground group-hover:text-white">
                  {cat.categoryName}
                </span>
              </Link>
            ))}
            {categories.length === 0 && (
              ['Electronics', 'Fashion', 'Home', 'Sports', 'Books', 'Toys'].map((name) => (
                <Link
                  key={name}
                  to="/products"
                  className="group flex flex-col items-center gap-3 rounded-[4px] border border-[#EBEBEB] px-4 py-6 text-center transition-all hover:border-primary hover:bg-primary"
                >
                  <div className="h-14 w-14 rounded-full bg-[#F5F5F5] group-hover:bg-white/20" />
                  <span className="text-sm font-medium text-foreground group-hover:text-white">{name}</span>
                </Link>
              ))
            )}
          </div>
        </section>

        {/* Divider */}
        <div className="my-14 h-px bg-[#EBEBEB]" />

        {/* ── Best Selling ── */}
        <section>
          <div className="flex items-center gap-4">
            <span className={SECTION_HEADER_STYLE} />
            <span className="text-sm font-semibold text-primary">{t('products.best_selling')}</span>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-foreground">{t('products.best_selling_title')}</h2>
            <Link
              to="/products"
              className="rounded-[4px] bg-primary px-8 py-3 text-sm font-medium text-white hover:opacity-90 transition-opacity"
            >
              {t('home.view_all')}
            </Link>
          </div>
          {listStatus === 'success' && (
            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {bestSelling.map((p) => <ProductCard key={p.id} product={p} showBadge="new" />)}
            </div>
          )}
        </section>

        {/* ── Promo banner ── */}
        <div className="my-14 overflow-hidden rounded-[4px] bg-black">
          <div className="flex flex-col items-center justify-between gap-6 p-12 sm:flex-row">
            <div className="text-center sm:text-left">
              <p className="text-sm font-medium text-[#00FF66]">Categories</p>
              <h3 className="mt-2 text-3xl font-semibold text-white">Enhance Your Music Experience</h3>
              <div className="mt-6 flex flex-wrap justify-center gap-4 sm:justify-start">
                {[['23', 'Hours'], ['05', 'Days'], ['59', 'Minutes'], ['35', 'Seconds']].map(([num, lbl]) => (
                  <div key={lbl} className="flex flex-col items-center rounded-full bg-white px-3 py-2 min-w-[64px]">
                    <span className="text-xl font-bold text-foreground">{num}</span>
                    <span className="text-xs text-[#8D8D8D]">{lbl}</span>
                  </div>
                ))}
              </div>
              <Link
                to="/products"
                className="mt-6 inline-block rounded-[4px] bg-[#00FF66] px-8 py-3 text-sm font-medium text-black hover:opacity-90 transition-opacity"
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
            <span className={SECTION_HEADER_STYLE} />
            <span className="text-sm font-semibold text-primary">{t('products.explore_products')}</span>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-foreground">{t('products.explore_subtitle')}</h2>
            <div className="flex gap-2">
              <button className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F5F5F5] text-foreground hover:bg-primary hover:text-white transition-colors">
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F5F5F5] text-foreground hover:bg-primary hover:text-white transition-colors">
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
          {listStatus === 'success' && (
            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {exploreProducts.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
          <div className="mt-10 flex justify-center">
            <Link
              to="/products"
              className="rounded-[4px] bg-primary px-12 py-3.5 text-sm font-medium text-white hover:opacity-90 transition-opacity"
            >
              {t('home.view_all')}
            </Link>
          </div>
        </section>

        {/* ── New Arrival ── */}
        <section className="mt-14">
          <div className="flex items-center gap-4">
            <span className={SECTION_HEADER_STYLE} />
            <span className="text-sm font-semibold text-primary">{t('products.new_arrival')}</span>
          </div>
          <h2 className="mt-4 text-2xl font-semibold text-foreground">{t('products.new_arrival_title')}</h2>
          <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-2">
            {/* Large hero card */}
            <div className="relative overflow-hidden rounded-[4px] bg-black">
              <img
                src="https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=600&q=80"
                alt="PlayStation"
                className="h-[420px] w-full object-cover opacity-80"
              />
              <div className="absolute bottom-8 left-8">
                <p className="text-sm font-medium text-white">PlayStation 5</p>
                <p className="mt-1 text-xs text-[#FAFAFA] max-w-xs">Black and White version of the PS5 coming out on sale.</p>
                <Link to="/products" className="mt-3 inline-flex items-center gap-1 border-b border-white pb-0.5 text-sm font-medium text-white hover:text-primary hover:border-primary transition-colors">
                  {t('home.hero_cta')} <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            {/* Right column — 3 smaller cards */}
            <div className="grid grid-rows-3 gap-4">
              {[
                { title: "Women's Collections", sub: "Featured woman collections that give you another vibe.", img: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&q=80" },
                { title: "Speakers", sub: "Amazon wireless speakers", img: "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=400&q=80" },
                { title: "Perfume", sub: "GUCCI INTENSE OUD EDP", img: "https://images.unsplash.com/photo-1541643600914-78b084683702?w=400&q=80" },
              ].map((item) => (
                <div key={item.title} className="relative overflow-hidden rounded-[4px] bg-black">
                  <img src={item.img} alt={item.title} className="h-full w-full object-cover opacity-80" style={{ maxHeight: '130px' }} />
                  <div className="absolute bottom-4 left-4">
                    <p className="text-sm font-semibold text-white">{item.title}</p>
                    <p className="text-xs text-[#FAFAFA] max-w-[180px] line-clamp-1">{item.sub}</p>
                    <Link to="/products" className="mt-1 inline-flex items-center gap-1 border-b border-white pb-0.5 text-xs font-medium text-white hover:text-primary hover:border-primary transition-colors">
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
              <p className="text-sm font-bold text-foreground">{s.title}</p>
              <p className="text-sm text-[#8D8D8D]">{s.desc}</p>
            </div>
          ))}
        </section>
      </main>

      <Footer />
    </div>
  )
}
