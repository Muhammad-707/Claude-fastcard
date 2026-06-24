import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Search, Heart, ShoppingCart, Menu, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { LangSwitcher } from '@/features/lang-switcher'
import { ThemeToggle } from '@/features/theme-toggle'
import { useAppSelector } from '@/app/hooks'
import { selectCartCount } from '@/features/cart/model/cartSlice'
import { selectWishlistIds } from '@/features/wishlist/model/wishlistSlice'

const NAV_LINKS = [
  { key: 'nav.home', to: '/' },
  { key: 'nav.contact', to: '/contact' },
  { key: 'nav.about', to: '/about' },
  { key: 'nav.signup', to: '/signup' },
] as const

export function Header() {
  const { t } = useTranslation()
  const [menuOpen, setMenuOpen] = useState(false)
  const cartCount = useAppSelector(selectCartCount)
  const wishlistIds = useAppSelector(selectWishlistIds)

  return (
    <>
      <header className="border-b border-[#EBEBEB] bg-background">
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

            <Link
              to="/"
              className="text-xl font-bold italic tracking-wide text-foreground"
            >
              fastcart
            </Link>

            <Link to="/cart" className="relative p-1 text-foreground">
              <ShoppingCart className="h-6 w-6" />
            </Link>
          </div>

          {/* ── Desktop layout ── */}
          <div className="hidden w-full items-center justify-between gap-6 lg:flex">
            {/* Logo */}
            <Link
              to="/"
              className="shrink-0 text-2xl font-bold italic tracking-wide text-foreground"
            >
              fastcart
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
                        : 'text-foreground hover:border-b-2 hover:border-foreground hover:pb-0.5'
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
              <div className="flex items-center rounded-[4px] border border-[#C4C4C4] bg-background px-3 py-1.5">
                <input
                  type="text"
                  placeholder={t('header.search_placeholder')}
                  className="w-[180px] bg-transparent text-sm text-foreground outline-none placeholder:text-[#8D8D8D] xl:w-[220px]"
                />
                <button
                  type="button"
                  className="ml-2 shrink-0 text-foreground hover:text-primary"
                  aria-label="Search"
                >
                  <Search className="h-4 w-4" />
                </button>
              </div>

              {/* Wishlist */}
              <Link
                to="/wishlist"
                className="relative p-1 text-foreground transition-colors hover:text-primary"
                aria-label="Wishlist"
              >
                <Heart className="h-5 w-5" />
                {wishlistIds.length > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-white">
                    {wishlistIds.length}
                  </span>
                )}
              </Link>

              {/* Cart */}
              <Link
                to="/cart"
                className="relative p-1 text-foreground transition-colors hover:text-primary"
                aria-label="Cart"
              >
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-white">
                    {cartCount}
                  </span>
                )}
              </Link>

              {/* Divider */}
              <div className="h-5 w-px bg-border" />

              {/* Theme + Language */}
              <ThemeToggle />
              <LangSwitcher />
            </div>
          </div>
        </div>
      </header>

      {/* ── Mobile drawer ── */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMenuOpen(false)}
          />

          {/* Drawer */}
          <div className="relative z-10 flex h-full w-72 flex-col bg-background shadow-xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border px-4 py-4">
              <Link
                to="/"
                className="text-xl font-bold italic text-foreground"
                onClick={() => setMenuOpen(false)}
              >
                fastcart
              </Link>
              <button
                onClick={() => setMenuOpen(false)}
                className="p-1 text-foreground"
                aria-label="Close menu"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Nav links */}
            <nav className="flex flex-col gap-1 p-4">
              {NAV_LINKS.map((link) => (
                <NavLink
                  key={link.key}
                  to={link.to}
                  end={link.to === '/'}
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    `rounded-[4px] px-4 py-3 text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-primary text-white'
                        : 'text-foreground hover:bg-accent'
                    }`
                  }
                >
                  {t(link.key)}
                </NavLink>
              ))}
            </nav>

            {/* Search inside drawer */}
            <div className="px-4">
              <div className="flex items-center rounded-[4px] border border-[#C4C4C4] bg-background px-3 py-1.5">
                <input
                  type="text"
                  placeholder={t('header.search_placeholder')}
                  className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-[#8D8D8D]"
                />
                <Search className="ml-2 h-4 w-4 text-foreground" />
              </div>
            </div>

            {/* Bottom: theme + lang */}
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
