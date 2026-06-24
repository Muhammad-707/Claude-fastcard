import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
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
    <div className="flex items-center gap-1.5">
      {([['Hours', h], ['Minutes', m], ['Seconds', s]] as [string, number][]).map(([label, val], i) => (
        <div key={label} className="flex items-center">
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-medium text-foreground">{label}</span>
            <span className="text-2xl font-bold tabular-nums text-foreground">{pad(val)}</span>
          </div>
          {i < 2 && <span className="mx-1 self-end pb-0.5 text-xl font-bold text-[#DB4444]">:</span>}
        </div>
      ))}
    </div>
  )
}

const SECTION_MARK = 'flex h-5 w-1 rounded-sm bg-[#DB4444]'

function ProductSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-[260px] rounded-[4px] bg-muted" />
      <div className="mt-3 h-4 w-3/4 rounded bg-muted" />
      <div className="mt-2 h-3 w-1/2 rounded bg-muted" />
    </div>
  )
}

export default function HomePage() {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
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
      <section className="border-b border-border">
        <div className="mx-auto flex max-w-[1280px] flex-col lg:flex-row">
          {/* Sidebar categories */}
          <aside className="hidden w-56 shrink-0 border-r border-border py-6 lg:block">
            <ul className="space-y-2.5">
              {categories.length > 0
                ? categories.map((cat) => (
                    <li key={cat.id}>
                      <button
                        onClick={() => navigate(`/products?categoryId=${cat.id}`)}
                        className="flex w-full items-center justify-between px-4 py-1 text-sm text-foreground hover:text-[#DB4444] transition-colors"
                      >
                        {cat.categoryName}
                        <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    </li>
                  ))
                : ['Fashion', 'Electronics', 'Home & Life', 'Sports', 'Baby & Toys', 'Groceries', 'Health & Beauty'].map((name) => (
                    <li key={name}>
                      <button
                        onClick={() => navigate('/products')}
                        className="flex w-full items-center justify-between px-4 py-1 text-sm text-foreground hover:text-[#DB4444] transition-colors"
                      >
                        {name}
                        <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    </li>
                  ))
              }
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
              <p className="text-sm font-medium text-white/80">{t('auth.brand_tagline')}</p>
              <h1 className="mt-4 max-w-xs text-4xl font-semibold leading-tight text-white lg:text-5xl">
                {t('home.hero_title')}
              </h1>
              <p className="mt-3 text-sm text-white/70">{t('home.hero_subtitle')}</p>
              <Link
                to="/products"
                className="mt-6 inline-flex w-fit items-center gap-2 border-b border-white pb-0.5 text-sm font-semibold text-white hover:text-[#DB4444] hover:border-[#DB4444] transition-colors"
              >
                {t('home.hero_cta')} <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
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
          <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-10">
              <h2 className="text-2xl font-semibold text-foreground">{t('products.flash_sales_title')}</h2>
              <CountdownTimer seconds={3 * 3600 + 23 * 60 + 19} />
            </div>
            <div className="flex gap-2">
              <button className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-foreground hover:bg-[#DB4444] hover:text-white transition-colors">
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-foreground hover:bg-[#DB4444] hover:text-white transition-colors">
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>

          {listStatus === 'loading' && (
            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => <ProductSkeleton key={i} />)}
            </div>
          )}
          {listStatus === 'error' && (
            <NetworkError onRetry={() => dispatch(fetchProducts({ pageNumber: 1, pageSize: 20 }))} />
          )}
          {listStatus === 'success' && (
            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {flashSales.map((p) => <ProductCard key={p.id} product={p} showBadge="sale" />)}
            </div>
          )}

          <div className="mt-10 flex justify-center">
            <Link to="/products" className="rounded-[4px] bg-[#DB4444] px-12 py-3.5 text-sm font-medium text-white hover:opacity-90 transition-opacity">
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
          <h2 className="mt-4 text-2xl font-semibold text-foreground">{t('home.categories_title')}</h2>
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
                  <div className="h-14 w-14 rounded-full bg-muted group-hover:bg-white/20 transition-colors" />
                )}
                <span className="text-sm font-medium text-foreground group-hover:text-white transition-colors">
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
            <h2 className="text-2xl font-semibold text-foreground">{t('products.best_selling_title')}</h2>
            <Link to="/products" className="rounded-[4px] bg-[#DB4444] px-8 py-3 text-sm font-medium text-white hover:opacity-90 transition-opacity">
              {t('home.view_all')}
            </Link>
          </div>
          {listStatus === 'success' && (
            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {bestSelling.map((p) => <ProductCard key={p.id} product={p} showBadge="new" />)}
            </div>
          )}
          {listStatus === 'loading' && (
            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => <ProductSkeleton key={i} />)}
            </div>
          )}
        </section>

        {/* ── Promo banner ── */}
        <div className="my-14 overflow-hidden rounded-[4px] bg-black">
          <div className="flex flex-col items-center justify-between gap-6 p-8 sm:flex-row sm:p-12">
            <div className="text-center sm:text-left">
              <p className="text-sm font-medium text-[#00FF66]">Categories</p>
              <h3 className="mt-2 text-3xl font-semibold leading-tight text-white">
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
            <span className={SECTION_MARK} />
            <span className="text-sm font-semibold text-[#DB4444]">{t('products.explore_products')}</span>
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-2xl font-semibold text-foreground">{t('products.explore_subtitle')}</h2>
            <div className="flex gap-2">
              <button className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-foreground hover:bg-[#DB4444] hover:text-white transition-colors">
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-foreground hover:bg-[#DB4444] hover:text-white transition-colors">
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
          {listStatus === 'success' && (
            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {exploreProducts.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
          {listStatus === 'loading' && (
            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => <ProductSkeleton key={i} />)}
            </div>
          )}
          <div className="mt-10 flex justify-center">
            <Link to="/products" className="rounded-[4px] bg-[#DB4444] px-12 py-3.5 text-sm font-medium text-white hover:opacity-90 transition-opacity">
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
          <h2 className="mt-4 text-2xl font-semibold text-foreground">{t('products.new_arrival_title')}</h2>
          <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="relative overflow-hidden rounded-[4px] bg-black">
              <img
                src="https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=600&q=80"
                alt="PlayStation"
                className="h-[420px] w-full object-cover opacity-80"
              />
              <div className="absolute bottom-8 left-8">
                <p className="text-base font-semibold text-white">PlayStation 5</p>
                <p className="mt-1 max-w-xs text-xs text-white/70">Black and White version of the PS5 coming out on sale.</p>
                <Link to="/products" className="mt-3 inline-flex items-center gap-1 border-b border-white pb-0.5 text-sm font-medium text-white hover:text-[#DB4444] hover:border-[#DB4444] transition-colors">
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
                <div key={item.title} className="relative overflow-hidden rounded-[4px] bg-black">
                  <img src={item.img} alt={item.title} className="h-full w-full max-h-[130px] object-cover opacity-80" />
                  <div className="absolute bottom-4 left-4">
                    <p className="text-sm font-semibold text-white">{item.title}</p>
                    <p className="line-clamp-1 max-w-[180px] text-xs text-white/70">{item.sub}</p>
                    <Link to="/products" className="mt-1 inline-flex items-center gap-1 border-b border-white pb-0.5 text-xs font-medium text-white hover:text-[#DB4444] hover:border-[#DB4444] transition-colors">
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
