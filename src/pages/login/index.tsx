import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import { Eye, EyeOff } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { loginThunk, clearLoginError } from '@/features/auth/model/authSlice'
import { Input } from '@/shared/ui/input'
import { Header } from '@/widgets/header'
import { Footer } from '@/widgets/footer'

const loginSchema = Yup.object({
  userName: Yup.string().required('auth.errors.username_required'),
  password: Yup.string()
    .min(6, 'auth.errors.password_min')
    .required('auth.errors.password_required'),
})

export default function LoginPage() {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { loginLoading, loginError, token } = useAppSelector((s) => s.auth)
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    if (token) navigate('/', { replace: true })
  }, [token, navigate])

  useEffect(() => {
    if (loginError) {
      const errorMap: Record<string, string> = {
        invalid_credentials: t('auth.errors.invalid_credentials'),
        server_error: t('auth.errors.server_error'),
      }
      toast.error(errorMap[loginError] ?? t('auth.errors.server_error'))
      dispatch(clearLoginError())
    }
  }, [loginError, t, dispatch])

  const formik = useFormik({
    initialValues: { userName: '', password: '' },
    validationSchema: loginSchema,
    onSubmit: (values) => {
      void dispatch(loginThunk(values))
    },
  })

  const fieldCls = (name: 'userName' | 'password') =>
    `h-12 rounded-[6px] px-4 focus-visible:ring-0 focus-visible:ring-offset-0 ${
      formik.touched[name] && formik.errors[name]
        ? 'border-[#DB4444] focus-visible:border-[#DB4444]'
        : 'border-border focus-visible:border-foreground'
    }`

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />

      <main className="flex flex-1 items-center justify-center px-4 py-16">
        <div className="w-full max-w-[400px]">
          <h1 className="text-3xl font-bold text-foreground">{t('auth.login_title')}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{t('auth.login_subtitle')}</p>

          <form onSubmit={formik.handleSubmit} className="mt-10 space-y-5" noValidate>
            {/* Username */}
            <div className="space-y-1.5">
              <label htmlFor="userName" className="block text-sm font-medium text-foreground">
                {t('auth.username_label', 'Username')}
              </label>
              <Input
                id="userName"
                type="text"
                autoComplete="username"
                placeholder={t('auth.username_placeholder', 'Enter your username')}
                className={fieldCls('userName')}
                {...formik.getFieldProps('userName')}
              />
              {formik.touched.userName && formik.errors.userName && (
                <p className="text-xs text-[#DB4444]">{t(formik.errors.userName)}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label htmlFor="password" className="block text-sm font-medium text-foreground">
                {t('auth.password_label')}
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder={t('auth.password_placeholder')}
                  className={`${fieldCls('password')} pr-11`}
                  {...formik.getFieldProps('password')}
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {formik.touched.password && formik.errors.password && (
                <p className="text-xs text-[#DB4444]">{t(formik.errors.password)}</p>
              )}
            </div>

            <div className="flex justify-end">
              <button type="button" className="text-sm text-[#DB4444] hover:underline underline-offset-4">
                {t('auth.forgot_password')}
              </button>
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full rounded-[6px] bg-[#DB4444] py-3.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {loginLoading ? t('auth.logging_in') : t('auth.log_in')}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            {t('auth.no_account')}{' '}
            <Link
              to="/signup"
              className="font-semibold text-foreground underline underline-offset-4 hover:text-[#DB4444] transition-colors"
            >
              {t('auth.sign_up')}
            </Link>
          </p>
        </div>
      </main>

      <Footer />
    </div>
  )
}