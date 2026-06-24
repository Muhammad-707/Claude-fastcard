import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'

function IconFacebook() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  )
}
function IconTwitter() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
      <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
    </svg>
  )
}
function IconInstagram() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-6 w-6">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  )
}
function IconLinkedin() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  )
}

export function Footer() {
  const { t } = useTranslation()
  const [email, setEmail] = useState('')

  return (
    <footer className="bg-black text-white">
      <div className="mx-auto max-w-[1280px] px-4 py-14 xl:px-0">
        {/* ── 5-column grid (desktop) ── */}
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-5 lg:gap-8">

          {/* Col 1 — Exclusive + Subscribe */}
          <div className="flex flex-col gap-4">
            <h3 className="text-xl font-bold">{t('footer.exclusive')}</h3>
            <p className="text-sm font-medium">{t('footer.tagline')}</p>
            <p className="text-sm text-[#B3B3B3]">{t('footer.subscribe_desc')}</p>
            <div className="flex items-center rounded-[4px] border border-[#B3B3B3]">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('footer.subscribe_placeholder')}
                className="flex-1 bg-transparent px-4 py-2 text-sm text-white outline-none placeholder:text-[#B3B3B3]"
              />
              <button
                type="button"
                className="px-3 py-2 text-white transition-colors hover:text-primary"
                aria-label={t('footer.subscribe_btn')}
              >
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Col 2 — Support */}
          <div className="flex flex-col gap-4">
            <h3 className="text-xl font-medium">{t('footer.support')}</h3>
            <ul className="flex flex-col gap-3 text-sm text-[#B3B3B3]">
              <li>{t('footer.support_address')}</li>
              <li>{t('footer.support_email')}</li>
              <li>{t('footer.support_phone')}</li>
            </ul>
          </div>

          {/* Col 3 — Account */}
          <div className="flex flex-col gap-4">
            <h3 className="text-xl font-medium">{t('footer.account')}</h3>
            <ul className="flex flex-col gap-3 text-sm">
              <li>
                <Link to="/profile" className="text-[#B3B3B3] transition-colors hover:text-white">
                  {t('footer.my_account')}
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-[#B3B3B3] transition-colors hover:text-white">
                  {t('footer.login_register')}
                </Link>
              </li>
              <li>
                <Link to="/cart" className="text-[#B3B3B3] transition-colors hover:text-white">
                  {t('footer.cart')}
                </Link>
              </li>
              <li>
                <Link to="/wishlist" className="text-[#B3B3B3] transition-colors hover:text-white">
                  {t('footer.wishlist')}
                </Link>
              </li>
              <li>
                <Link to="/products" className="text-[#B3B3B3] transition-colors hover:text-white">
                  {t('footer.shop')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4 — Quick Link */}
          <div className="flex flex-col gap-4">
            <h3 className="text-xl font-medium">{t('footer.quick_link')}</h3>
            <ul className="flex flex-col gap-3 text-sm">
              <li>
                <Link to="/privacy" className="text-[#B3B3B3] transition-colors hover:text-white">
                  {t('footer.privacy_policy')}
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-[#B3B3B3] transition-colors hover:text-white">
                  {t('footer.terms')}
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-[#B3B3B3] transition-colors hover:text-white">
                  {t('footer.faq')}
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-[#B3B3B3] transition-colors hover:text-white">
                  {t('footer.contact')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 5 — Social */}
          <div className="flex flex-col gap-4">
            <h3 className="text-xl font-medium">{t('footer.follow_us')}</h3>
            <div className="flex items-center gap-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white transition-colors hover:text-primary"
                aria-label="Facebook"
              >
                <IconFacebook />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white transition-colors hover:text-primary"
                aria-label="Twitter"
              >
                <IconTwitter />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white transition-colors hover:text-primary"
                aria-label="Instagram"
              >
                <IconInstagram />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white transition-colors hover:text-primary"
                aria-label="LinkedIn"
              >
                <IconLinkedin />
              </a>
            </div>
          </div>
        </div>

        {/* ── Copyright ── */}
        <div className="mt-12 border-t border-[#B3B3B3]/30 pt-6 text-center text-sm text-[#B3B3B3]">
          {t('footer.copyright')}
        </div>
      </div>
    </footer>
  )
}
