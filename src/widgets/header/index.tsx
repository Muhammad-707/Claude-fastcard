import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import {
  Heart, ShoppingCart, Menu, X,
  User, Package, LogOut, ShoppingBag, Bookmark,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { LangSwitcher } from '@/features/lang-switcher'
import { ThemeToggle } from '@/features/theme-toggle'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { selectCartCount } from '@/features/cart/model/cartSlice'
import { selectWishlistIds } from '@/features/wishlist/model/wishlistSlice'
import { selectIsAuth, logout } from '@/features/auth/model/authSlice'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'
import { SearchBox } from './SearchBox'

const BASE_NAV_LINKS = [
  { key: 'nav.home', to: '/' },
  { key: 'nav.contact', to: '/contact' },
  { key: 'nav.about', to: '/about' },
] as const

/* ── Shared dark-dropdown styles ──────────────────────────────────── */
const DARK_CONTENT = 'bg-black/80 backdrop-blur-md border-white/10 shadow-2xl p-1 z-[9999]'
const DARK_ITEM =
  'cursor-pointer gap-3 px-4 py-2.5 text-sm font-normal text-zinc-200 rounded-[4px] ' +
  'focus:bg-white/10 focus:text-white data-[highlighted]:bg-white/10 data-[highlighted]:text-white'
const DARK_LOGOUT =
  'cursor-pointer gap-3 px-4 py-2.5 text-sm font-normal text-[#DB4444] rounded-[4px] ' +
  'focus:bg-[#DB4444]/15 focus:text-[#DB4444]'

/* ── Logo ──────────────────────────────────────────────────────────── */
function FastCartLogo() {
  return (
    <Link to="/" className="group flex shrink-0 items-center gap-2">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#DB4444]">
        <ShoppingBag className="h-4 w-4 text-white" />
      </div>
      <span className="text-xl font-bold tracking-tight text-foreground transition-colors group-hover:text-[#DB4444]">
        FastCart
      </span>
    </Link>
  )
}

/* ── Badge wrapper ─────────────────────────────────────────────────── */
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

/* ── Desktop user dropdown — 3 items ───────────────────────────────── */
function DesktopUserDropdown() {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const isAuth = useAppSelector(selectIsAuth)
  const auth = useAppSelector((s) => s.auth)

  const userName = auth.user?.name ?? auth.user?.sub ?? 'User'
  const initial = userName.charAt(0).toUpperCase()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={
            isAuth
              ? 'flex h-9 w-9 items-center justify-center rounded-full bg-[#DB4444] text-white transition-colors hover:bg-[#c73333] focus:outline-none'
              : 'p-1.5 text-foreground/70 transition-colors hover:text-foreground focus:outline-none'
          }
          aria-label="My Account"
        >
          {isAuth ? (
            <span className="text-sm font-bold">{initial}</span>
          ) : (
            <User className="h-5 w-5" />
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" sideOffset={10} className={`w-52 ${DARK_CONTENT}`}>
        <DropdownMenuItem className={DARK_ITEM} onClick={() => navigate('/profile')}>
          <User className="h-4 w-4 shrink-0" />
          {t('profile.my_account')}
        </DropdownMenuItem>

        <DropdownMenuItem className={DARK_ITEM} onClick={() => navigate('/profile')}>
          <Package className="h-4 w-4 shrink-0" />
          {t('profile.my_orders')}
        </DropdownMenuItem>

        <DropdownMenuSeparator className="my-1 bg-zinc-700" />

        <DropdownMenuItem className={DARK_LOGOUT} onClick={() => { dispatch(logout()); navigate('/login') }}>
          <LogOut className="h-4 w-4 shrink-0" />
          {t('auth.logout')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

/* ── Mobile user dropdown — 4 items ────────────────────────────────── */
function MobileUserDropdown() {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const isAuth = useAppSelector(selectIsAuth)
  const auth = useAppSelector((s) => s.auth)

  const userName = auth.user?.name ?? auth.user?.sub ?? 'User'
  const initial = userName.charAt(0).toUpperCase()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={
            isAuth
              ? 'flex h-9 w-9 items-center justify-center rounded-full bg-[#DB4444] text-white transition-colors hover:bg-[#c73333] focus:outline-none'
              : 'p-1 text-foreground focus:outline-none'
          }
          aria-label="My Account"
        >
          {isAuth ? (
            <span className="text-sm font-bold">{initial}</span>
          ) : (
            <User className="h-5 w-5" />
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" sideOffset={10} className={`w-52 ${DARK_CONTENT}`}>
        <DropdownMenuItem className={DARK_ITEM} onClick={() => navigate('/profile')}>
          <User className="h-4 w-4 shrink-0" />
          {t('profile.my_account')}
        </DropdownMenuItem>

        <DropdownMenuItem className={DARK_ITEM} onClick={() => navigate('/profile')}>
          <Package className="h-4 w-4 shrink-0" />
          {t('profile.my_orders')}
        </DropdownMenuItem>

        <DropdownMenuItem className={DARK_ITEM} onClick={() => navigate('/wishlist')}>
          <Bookmark className="h-4 w-4 shrink-0" />
          {t('nav.wishlist')}
        </DropdownMenuItem>

        <DropdownMenuSeparator className="my-1 bg-zinc-700" />

        <DropdownMenuItem className={DARK_LOGOUT} onClick={() => { dispatch(logout()); navigate('/login') }}>
          <LogOut className="h-4 w-4 shrink-0" />
          {t('auth.logout')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

/* ── Header ────────────────────────────────────────────────────────── */
export function Header() {
  const { t } = useTranslation()
  const [menuOpen, setMenuOpen] = useState(false)
  const cartCount = useAppSelector(selectCartCount)
  const wishlistCount = useAppSelector(selectWishlistIds).length
  const isAuth = useAppSelector(selectIsAuth)

  const navLinks = [
    ...BASE_NAV_LINKS,
    ...(isAuth ? [] : [{ key: 'nav.signup' as const, to: '/signup' }]),
  ]

  return (
    <>
      {/* Fixed header */}
      <header className="fixed left-0 right-0 top-0 z-50 border-b border-gray-200/50 bg-white/90 backdrop-blur-md dark:border-white/10 dark:bg-gray-950/90">

        {/* ── Desktop ────────────────────────────────────────────── */}
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
            {/* Search with live autocomplete */}
            <SearchBox className="w-[220px]" />

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

            {/* User — desktop dropdown (3 items) */}
            <DesktopUserDropdown />
          </div>
        </div>

        {/* ── Mobile ─────────────────────────────────────────────── */}
        {/* Layout: [☰ Hamburger] [FastCart Logo] [🛒 Cart] [👤 User] */}
        <div className="flex items-center justify-between px-4 py-3.5 lg:hidden">
          <button
            onClick={() => setMenuOpen(true)}
            className="p-1.5 text-foreground"
            aria-label="Open menu"
          >
            <Menu className="h-6 w-6" />
          </button>

          <FastCartLogo />

          <div className="flex items-center gap-3">
            <Link
              to={isAuth ? '/cart' : '/login'}
              className="relative p-1 text-foreground"
              aria-label="Cart"
            >
              <BadgeIcon count={cartCount}>
                <ShoppingCart className="h-5 w-5" />
              </BadgeIcon>
            </Link>

            {/* User — mobile dropdown (4 items, includes Wishlist) */}
            <MobileUserDropdown />
          </div>
        </div>
      </header>

      {/* Spacer */}
      <div className="h-[64px] shrink-0" aria-hidden="true" />

      {/* Mobile nav drawer */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMenuOpen(false)} />

          <div className="relative z-10 flex h-full w-72 flex-col bg-background shadow-2xl">
            {/* Drawer header */}
            <div className="flex items-center justify-between border-b border-border px-4 py-4">
              <FastCartLogo />
              <button
                onClick={() => setMenuOpen(false)}
                className="p-1 text-foreground"
                aria-label="Close"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Search with live autocomplete */}
            <div className="px-4 py-3">
              <SearchBox onClose={() => setMenuOpen(false)} />
            </div>

            {/* Nav links */}
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

            {/* Theme + Lang at bottom */}
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
