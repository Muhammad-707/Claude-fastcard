import { lazy, Suspense, type ReactNode } from 'react'
import { BrowserRouter, Navigate, Routes, Route } from 'react-router-dom'
import { Provider } from 'react-redux'
import { ThemeProvider } from 'next-themes'
import { Toaster } from 'sonner'
import { store } from '@/app/store'
import { useAppSelector, useAppDispatch } from '@/app/hooks'
import { logout } from '@/features/auth/model/authSlice'
import '@/i18n'

const SignUpPage = lazy(() => import('@/pages/signup'))
const LoginPage = lazy(() => import('@/pages/login'))
const NotFoundPage = lazy(() => import('@/pages/not-found'))

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="h-8 w-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
    </div>
  )
}

function GuestOnly({ children }: { children: ReactNode }) {
  const token = useAppSelector((s) => s.auth.token)
  if (token) return <Navigate to="/" replace />
  return <>{children}</>
}

function RequireAuth({ children }: { children: ReactNode }) {
  const token = useAppSelector((s) => s.auth.token)
  if (!token) return <Navigate to="/signup" replace />
  return <>{children}</>
}

function HomePlaceholder() {
  const user = useAppSelector((s) => s.auth.user)
  const dispatch = useAppDispatch()
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background text-foreground">
      <h1 className="text-2xl font-bold">Welcome, {user?.name ?? 'User'}!</h1>
      <p className="text-muted-foreground">Home page coming soon.</p>
      <button
        onClick={() => dispatch(logout())}
        className="rounded-lg bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground hover:bg-destructive/90 transition-colors"
      >
        Logout
      </button>
    </div>
  )
}

export default function App() {
  return (
    <Provider store={store}>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
        <BrowserRouter>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Guest-only */}
              <Route
                path="/signup"
                element={
                  <GuestOnly>
                    <SignUpPage />
                  </GuestOnly>
                }
              />
              <Route
                path="/login"
                element={
                  <GuestOnly>
                    <LoginPage />
                  </GuestOnly>
                }
              />

              {/* Protected home */}
              <Route
                path="/"
                element={
                  <RequireAuth>
                    <HomePlaceholder />
                  </RequireAuth>
                }
              />
              {/* 404 — accessible to everyone */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
          <Toaster richColors position="top-right" />
        </BrowserRouter>
      </ThemeProvider>
    </Provider>
  )
}
