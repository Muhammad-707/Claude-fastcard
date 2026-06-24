import { useState, useRef, useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Search, Heart, ShoppingCart, Menu, X, User } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { LangSwitcher } from '@/features/lang-switcher'
import { ThemeToggle } from '@/features/theme-toggle'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { selectCartCount } from '@/features/cart/model/cartSlice'
import { selectWishlistIds } from '@/features/wishlist/model/wishlistSlice'
import { selectIsAuth } from '@/features/auth/model/authSlice'
import { logout } from '@/features/auth/model/authSlice'
import { fetchProducts, setFilters } from '@/features/products/model/productsSlice'

const NAV_LINKS = [
  { key: 'nav.home',    to: '/' },
  { key: 'nav.contact', to: '/contact' },
  { key: 'nav.about',   to: '/about' },
  { key: 'nav.signup',  to: '/signup' },
] as const

function FastCartLogo() {
  return (
    <Link to="/" className="flex shrink-0 items-center gap-1.5">
      <span className="text-2xl leading-none">🛒</span>
      <span className="text-xl font-bold italic tracking-wide text-foreground">fastcart</span>
    </Link>
  )
}

function UserDropdown() {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const isAuth = useAppSelector(selectIsAuth)
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
      <Link to="/login" className="p-1 text-foreground/80 transition-colors hover:text-foreground" aria-label="Account">
        <User className="h-5 w-5" />
      </Link>
    )
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="p-1 text-foreground/80 transition-colors hover:text-foreground"
        aria-label="Account"
      >
        <User className="h-5 w-5" />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-48 overflow-hidden rounded-[4px] border border-border bg-background shadow-lg">
          <Link
            to="/profile"
            onClick={() => setOpen(false)}
            className="block px-4 py-3 text-sm text-foreground hover:bg-muted transition-colors"
          >
            {t('profile.my_profile')}
          </Link>
          <Link
            to="/cart"
            onClick={() => setOpen(false)}
            className="block px-4 py-3 text-sm text-foreground hover:bg-muted transition-colors"
          >
            {t('cart.title')}
          </Link>
          <Link
            to="/wishlist"
            onClick={() => setOpen(false)}
            className="block px-4 py-3 text-sm text-foreground hover:bg-muted transition-colors"
          >
            {t('wishlist.title')}
          </Link>
          <div className="h-px bg-border" />
          <button
            onClick={() => { dispatch(logout()); setOpen(false); navigate('/login') }}
            className="block w-full px-4 py-3 text-left text-sm text-[#DB4444] hover:bg-muted transition-colors"
          >
            {t('auth.logout')}
          </button>
        </div>
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
      <header className="sticky top-0 z-50 border-b border-gray-200/50 bg-white/70 backdrop-blur-md dark:border-white/10 dark:bg-black/70">
        {/* ── Desktop ── */}
        <div className="mx-auto hidden max-w-[1280px] items-center justify-between px-4 py-4 xl:px-0 lg:flex">
          <FastCartLogo />

          <nav className="flex items-center gap-10">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.key}
                to={link.to}
                end={link.to === '/'}
                className={({ isActive }) =>
                  `text-base font-medium transition-colors ${
                    isActive
                      ? 'border-b-2 border-foreground pb-0.5 text-foreground'
                      : 'text-foreground/80 hover:text-foreground hover:border-b-2 hover:border-foreground hover:pb-0.5'
                  }`
                }
              >
                {t(link.key)}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            {/* Search */}
            <form onSubmit={handleSearch} className="flex items-center gap-2 rounded-[4px] border border-border bg-background px-3 py-2">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t('header.search_placeholder')}
                className="w-[200px] bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
              />
              <button type="submit" className="shrink-0 text-muted-foreground hover:text-foreground transition-colors" aria-label="Search">
                <Search className="h-4 w-4" />
              </button>
            </form>

            {/* Wishlist */}
            <Link
              to={isAuth ? '/wishlist' : '/login'}
              className="relative p-0.5 text-foreground/80 transition-colors hover:text-foreground"
              aria-label="Wishlist"
            >
              <Heart className="h-5 w-5" />
              {wishlistCount > 0 && (
                <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#DB4444] text-[9px] font-bold text-white">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link
              to={isAuth ? '/cart' : '/login'}
              className="relative p-0.5 text-foreground/80 transition-colors hover:text-foreground"
              aria-label="Cart"
            >
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#DB4444] text-[9px] font-bold text-white">
                  {cartCount}
                </span>
              )}
            </Link>

            <UserDropdown />
            <ThemeToggle />
            <LangSwitcher />
          </div>
        </div>

        {/* ── Mobile ── */}
        <div className="flex items-center justify-between px-4 py-4 lg:hidden">
          <button onClick={() => setMenuOpen(true)} className="p-1 text-foreground" aria-label="Open menu">
            <Menu className="h-6 w-6" />
          </button>

          <Link to="/" className="flex items-center gap-1">
            <span className="text-xl leading-none">🛒</span>
            <span className="text-lg font-bold italic tracking-wide text-foreground">fastcart</span>
          </Link>

          <div className="flex items-center gap-3">
            <Link to={isAuth ? '/wishlist' : '/login'} className="relative p-0.5 text-foreground">
              <Heart className="h-5 w-5" />
              {wishlistCount > 0 && (
                <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#DB4444] text-[9px] font-bold text-white">
                  {wishlistCount}
                </span>
              )}
            </Link>
            <Link to={isAuth ? '/cart' : '/login'} className="relative p-0.5 text-foreground">
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#DB4444] text-[9px] font-bold text-white">
                  {cartCount}
                </span>
              )}
            </Link>
            <Link to={isAuth ? '/profile' : '/login'} className="p-0.5 text-foreground">
              <User className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMenuOpen(false)} />
          <div className="relative z-10 flex h-full w-72 flex-col bg-background shadow-xl">
            <div className="flex items-center justify-between border-b border-border px-4 py-4">
              <FastCartLogo />
              <button onClick={() => setMenuOpen(false)} className="p-1 text-foreground" aria-label="Close">
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="px-4 py-3">
              <form onSubmit={handleSearch} className="flex items-center gap-2 rounded-[4px] border border-border px-3 py-2">
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
              {NAV_LINKS.map((link) => (
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

            <div className="mt-auto flex items-center gap-2 border-t border-border p-4">
              <ThemeToggle />
              <LangSwitcher />
            </div>
          </div>
        </div>
      )}
    </>
  )
}
