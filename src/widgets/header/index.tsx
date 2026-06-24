import { useState, useRef, useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Search, Heart, ShoppingCart, Menu, X, User, LogOut, UserCircle, ShoppingBag } from 'lucide-react'
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
  { key: 'nav.home', to: '/' },
  { key: 'nav.contact', to: '/contact' },
  { key: 'nav.about', to: '/about' },
] as const

function UserMenu() {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const isAuth = useAppSelector(selectIsAuth)
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  if (!isAuth) {
    return (
      <Link
        to="/login"
        className="flex items-center gap-1.5 rounded-[4px] bg-[#DB4444] px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
      >
        <User className="h-4 w-4" />
        {t('auth.login')}
      </Link>
    )
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-[#DB4444] text-white transition-opacity hover:opacity-90"
        aria-label="User menu"
      >
        <UserCircle className="h-5 w-5" />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-44 overflow-hidden rounded-[4px] border border-border bg-background shadow-lg">
          <Link
            to="/profile"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 px-4 py-3 text-sm text-foreground hover:bg-muted transition-colors"
          >
            <UserCircle className="h-4 w-4 text-muted-foreground" />
            {t('profile.my_profile')}
          </Link>
          <Link
            to="/cart"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 px-4 py-3 text-sm text-foreground hover:bg-muted transition-colors"
          >
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
            {t('cart.title')}
          </Link>
          <Link
            to="/wishlist"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 px-4 py-3 text-sm text-foreground hover:bg-muted transition-colors"
          >
            <Heart className="h-4 w-4 text-muted-foreground" />
            {t('wishlist.title')}
          </Link>
          <div className="h-px bg-border" />
          <button
            onClick={() => { dispatch(logout()); setOpen(false); navigate('/login') }}
            className="flex w-full items-center gap-2.5 px-4 py-3 text-sm text-[#DB4444] hover:bg-muted transition-colors"
          >
            <LogOut className="h-4 w-4" />
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
  const wishlistIds = useAppSelector(selectWishlistIds)
  const isAuth = useAppSelector(selectIsAuth)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return
    dispatch(setFilters({ productName: query.trim() }))
    dispatch(fetchProducts({ productName: query.trim(), pageNumber: 1, pageSize: 12 }))
    navigate('/products')
    setQuery('')
  }

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-[1170px] items-center justify-between px-4 py-4 xl:px-0">

          {/* ── Mobile layout ── */}
          <div className="flex w-full items-center justify-between lg:hidden">
            <button
              onClick={() => setMenuOpen(true)}
              className="p-1 text-foreground"
              aria-label="Open menu"
            >
              <Menu className="h-6 w-6" />
            </button>

            <Link to="/" className="flex items-center gap-1.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-[4px] bg-[#DB4444]">
                <ShoppingCart className="h-4 w-4 text-white" />
              </div>
              <span className="text-xl font-bold italic tracking-wide text-foreground">fastcart</span>
            </Link>

            <Link to={isAuth ? '/cart' : '/login'} className="relative p-1 text-foreground">
              <ShoppingCart className="h-6 w-6" />
              {cartCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#DB4444] text-[9px] font-bold text-white">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>

          {/* ── Desktop layout ── */}
          <div className="hidden w-full items-center justify-between gap-6 lg:flex">
            {/* Logo */}
            <Link to="/" className="flex shrink-0 items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-[4px] bg-[#DB4444]">
                <ShoppingCart className="h-4 w-4 text-white" />
              </div>
              <span className="text-2xl font-bold italic tracking-wide text-foreground">fastcart</span>
            </Link>

            {/* Nav */}
            <nav className="flex items-center gap-8">
              {NAV_LINKS.map((link) => (
                <NavLink
                  key={link.key}
                  to={link.to}
                  end={link.to === '/'}
                  className={({ isActive }) =>
                    `text-sm font-medium transition-colors ${
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

            {/* Right controls */}
            <div className="flex items-center gap-3">
              {/* Search */}
              <form onSubmit={handleSearch} className="flex items-center rounded-[4px] border border-border bg-background px-3 py-1.5">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t('header.search_placeholder')}
                  className="w-[180px] bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground xl:w-[220px]"
                />
                <button
                  type="submit"
                  className="ml-2 shrink-0 text-muted-foreground hover:text-[#DB4444] transition-colors"
                  aria-label="Search"
                >
                  <Search className="h-4 w-4" />
                </button>
              </form>

              {/* Wishlist */}
              <Link
                to={isAuth ? '/wishlist' : '/login'}
                className="relative p-1 text-foreground/70 transition-colors hover:text-[#DB4444]"
                aria-label="Wishlist"
              >
                <Heart className="h-5 w-5" />
                {wishlistIds.length > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#DB4444] text-[9px] font-bold text-white">
                    {wishlistIds.length}
                  </span>
                )}
              </Link>

              {/* Cart */}
              <Link
                to={isAuth ? '/cart' : '/login'}
                className="relative p-1 text-foreground/70 transition-colors hover:text-[#DB4444]"
                aria-label="Cart"
              >
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#DB4444] text-[9px] font-bold text-white">
                    {cartCount}
                  </span>
                )}
              </Link>

              <div className="h-5 w-px bg-border" />

              <ThemeToggle />
              <LangSwitcher />

              <div className="h-5 w-px bg-border" />

              <UserMenu />
            </div>
          </div>
        </div>
      </header>

      {/* ── Mobile drawer ── */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMenuOpen(false)} />

          <div className="relative z-10 flex h-full w-72 flex-col bg-background shadow-xl">
            <div className="flex items-center justify-between border-b border-border px-4 py-4">
              <Link to="/" className="flex items-center gap-1.5" onClick={() => setMenuOpen(false)}>
                <div className="flex h-7 w-7 items-center justify-center rounded-[4px] bg-[#DB4444]">
                  <ShoppingCart className="h-3.5 w-3.5 text-white" />
                </div>
                <span className="text-xl font-bold italic text-foreground">fastcart</span>
              </Link>
              <button onClick={() => setMenuOpen(false)} className="p-1 text-foreground" aria-label="Close menu">
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Search */}
            <div className="px-4 py-3">
              <form onSubmit={(e) => { handleSearch(e); setMenuOpen(false) }} className="flex items-center rounded-[4px] border border-border bg-background px-3 py-2">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t('header.search_placeholder')}
                  className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
                />
                <button type="submit" className="ml-2 text-muted-foreground" aria-label="Search">
                  <Search className="h-4 w-4" />
                </button>
              </form>
            </div>

            <nav className="flex flex-col gap-1 px-4">
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
              {isAuth ? (
                <>
                  <Link to="/profile" onClick={() => setMenuOpen(false)} className="rounded-[4px] px-4 py-3 text-sm font-medium text-foreground hover:bg-muted transition-colors">
                    {t('profile.my_profile')}
                  </Link>
                  <Link to="/wishlist" onClick={() => setMenuOpen(false)} className="rounded-[4px] px-4 py-3 text-sm font-medium text-foreground hover:bg-muted transition-colors">
                    {t('wishlist.title')}
                  </Link>
                </>
              ) : (
                <Link to="/signup" onClick={() => setMenuOpen(false)} className="rounded-[4px] px-4 py-3 text-sm font-medium text-foreground hover:bg-muted transition-colors">
                  {t('auth.register')}
                </Link>
              )}
            </nav>

            <div className="mt-auto flex items-center gap-2 border-t border-border p-4">
              <LangSwitcher />
              <ThemeToggle />
            </div>
          </div>
        </div>
      )}
    </>
  )
}
