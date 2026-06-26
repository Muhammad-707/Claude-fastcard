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
import { SearchBox } from '@/widgets/header/SearchBox'
import { Footer } from '@/widgets/footer'
import { getImageUrl } from '@/shared/lib/image'

import i1 from "@/assets/OIP (1).webp"
import i5 from "@/assets/aIxOQ91Bds2cET5yhbpcRw__70.jpg"
import i7 from "@/assets/Samsung-Galaxy-S26-Ultra-CAD-based-render-AH-exclusive-2-1420x799-pic_32ratio_900x600-900x600-41769.jpg"
import i9 from "@/assets/yddobdqug5n91.webp"
import i11 from "@/assets/Rolex-Day-Date-18238-_onyx_-_Pinball_.jpg.webp"
import i12 from "@/assets/men-football-shoes-agility-100-for-turf-black.avif"

/* ─── Custom CSS for 3D Floating Animation ─── */
const floatStyle = `
  @keyframes float3D {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    50% { transform: translateY(-12px) rotate(1deg); }
  }
  .animate-float-3d {
    animation: float3D 5s ease-in-out infinite;
  }
`;

/* ─── 3D Tilt Card Component ─── */
function TiltProductImage({ src, alt }: { src: string; alt: string }) {
  const [coords, setCoords] = useState({ x: 0, y: 0 })
  const [isHovered, setIsHovered] = useState(false)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = e.currentTarget
    const rect = el.getBoundingClientRect()
    
    const x = e.clientX - rect.left - rect.width / 2
    const y = e.clientY - rect.top - rect.height / 2
    
    const rotateX = -(y / (rect.height / 2)) * 15
    const rotateY = (x / (rect.width / 2)) * 15
    
    setCoords({ x: rotateY, y: rotateX })
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
    setCoords({ x: 0, y: 0 })
  }

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={{
        perspective: '1000px',
        transformStyle: 'preserve-3d',
      }}
      className="relative w-full h-full flex items-center justify-center p-4 animate-float-3d"
    >
      <div
        style={{
          transform: isHovered
            ? `rotateY(${coords.x}deg) rotateX(${coords.y}deg) scale(1.05)`
            : 'rotateY(0deg) rotateX(0deg) scale(1)',
          transition: isHovered ? 'transform 0.1s ease-out' : 'transform 0.6s ease-out',
          transformStyle: 'preserve-3d',
        }}
        className="relative w-[85%] h-[85%] max-w-[280px] max-h-[220px] md:max-h-[280px] rounded-[1.5rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] bg-black/40 border border-white/20 flex items-center justify-center group/tilt transition-shadow duration-300 hover:shadow-[0_30px_60px_rgba(0,0,0,0.7)] backdrop-blur-sm"
      >
        <div 
          className="absolute -inset-10 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.12),transparent_60%)] opacity-0 group-hover/tilt:opacity-100 transition-opacity duration-300 pointer-events-none"
          style={{ transform: 'translateZ(10px)' }}
        />
        
        <img
          src={src}
          alt={alt}
          style={{ 
            transform: 'translateZ(40px)',
            backfaceVisibility: 'hidden'
          }}
          className="w-[90%] h-[90%] object-cover rounded-xl shadow-2xl transition-transform duration-300 ease-out pointer-events-none"
        />
      </div>
    </div>
  )
}

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
            <span className="font-semibold text-[10px] text-foreground/60 uppercase tracking-wider">{label}</span>
            <span className="font-bold tabular-nums text-foreground text-3xl">{pad(val)}</span>
          </div>
          {i < 2 && <span className="self-end mx-2 pb-0.5 font-bold text-[#DB4444] text-2xl">:</span>}
        </div>
      ))}
    </div>
  )
}

