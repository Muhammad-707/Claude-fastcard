import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { ChevronDown } from 'lucide-react'

const LANGS = [
  { code: 'ru', label: 'RU' },
  { code: 'en', label: 'EN' },
  { code: 'tj', label: 'TJ' },
] as const

export function LangSwitcher({ compact = false }: { compact?: boolean }) {
  const { i18n } = useTranslation()
  const current = LANGS.find((l) => l.code === i18n.language) ?? LANGS[0]

  const changeLang = (code: string) => {
    void i18n.changeLanguage(code)
    localStorage.setItem('i18nextLng', code)
  }

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          className={cn(
            'flex items-center gap-1 rounded-lg border border-border bg-background px-2.5 py-1.5 text-sm font-semibold tracking-wide text-foreground transition-colors hover:bg-accent focus:outline-none',
            compact && 'px-2 py-1 text-xs'
          )}
        >
          <span className="uppercase">{current.label}</span>
          <ChevronDown className="h-3 w-3 text-muted-foreground" />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={6}
          className="z-50 min-w-[72px] overflow-hidden rounded-lg border border-border bg-popover p-1 shadow-lg text-popover-foreground"
        >
          {LANGS.map((lang) => (
            <DropdownMenu.Item
              key={lang.code}
              onSelect={() => changeLang(lang.code)}
              className={cn(
                'flex cursor-pointer items-center justify-center rounded-md px-3 py-2 text-sm font-semibold tracking-wide outline-none transition-colors hover:bg-accent hover:text-accent-foreground',
                lang.code === i18n.language && 'bg-primary/10 text-primary'
              )}
            >
              {lang.label}
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}
