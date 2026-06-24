import type { ReactNode } from 'react'
import { Header } from '@/widgets/header'
import { Footer } from '@/widgets/footer'

interface AuthLayoutProps {
  children: ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex flex-1 items-center justify-center px-4 py-12 sm:py-16">
        <div className="w-full max-w-[428px]">{children}</div>
      </main>
      <Footer />
    </div>
  )
}
