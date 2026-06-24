import { useState, useRef, useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Search, Heart, ShoppingCart, Menu, X, User, Package, LogOut } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { LangSwitcher } from '@/features/lang-switcher'
import { ThemeToggle } from '@/features/theme-toggle'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { selectCartCount } from '@/features/cart/model/cartSlice'
import { selectWishlistIds } from '@/features/wishlist/model/wishlistSlice'
import { selectIsAuth } from '@/features/auth/model/authSlice'
import { logout } from '@/features/auth/model/authSlice'
import { fetchProducts, setFilters } from '@/features/products/model/productsSlice'

const BASE_NAV_LINKS = [
  { key: 'nav.home', to: '/' },
  { key: 'nav.contact', to: '/contact' },
  { key: 'nav.about', to: '/about' },
] as const

function FastCartLogo() {
  return (
    <Link to="/" className="flex shrink-0 items-center gap-2 group">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#DB4444]">
        <ShoppingCart className="h-4 w-4 text-white" />
      </div>
      <span className="text-xl font-bold italic tracking-tight text-foreground group-hover:text-[#DB4444] transition-colors">
        Exclusive
      </span>
    </Link>
  )
}

function UserModal() {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const isAuth = useAppSelector(selectIsAuth)
  const auth = useAppSelector((s) => s.auth)
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  if (!isAuth) {
    return (
      <Link
        to="/login"
        className="p-1.5 text-foreground/70 transition-colors hover:text-foreground"
        aria-label="Account"
      >
        <User className="h-5 w-5" />
      </Link>
    )
  }

  const userName = auth.user?.name ?? auth.user?.sub ?? 'User'

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-[#DB4444] text-white transition-colors hover:bg-[#c73333]"
        aria-label="Account"
      >
        <span className="text-sm font-bold uppercase">
          {userName.charAt(0)}
        </span>
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-3 w-52 overflow-hidden rounded-xl border border-border/50 bg-background/95 shadow-2xl backdrop-blur-md">
          {/* User info */}
          <div className="border-b border-border/50 bg-[#DB4444]/5 px-4 py-3">
            <p className="text-sm font-semibold text-foreground line-clamp-1">{userName}</p>
            <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">{auth.user?.email ?? ''}</p>
          </div>

          {/* Menu items */}
          <div className="py-1.5">
            <button
              onClick={() => { setOpen(false); navigate('/profile') }}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-foreground transition-colors hover:bg-muted"
            >
              <User className="h-4 w-4 text-muted-foreground" />
              {t('profile.my_account')}
            </button>
            <button
              onClick={() => { setOpen(false); navigate('/profile') }}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-foreground transition-colors hover:bg-muted"
            >
              <Package className="h-4 w-4 text-muted-foreground" />
              {t('profile.my_orders')}
            </button>
          </div>

          <div className="border-t border-border/50 py-1.5">
            <button
              onClick={() => { dispatch(logout()); setOpen(false); navigate('/login') }}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-[#DB4444] transition-colors hover:bg-[#DB4444]/5"
            >
              <LogOut className="h-4 w-4" />
              {t('auth.logout')}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function BadgeIcon({ count, children }: { count: number; children: React.ReactNode }) {
  return (
    <div className="relative">
      {children}
      {count > 0 && (
        <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#DB4444] text-[9px] font-bold text-white">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </div>
  )
}

export function Header() {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [query, setQuery] = useState('')
  const cartCount = useAppSelector(selectCartCount)
  const wishlistCount = useAppSelector(selectWishlistIds).length
  const isAuth = useAppSelector(selectIsAuth)

  const navLinks = [
    ...BASE_NAV_LINKS,
    ...(isAuth ? [] : [{ key: 'nav.signup' as const, to: '/signup' }]),
  ]

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return
    dispatch(setFilters({ productName: query.trim() }))
    dispatch(fetchProducts({ productName: query.trim(), pageNumber: 1, pageSize: 12 }))
    navigate('/products')
    setQuery('')
    setMenuOpen(false)
  }

  return (
    <>
      {/* Fixed header */}
      <header className="fixed left-0 right-0 top-0 z-50 border-b border-gray-200/50 bg-white/80 backdrop-blur-md dark:border-white/10 dark:bg-gray-950/80">

        {/* ── Desktop ── */}
        <div className="mx-auto hidden max-w-[1280px] items-center justify-between gap-6 px-4 py-3.5 xl:px-0 lg:flex">
          <FastCartLogo />

          <nav className="flex items-center gap-8">
            {navLinks.map((link) => (
              <NavLink
                key={link.key}
                to={link.to}
                end={link.to === '/'}
                className={({ isActive }) =>
                  `text-base font-medium transition-colors ${
                    isActive
                      ? 'border-b-2 border-foreground pb-0.5 text-foreground'
                      : 'text-foreground/70 hover:text-foreground'
                  }`
                }
              >
                {t(link.key)}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            {/* Search */}
            <form
              onSubmit={handleSearch}
              className="flex items-center gap-2 rounded-[4px] border border-border bg-[#F5F5F5] px-3 py-2 dark:bg-white/5"
            >
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t('header.search_placeholder')}
                className="w-[180px] bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
              />
              <button type="submit" className="shrink-0 text-muted-foreground hover:text-foreground transition-colors" aria-label="Search">
                <Search className="h-4 w-4" />
              </button>
            </form>

            <ThemeToggle />
            <LangSwitcher />

            <div className="h-5 w-px bg-border" />

            {/* Wishlist */}
            <Link
              to={isAuth ? '/wishlist' : '/login'}
              className="p-1 text-foreground/70 transition-colors hover:text-foreground"
              aria-label="Wishlist"
            >
              <BadgeIcon count={wishlistCount}>
                <Heart className="h-5 w-5" />
              </BadgeIcon>
            </Link>

            {/* Cart */}
            <Link
              to={isAuth ? '/cart' : '/login'}
              className="p-1 text-foreground/70 transition-colors hover:text-foreground"
              aria-label="Cart"
            >
              <BadgeIcon count={cartCount}>
                <ShoppingCart className="h-5 w-5" />
              </BadgeIcon>
            </Link>

            <UserModal />
          </div>
        </div>

        {/* ── Mobile ── */}
        <div className="flex items-center justify-between px-4 py-3.5 lg:hidden">
          <button
            onClick={() => setMenuOpen(true)}
            className="p-1.5 text-foreground"
            aria-label="Open menu"
          >
            <Menu className="h-6 w-6" />
          </button>

          <FastCartLogo />

          <div className="flex items-center gap-2.5">
            <Link to={isAuth ? '/wishlist' : '/login'} className="relative p-1 text-foreground">
              <BadgeIcon count={wishlistCount}><Heart className="h-5 w-5" /></BadgeIcon>
            </Link>
            <Link to={isAuth ? '/cart' : '/login'} className="relative p-1 text-foreground">
              <BadgeIcon count={cartCount}><ShoppingCart className="h-5 w-5" /></BadgeIcon>
            </Link>
          </div>
        </div>
      </header>

      {/* Spacer so content doesn't go behind fixed header */}
      <div className="h-[64px] shrink-0" aria-hidden="true" />

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMenuOpen(false)} />
          <div className="relative z-10 flex h-full w-72 flex-col bg-background shadow-2xl">
            <div className="flex items-center justify-between border-b border-border px-4 py-4">
              <FastCartLogo />
              <button onClick={() => setMenuOpen(false)} className="p-1 text-foreground" aria-label="Close">
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="px-4 py-3">
              <form onSubmit={handleSearch} className="flex items-center gap-2 rounded-[4px] border border-border bg-muted px-3 py-2">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t('header.search_placeholder')}
                  className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
                />
                <button type="submit" className="text-muted-foreground" aria-label="Search">
                  <Search className="h-4 w-4" />
                </button>
              </form>
            </div>

            <nav className="flex flex-col gap-0.5 px-4">
              {navLinks.map((link) => (
                <NavLink
                  key={link.key}
                  to={link.to}
                  end={link.to === '/'}
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    `rounded-[4px] px-4 py-3 text-sm font-medium transition-colors ${
                      isActive ? 'bg-[#DB4444] text-white' : 'text-foreground hover:bg-muted'
                    }`
                  }
                >
                  {t(link.key)}
                </NavLink>
              ))}
            </nav>

            {isAuth && (
              <div className="px-4 py-2">
                <button
                  onClick={() => { navigate('/profile'); setMenuOpen(false) }}
                  className="flex w-full items-center gap-3 rounded-[4px] px-4 py-3 text-sm font-medium text-foreground hover:bg-muted transition-colors"
                >
                  <User className="h-4 w-4" />
                  {t('profile.my_account')}
                </button>
                <button
                  onClick={() => { dispatch(logout()); setMenuOpen(false); navigate('/login') }}
                  className="flex w-full items-center gap-3 rounded-[4px] px-4 py-3 text-sm font-medium text-[#DB4444] hover:bg-muted transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  {t('auth.logout')}
                </button>
              </div>
            )}

            <div className="mt-auto flex items-center gap-3 border-t border-border p-4">
              <ThemeToggle />
              <LangSwitcher />
            </div>
          </div>
        </div>
      )}
    </>
  )
}