/* ─── Section Label ─── */
function SectionLabel({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex bg-[#DB4444] rounded-[4px] w-[14px] h-8 shrink-0" />
      <span className="font-semibold text-[#DB4444] text-base">{label}</span>
    </div>
  )
}

/* ─── Skeleton ─── */
function ProductSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="bg-muted rounded-[4px] h-[290px]" />
      <div className="bg-muted mt-3 rounded w-3/4 h-4" />
      <div className="bg-muted mt-2 rounded w-1/2 h-3" />
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
        className="group-hover:brightness-[200] w-full h-full object-contain transition-all duration-300 dark:invert"
      />
    )
  }
  const Icon = getCategoryIcon(name)
  if (Icon) {
    return <Icon className="w-9 h-9 text-gray-800 dark:text-white group-hover:text-white transition-colors duration-300" />
  }
  return (
    <span className="group-hover:brightness-[200] text-3xl transition-all duration-300 dark:brightness-[200]">📦</span>
  )
}

/* ─── Modern Slide configs with localized translations ─── */
const SLIDE_CONFIGS = [
  { 
    n: 1, 
    bg: 'from-zinc-950 via-zinc-900 to-slate-900',       
    img: i1,  
    cta: '/products',
    translations: {
      en: {
        tag: "NEW ARRIVAL",
        title: "iPhone 18 Pro Max",
        sub: "The future is here. Titanium White Edition with next-gen AI."
      },
      ru: {
        tag: "НОВИНКА",
        title: "iPhone 18 Pro Max",
        sub: "Будущее уже здесь. Версия «Белый титан» с ИИ нового поколения."
      },
      tj: {
        tag: "ВОРИДОТИ НАВ",
        title: "iPhone 18 Pro Max",
        sub: "Оянда аллакай дар ин ҷост. Нашри «White Titanium» бо зеҳни сунъии насли нав."
      }
    }
  },
  { 
    n: 6, 
    bg: 'from-[#0d0d0d] via-[#1a1a1a] to-[#262626]', 
    img: i11,  
    cta: '/products',
    translations: {
      en: {
        tag: "LIMITED OFFER",
        title: "Rolex Submariner",
        sub: "The definition of timeless luxury and absolute precision."
      },
      ru: {
        tag: "ЛИМИТИРОВАННАЯ СЕРИЯ",
        title: "Rolex Submariner",
        sub: "Эталон неподвластной времени роскоши и абсолютной точности."
      },
      tj: {
        tag: "ПЕШНИҲОДИ МАҲДУД",
        title: "Rolex Submariner",
        sub: "Намунаи боҳашамати безавол ва дақиқии мутлақ."
      }
    }
  },
  { 
    n: 2, 
    bg: 'from-[#0a1128] via-[#1c2541] to-[#3a506b]',     
    img: i5,  
    cta: '/products',
    translations: {
      en: {
        tag: "BEST SELLER",
        title: "MacBook Pro M5",
        sub: "Ultimate power meets absolute elegance. Silver White Edition."
      },
      ru: {
        tag: "ХИТ ПРОДАЖ",
        title: "MacBook Pro M5",
        sub: "Невероятная мощность и абсолютная элегантность в серебристо-белом цвете."
      },
      tj: {
        tag: "ПУРРӮФУРӮШ",
        title: "MacBook Pro M5",
        sub: "Қудрати бениҳоят ва зебогии мутлақ дар ранги нуқрагин-сафед."
      }
    }
  },
  { 
    n: 3, 
    bg: 'from-[#1f0322] via-[#3a083c] to-[#610f44]',   
    img: i12,  
    cta: '/products',
    translations: {
      en: {
        tag: "FLASH DEAL",
        title: "Nike Air Max 2026",
        sub: "Step into 2026. Ultra-light comfort with gravity-defying response."
      },
      ru: {
        tag: "ГОРЯЧЕЕ ПРЕДЛОЖЕНИЕ",
        title: "Nike Air Max 2026",
        sub: "Шагните в 2026 год. Сверхлегкая амортизация и невероятный комфорт."
      },
      tj: {
        tag: "ПЕШНИҲОДИ ГАРМ",
        title: "Nike Air Max 2026",
        sub: "Ба соли 2026 қадам гузоред. Амортизатсияи сабук ва бароҳатии бениҳоят."
      }
    }
  },
  { 
    n: 4, 
    bg: 'from-slate-950 via-slate-900 to-zinc-900', 
    img: i7,  
    cta: '/products',
    translations: {
      en: {
        tag: "HOT DEAL",
        title: "Galaxy S26 Ultra",
        sub: "Next-gen 200MP camera and revolutionary holographic screen."
      },
      ru: {
        tag: "СПЕЦПРЕДЛОЖЕНИЕ",
        title: "Galaxy S26 Ultra",
        sub: "Камера 200 Мп нового поколения и революционный голографический экран."
      },
      tj: {
        tag: "ПЕШНИҲОДИ МАХСУС",
        title: "Galaxy S26 Ultra",
        sub: "Камераи 200 Мп насли нав ва экрани голографии инқилобӣ."
      }
    }
  },
  { 
    n: 5, 
    bg: 'from-[#0b0c10] via-[#1f2833] to-[#2b2b2b]',  
    img: i9,  
    cta: '/products',
    translations: {
      en: {
        tag: "GAMING WEEK",
        title: "Ultimate Gaming Setup",
        sub: "Unleash maximum performance with liquid-cooled M5 components."
      },
      ru: {
        tag: "ИГРОВАЯ НЕДЕЛЯ",
        title: "Игровая станция M5",
        sub: "Раскройте максимум производительности с жидкостным охлаждением."
      },
      tj: {
        tag: "ҲАФТАИ БОЗӢ",
        title: "Истгоҳи бозии M5",
        sub: "Баландтарин маҳсулнокиро бо хунуккунии моеъ эҳсос кунед."
      }
    }
  },
  { 
    n: 7, 
    bg: 'from-[#1c0a10] via-[#3d1220] to-[#5a1c30]',       
    img: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&q=80',  
    cta: '/products',
    translations: {
      en: {
        tag: "BEAUTY",
        title: "Premium Fragrances",
        sub: "Discover exclusive scents from the world's most elite perfume houses."
      },
      ru: {
        tag: "КРАСОТА",
        title: "Элитная парфюмерия",
        sub: "Эксклюзивные ароматы от ведущих парфюмерных домов мира."
      },
      tj: {
        tag: "ЗЕБОӢ",
        title: "Атрҳои элитӣ",
        sub: "Бӯйҳои эксклюзивӣ аз хонаҳои пешбари атрҳои дунё."
      }
    }
  }
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
        spaceBetween={10}
        slidesPerView={2}
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

/* ─── Category Swiper Section ─── */
interface CategorySwiperProps {
  categories: import('@/shared/api/types').Category[]
  prevRef: React.RefObject<HTMLButtonElement | null>
  nextRef: React.RefObject<HTMLButtonElement | null>
}

function CategorySwiperSection({ categories, prevRef, nextRef }: CategorySwiperProps) {
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

  return (
    <Swiper
      onSwiper={(s) => { swiperRef.current = s }}
      spaceBetween={30}
      slidesPerView={2}
      breakpoints={{
        768:  { slidesPerView: 4, spaceBetween: 30 },
        1024: { slidesPerView: 6, spaceBetween: 30 },
      }}
      className="mt-10"
    >
      {categories.map((cat) => (
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
  )
}

/* ─── Nav button helper ─── */
function NavBtn({ dir, refProp }: { dir: 'prev' | 'next'; refProp: React.RefObject<HTMLButtonElement | null> }) {
  const Icon = dir === 'prev' ? ChevronLeft : ChevronRight
  return (
    <button
      ref={refProp}
      className="flex justify-center items-center bg-[#F5F5F5] hover:bg-[#DB4444] dark:bg-white/10 rounded-full w-10 h-10 text-foreground hover:text-white transition-colors"
    >
      <Icon className="w-5 h-5" />
    </button>
  )
}

/* ════════════════════════════════════════════ */
export default function HomePage() {
/* ════════════════════════════════════════════ */
  const { t, i18n } = useTranslation()
  const currentLang = (i18n.language || 'en') as 'en' | 'ru' | 'tj'
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { list: products, listStatus } = useAppSelector((s) => s.products)
  const { items: categories } = useAppSelector((s) => s.categories)

  const flashPrev = useRef<HTMLButtonElement>(null)
  const flashNext = useRef<HTMLButtonElement>(null)
  const bestPrev  = useRef<HTMLButtonElement>(null)
  const bestNext  = useRef<HTMLButtonElement>(null)
  const catPrev   = useRef<HTMLButtonElement>(null)
  const catNext   = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    dispatch(fetchProducts({ pageNumber: 1, pageSize: 20 }))
    dispatch(fetchCategories())
  }, [dispatch])

  /* ── Localized Modern Hero slides ── */
  const heroSlides = SLIDE_CONFIGS.map((s) => {
    const translation = s.translations[currentLang] || s.translations['en']
    return {
      ...s,
      tag:   translation.tag,
      title: translation.title,
      sub:   translation.sub,
    }
  })

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
    <div className="flex flex-col bg-background min-h-screen">
      <style dangerouslySetInnerHTML={{ __html: floatStyle }} />
      <Header />

      {/* Mobile-only search bar — sits right below the header on small screens */}
      <div className="block md:hidden bg-background px-4 py-3">
        <SearchBox />
      </div>

      {/* Mobile-only category chips — horizontally scrollable row */}
      <div className="block md:hidden bg-background px-4 py-3">
        <div className="flex gap-2 overflow-x-auto pb-0.5">
          {displayCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => cat.id > 0 && navigate(`/products?categoryId=${cat.id}`)}
              className="flex-shrink-0 whitespace-nowrap rounded-md bg-neutral-100 px-3 py-1.5 text-xs font-medium text-foreground dark:bg-zinc-800 transition-colors hover:bg-[#DB4444] hover:text-white"
            >
              {cat.categoryName}
            </button>
          ))}
        </div>
      </div>

      {/* ── Hero banner — mt-6 for breathing room below header ── */}
      <section className="mt-6">
        <div className="flex lg:flex-row flex-col mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-0">

          {/* Sidebar categories */}
          <aside className="hidden lg:block py-6 w-[220px] shrink-0">
            <ul className="space-y-0.5 pr-4">
              {displayCategories.map((cat) => (
                <li key={cat.id} className="group/item relative">
                  <button
                    onClick={() => cat.id > 0 && navigate(`/products?categoryId=${cat.id}`)}
                    className="flex justify-between items-center hover:bg-[#DB4444]/5 px-4 py-2 rounded-[4px] w-full text-foreground hover:text-[#DB4444] text-base transition-colors"
                  >
                    <span>{cat.categoryName}</span>
                    {cat.subCategories.length > 0 && <ChevronRight className="w-3.5 h-3.5 shrink-0" />}
                  </button>
                  {cat.subCategories.length > 0 && (
                    <div className="top-0 left-full z-30 absolute bg-background opacity-0 group-hover/item:opacity-100 shadow-lg ml-1 py-2 border border-border rounded-[4px] min-w-[180px] transition-all duration-150 pointer-events-none group-hover/item:pointer-events-auto">
                      {cat.subCategories.map((sub) => (
                        <button
                          key={sub.id}
                          onClick={() =>
                            cat.id > 0
                              ? navigate(`/products?categoryId=${cat.id}&subcategoryId=${sub.id}`)
                              : navigate('/products')
                          }
                          className="block hover:bg-muted px-4 py-2 w-full text-foreground hover:text-[#DB4444] text-base text-left transition-colors"
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

          {/* Hero Swiper — big rounded on mobile, standard on desktop */}
          <div className="relative flex-1 rounded-[2.5rem] lg:rounded-[2.1rem] overflow-hidden">
            <Swiper
              modules={[Autoplay, Pagination]}
              autoplay={{ delay: 4500, disableOnInteraction: false }}
              pagination={{ clickable: true }}
              loop
              className="h-[500px] sm:h-[360px] lg:h-[420px]"
            >
              {heroSlides.map((slide) => (
                <SwiperSlide key={slide.n}>
                  <div className={`relative h-full w-full overflow-hidden bg-gradient-to-br ${slide.bg} flex flex-col md:flex-row items-center`}>
                    
                    {/* Текстурный фоновый слой (очень низкая прозрачность, чтобы не мешать контенту) */}
                    <img
                      src={slide.img}
                      alt=""
                      className="absolute inset-0 opacity-[0.07] w-full h-full object-cover mix-blend-luminosity pointer-events-none"
                    />
                    
                    {/* Левая колонка: Текст */}
                    <div className="relative z-10 w-full md:w-3/5 flex flex-col justify-center px-8 sm:px-12 lg:px-16 py-8 md:py-0 h-[55%] md:h-full text-left">
                      <span className="inline-block bg-[#DB4444]/90 px-3 py-1 rounded w-fit font-bold text-white text-xs uppercase tracking-widest">
                        {slide.tag}
                      </span>
                      <h1 className="mt-3 sm:mt-4 max-w-md font-bold text-white text-3xl sm:text-4xl lg:text-5xl leading-tight">
                        {slide.title}
                      </h1>
                      <p className="mt-2 sm:mt-3 max-w-xs text-white/70 text-xs sm:text-sm">{slide.sub}</p>
                      <Link
                        to={slide.cta}
                        className="inline-flex items-center gap-2 mt-5 sm:mt-7 pb-0.5 border-white hover:border-[#DB4444] border-b-2 w-fit font-bold text-white hover:text-[#DB4444] text-sm transition-colors"
                      >
                        {t('home.hero_cta')} <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>

                    {/* Правая колонка: Интерактивный 3D-продукт */}
                    <div className="relative z-10 w-full md:w-2/5 h-[45%] md:h-full flex items-center justify-center p-2 sm:p-4">
                      <TiltProductImage src={slide.img} alt={slide.title} />
                    </div>

                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      </section>

      <main className="mx-auto px-4 xl:px-0 w-full max-w-[1280px]">

        {/* ── Flash Sales ── */}
        <section className="mt-16">
          <SectionLabel label={t('products.flash_sales')} />
          <div className="flex flex-wrap justify-between items-end gap-6 mt-5">
            <div className="flex sm:flex-row flex-col sm:items-end gap-5 sm:gap-12">
              <h2 className="font-bold text-foreground text-4xl">{t('products.flash_sales_title')}</h2>
              <CountdownTimer seconds={3 * 3600 + 23 * 60 + 19} />
            </div>
            <div className="flex gap-2">
              <NavBtn dir="prev" refProp={flashPrev} />
              <NavBtn dir="next" refProp={flashNext} />
            </div>
          </div>

          {listStatus === 'loading' && (
            <div className="gap-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 mt-8">
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

          <div className="flex justify-center mt-10">
            <Link
              to="/products"
              className="bg-[#DB4444] hover:opacity-90 px-12 py-3.5 rounded-[4px] font-semibold text-white text-sm transition-opacity"
            >
              {t('home.view_all')}
            </Link>
          </div>
        </section>

        <div className="my-16 bg-border h-px" />

        {/* ── Browse By Category ── */}
        <section>
          <SectionLabel label={t('products.explore_products')} />
          <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
            <h2 className="font-bold text-foreground text-4xl">{t('home.categories_title')}</h2>
            <div className="flex gap-2">
              <NavBtn dir="prev" refProp={catPrev} />
              <NavBtn dir="next" refProp={catNext} />
            </div>
          </div>
          <CategorySwiperSection categories={displayCategories} prevRef={catPrev} nextRef={catNext} />
        </section>

        <div className="my-16 bg-border h-px" />

        {/* ── Best Selling ── */}
        <section>
          <SectionLabel label={t('products.best_selling')} />
          <div className="flex flex-wrap justify-between items-center gap-4 mt-5">
            <h2 className="font-bold text-foreground text-4xl">{t('products.best_selling_title')}</h2>
            <div className="flex items-center gap-3">
              <div className="flex gap-2">
                <NavBtn dir="prev" refProp={bestPrev} />
                <NavBtn dir="next" refProp={bestNext} />
              </div>
              <Link
                to="/products"
                className="bg-[#DB4444] hover:opacity-90 px-8 py-3 rounded-[4px] font-semibold text-white text-sm transition-opacity"
              >
                {t('home.view_all')}
              </Link>
            </div>
          </div>
          {listStatus === 'success' && (
            <ProductSwiperSection products={bestSelling} showBadge="new" prevRef={bestPrev} nextRef={bestNext} />
          )}
          {listStatus === 'loading' && (
            <div className="gap-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 mt-8">
              {Array.from({ length: 4 }).map((_, i) => <ProductSkeleton key={i} />)}
            </div>
          )}
        </section>

        {/* ── Enhance Your Music ── */}
        <div className="bg-black my-16 rounded-2xl overflow-hidden">
          <div className="flex lg:flex-row flex-col items-stretch min-h-[450px]">
            <div className="flex flex-col flex-1 justify-center px-10 lg:px-14 py-16 lg:py-20">
              <p className="font-bold text-[#00FF66] text-sm uppercase tracking-widest">{t('home.music_label')}</p>
              <h3 className="mt-3 font-bold text-white text-3xl lg:text-4xl leading-snug">
                {t('home.music_title')}
              </h3>
              <div className="flex flex-wrap gap-4 mt-8">
                {([
                  ['23', t('home.timer_hours_abbr')],
                  ['05', t('home.timer_days_abbr')],
                  ['59', t('home.timer_minutes_abbr')],
                  ['35', t('home.timer_seconds_abbr')],
                ] as [string, string][]).map(([num, lbl]) => (
                  <div key={lbl} className="flex flex-col items-center bg-white px-3 py-2.5 rounded-full min-w-[64px]">
                    <span className="font-bold text-black text-xl">{num}</span>
                    <span className="text-[10px] text-gray-500">{lbl}</span>
                  </div>
                ))}
              </div>
              <Link
                to="/products"
                className="inline-block bg-[#00FF66] hover:opacity-90 mt-8 px-9 py-3.5 rounded-[4px] w-fit font-bold text-black text-sm transition-opacity"
              >
                {t('home.hero_cta')}
              </Link>
            </div>
            <div className="relative flex-1">
              <img
                src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=85"
                alt={t('home.music_img_alt')}
                className="w-full h-full min-h-[300px] lg:min-h-[450px] object-center object-cover"
              />
              <div className="lg:hidden absolute inset-0 bg-gradient-to-r from-black via-transparent to-transparent opacity-60" />
            </div>
          </div>
        </div>

        {/* ── Explore Products — static 2×4 grid (Figma spec, max 8 cards) ── */}
        <section>
          <SectionLabel label={t('products.explore_products')} />
          <h2 className="mt-5 font-bold text-foreground text-4xl">{t('products.explore_subtitle')}</h2>
          {listStatus === 'loading' && (
            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => <ProductSkeleton key={i} />)}
            </div>
          )}
          {listStatus === 'success' && (
            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {safeProducts.slice(0, 8).map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
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
          <h2 className="mt-5 font-bold text-foreground text-4xl">{t('products.new_arrival_title')}</h2>

          <div className="mt-10 grid grid-cols-1 items-start gap-4 lg:grid-cols-2">
            {/* Large card */}
            <div className="relative bg-black rounded-2xl overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=700&q=85"
                alt={t('home.arrival_ps5')}
                className="opacity-70 w-full h-[550px] object-center object-cover"
              />
              <div className="absolute bottom-8 left-8 right-8">
                <p className="font-bold text-white text-xl">{t('home.arrival_ps5')}</p>
                <p className="mt-1.5 max-w-[260px] text-white/70 text-sm leading-relaxed">
                  {t('home.arrival_ps5_desc')}
                </p>
                <Link
                  to="/products"
                  className="inline-flex items-center gap-1.5 mt-4 pb-0.5 border-white hover:border-[#DB4444] border-b-2 font-bold text-white hover:text-[#DB4444] text-sm transition-colors"
                >
                  {t('home.hero_cta')} <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Right column */}
            <div className="flex flex-col gap-4">
              <div className="relative bg-black rounded-2xl overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1445205170230-053b83016050?w=700&q=85"
                  alt={t('home.arrival_womens')}
                  className="opacity-70 w-full h-[284px] object-center object-cover"
                />
                <div className="absolute bottom-6 left-6">
                  <p className="font-bold text-white text-base">{t('home.arrival_womens')}</p>
                  <p className="mt-1 max-w-[200px] text-white/70 text-xs">{t('home.arrival_womens_desc')}</p>
                  <Link to="/products" className="inline-flex items-center gap-1 mt-2.5 pb-0.5 border-white hover:border-[#DB4444] border-b font-bold text-white hover:text-[#DB4444] text-xs transition-colors">
                    {t('home.hero_cta')} <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="relative bg-black rounded-2xl overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&q=85"
                    alt={t('home.arrival_speakers')}
                    className="opacity-70 w-full h-[248px] object-center object-cover"
                  />
                  <div className="absolute bottom-5 left-5">
                    <p className="font-bold text-white text-sm">{t('home.arrival_speakers')}</p>
                    <p className="mt-1 text-white/70 text-xs">{t('home.arrival_speakers_desc')}</p>
                    <Link to="/products" className="inline-flex items-center gap-1 mt-2 pb-0.5 border-white hover:border-[#DB4444] border-b font-bold text-white hover:text-[#DB4444] text-xs transition-colors">
                      {t('home.hero_cta')} <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
                <div className="relative bg-black rounded-2xl overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=600&q=80"
                    alt={t('home.arrival_perfume')}
                    className="opacity-70 w-full h-[248px] object-center object-cover"
                  />
                  <div className="absolute bottom-5 left-5">
                    <p className="font-bold text-white text-sm">{t('home.arrival_perfume')}</p>
                    <p className="mt-1 text-white/70 text-xs">{t('home.arrival_perfume_desc')}</p>
                    <Link to="/products" className="inline-flex items-center gap-1 mt-2 pb-0.5 border-white hover:border-[#DB4444] border-b font-bold text-white hover:text-[#DB4444] text-xs transition-colors">
                      {t('home.hero_cta')} <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Services ── */}
        <section className="gap-8 grid grid-cols-1 sm:grid-cols-3 my-16">
          {[
            { icon: <Truck className="w-10 h-10" />, title: t('home.services_delivery'),   desc: t('home.services_delivery_desc') },
            { icon: <Headphones className="w-10 h-10" />, title: t('home.services_support'), desc: t('home.services_support_desc') },
            { icon: <ShieldCheck className="w-10 h-10" />, title: t('home.services_guarantee'), desc: t('home.services_guarantee_desc') },
          ].map((s) => (
            <div key={s.title} className="flex flex-col items-center gap-4 text-center">
              <div className="flex justify-center items-center bg-[#2D2D2D] rounded-full ring-[#C1C1C1]/20 ring-[10px] w-[80px] h-[80px] text-white">
                {s.icon}
              </div>
              <div>
                <p className="font-bold text-foreground text-sm uppercase tracking-widest">{s.title}</p>
                <p className="mt-1 text-muted-foreground text-sm">{s.desc}</p>
              </div>
            </div>
          ))}
        </section>
      </main>

      <Footer />
    </div>
  )
}