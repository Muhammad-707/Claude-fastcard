import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Routes, Route, Outlet, useLocation } from 'react-router-dom'
import { Provider } from 'react-redux'
import { ThemeProvider } from 'next-themes'
import { Toaster } from 'sonner'
import { store } from '@/app/store'
import { useAppSelector } from '@/app/hooks'
import { selectIsAuth, selectIsAdmin } from '@/features/auth/model/authSlice'
import { ErrorBoundary } from '@/shared/ui/error-boundary'
import { PageLoader } from '@/shared/ui/page-loader'
import '@/i18n'

const SignUpPage      = lazy(() => import('@/pages/signup'))
const LoginPage       = lazy(() => import('@/pages/login'))
const HomePage        = lazy(() => import('@/pages/home'))
const ProductsPage    = lazy(() => import('@/pages/product-list'))
const ProductDetail   = lazy(() => import('@/pages/product-detail'))
const CartPage        = lazy(() => import('@/pages/cart'))
const WishlistPage    = lazy(() => import('@/pages/wishlist'))
const CheckoutPage    = lazy(() => import('@/pages/checkout'))
const ProfilePage     = lazy(() => import('@/pages/profile'))
const AboutPage       = lazy(() => import('@/pages/about'))
const ContactPage     = lazy(() => import('@/pages/contact'))
const NotFoundPage    = lazy(() => import('@/pages/not-found'))

function GuestOnly() {
  const isAuth = useAppSelector(selectIsAuth)
  return isAuth ? <Navigate to="/" replace /> : <Outlet />
}

function RequireAuth() {
  const isAuth = useAppSelector(selectIsAuth)
  const location = useLocation()
  return isAuth ? <Outlet /> : <Navigate to="/login" state={{ from: location }} replace />
}

function RequireAdmin() {
  const isAdmin = useAppSelector(selectIsAdmin)
  return isAdmin ? <Outlet /> : <Navigate to="/" replace />
}
void RequireAdmin // for future admin routes

export default function App() {
  return (
    <Provider store={store}>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
        <BrowserRouter>
          <ErrorBoundary>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                {/* Guest-only */}
                <Route element={<GuestOnly />}>
                  <Route path="/signup" element={<SignUpPage />} />
                  <Route path="/login" element={<LoginPage />} />
                </Route>

                {/* Public */}
                <Route path="/" element={<HomePage />} />
                <Route path="/products" element={<ProductsPage />} />
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/contact" element={<ContactPage />} />

                {/* Protected */}
                <Route element={<RequireAuth />}>
                  <Route path="/cart" element={<CartPage />} />
                  <Route path="/wishlist" element={<WishlistPage />} />
                  <Route path="/checkout" element={<CheckoutPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                </Route>

                {/* 404 */}
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </Suspense>
          </ErrorBoundary>
          <Toaster richColors position="top-right" />
        </BrowserRouter>
      </ThemeProvider>
    </Provider>
  )
}
