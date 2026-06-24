import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Send } from 'lucide-react'
import { useTranslation } from 'react-i18next'

function IconFacebook() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  )
}
function IconTwitter() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
      <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
    </svg>
  )
}
function IconInstagram() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  )
}
function IconLinkedin() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  )
}

export function Footer() {
  const { t } = useTranslation()
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    setSubscribed(true)
    setEmail('')
  }

  const socialLinks = [
    { href: 'https://facebook.com', label: 'Facebook', Icon: IconFacebook },
    { href: 'https://twitter.com', label: 'Twitter', Icon: IconTwitter },
    { href: 'https://instagram.com', label: 'Instagram', Icon: IconInstagram },
    { href: 'https://linkedin.com', label: 'LinkedIn', Icon: IconLinkedin },
  ]

  return (
    <footer className="bg-[#000000] text-white">
      <div className="mx-auto max-w-[1280px] px-4 py-16 xl:px-0">

        {/* 5-column grid */}
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-5 lg:gap-6">

          {/* Col 1 — Exclusive + Subscribe */}
          <div className="col-span-1 flex flex-col gap-5 sm:col-span-2 lg:col-span-1">
            <div>
              <h3 className="text-2xl font-bold">{t('footer.exclusive')}</h3>
              <p className="mt-1.5 text-sm font-medium">{t('footer.tagline')}</p>
            </div>
            <p className="text-sm leading-relaxed text-[#FAFAFA]/70">{t('footer.subscribe_desc')}</p>

            {subscribed ? (
              <p className="text-sm text-[#00FF66]">✓ Subscribed!</p>
            ) : (
              <form onSubmit={handleSubscribe} className="flex items-center overflow-hidden rounded-[4px] border border-[#B3B3B3]/60">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('footer.subscribe_placeholder')}
                  className="flex-1 bg-transparent px-4 py-2.5 text-sm text-white outline-none placeholder:text-[#B3B3B3]"
                />
                <button
                  type="submit"
                  className="flex items-center justify-center px-3 py-2.5 text-white transition-colors hover:text-[#DB4444]"
                  aria-label={t('footer.subscribe_btn')}
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            )}
          </div>

          {/* Col 2 — Support */}
          <div className="flex flex-col gap-5">
            <h3 className="text-xl font-bold">{t('footer.support')}</h3>
            <ul className="flex flex-col gap-3 text-sm leading-relaxed text-[#FAFAFA]/70">
              <li>111 Bijoy sarani, Dhaka, DH 1515, Bangladesh.</li>
              <li>exclusive@gmail.com</li>
              <li>+88015-88888-9999</li>
            </ul>
          </div>

          {/* Col 3 — Account */}
          <div className="flex flex-col gap-5">
            <h3 className="text-xl font-bold">{t('footer.account')}</h3>
            <ul className="flex flex-col gap-3 text-sm">
              {[
                { to: '/profile', label: t('footer.my_account') },
                { to: '/login', label: t('footer.login_register') },
                { to: '/cart', label: t('footer.cart') },
                { to: '/wishlist', label: t('footer.wishlist') },
                { to: '/products', label: t('footer.shop') },
              ].map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="text-[#FAFAFA]/70 transition-colors hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4 — Quick Link */}
          <div className="flex flex-col gap-5">
            <h3 className="text-xl font-bold">{t('footer.quick_link')}</h3>
            <ul className="flex flex-col gap-3 text-sm">
              {[
                { to: '/privacy', label: t('footer.privacy_policy') },
                { to: '/terms', label: t('footer.terms') },
                { to: '/faq', label: t('footer.faq') },
                { to: '/contact', label: t('footer.contact') },
              ].map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="text-[#FAFAFA]/70 transition-colors hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 5 — Social */}
          <div className="flex flex-col gap-5">
            <h3 className="text-xl font-bold">{t('footer.follow_us')}</h3>
            <div className="flex items-center gap-5">
              {socialLinks.map(({ href, label, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white transition-colors hover:text-[#DB4444]"
                  aria-label={label}
                >
                  <Icon />
                </a>
              ))}
            </div>

            {/* App store badges */}
            <div className="mt-2 flex flex-col gap-2">
              <p className="text-xs text-[#FAFAFA]/50 uppercase tracking-wider">{t('footer.download_app')}</p>
              <div className="flex gap-2">
                <div className="flex h-9 items-center gap-2 rounded border border-white/20 px-3 text-xs text-white/70">
                  App Store
                </div>
                <div className="flex h-9 items-center gap-2 rounded border border-white/20 px-3 text-xs text-white/70">
                  Google Play
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-14 border-t border-white/10 pt-7 text-center text-sm text-[#FAFAFA]/40">
          © Copyright Rimel 2022. All rights reserved
        </div>
      </div>
    </footer>
  )
}
