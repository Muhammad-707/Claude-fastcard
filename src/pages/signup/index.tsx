import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Eye, EyeOff, CheckCircle2 } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { registerThunk, clearRegisterError } from '@/features/auth/model/authSlice'
import { Input } from '@/shared/ui/input'
import { Header } from '@/widgets/header'
import { Footer } from '@/widgets/footer'

/* ─── Yup schema ─── */
const registerSchema = Yup.object({
  userName: Yup.string().min(2, 'auth.errors.username_required').required('auth.errors.username_required'),
  email: Yup.string().email('auth.errors.email_invalid').required('auth.errors.email_required'),
  phoneNumber: Yup.string()
    .transform((v: string) => v.trim())
    .test('phone-format', 'auth.errors.phone_invalid', (v) => {
      if (!v) return true
      return /^\+?\d[\d\s\-()]{5,}$/.test(v)
    }),
  password: Yup.string()
    .matches(/^\d+$/, 'auth.errors.password_digits_only')
    .min(6, 'auth.errors.password_digits_min')
    .required('auth.errors.password_required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'auth.errors.passwords_mismatch')
    .required('auth.errors.password_required'),
})

/* ─── Shared field class helper (overrides shadcn Input defaults) ─── */
const fieldCls = (touched: boolean | undefined, error: string | undefined) =>
  `h-12 rounded-[6px] px-4 focus-visible:ring-0 focus-visible:ring-offset-0 ${
    touched && error
      ? 'border-[#DB4444] focus-visible:border-[#DB4444]'
      : 'border-border focus-visible:border-foreground'
  }`

/* ─── Success Screen ─── */
function SuccessScreen() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  return (
    <div className="flex w-full max-w-[400px] flex-col items-center gap-6 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#DB4444]/10">
        <CheckCircle2 className="h-10 w-10 text-[#DB4444]" />
      </div>
      <div>
        <h1 className="text-2xl font-bold text-foreground">{t('auth.register_success_title')}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{t('auth.login_after_register')}</p>
      </div>
      <button
        onClick={() => navigate('/login', { replace: true })}
        className="w-full rounded-[6px] bg-[#DB4444] py-3.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
      >
        {t('auth.go_to_login')}
      </button>
    </div>
  )
}

/* ─── Main Component ─── */
export default function SignUpPage() {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const { registerLoading } = useAppSelector((s) => s.auth)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [done, setDone] = useState(false)

  const formik = useFormik({
    initialValues: {
      userName: '',
      email: '',
      phoneNumber: '',
      password: '',
      confirmPassword: '',
    },
    validationSchema: registerSchema,
    onSubmit: async (values) => {
      const rawPhone = values.phoneNumber?.trim()
      const phone = rawPhone
        ? rawPhone.startsWith('+') ? rawPhone : `+${rawPhone}`
        : undefined
      const result = await dispatch(
        registerThunk({
          userName: values.userName,
          email: values.email,
          phoneNumber: phone,
          password: values.password,
          confirmPassword: values.confirmPassword,
        })
      )

      if (registerThunk.fulfilled.match(result)) {
        dispatch(clearRegisterError())
        toast.success(t('auth.register_success'))
        setDone(true)
      } else {
        const err = result.payload as string
        const errorMap: Record<string, string> = {
          user_exists: t('auth.errors.user_exists'),
          server_error: t('auth.errors.server_error'),
        }
        toast.error(errorMap[err] ?? t('auth.errors.server_error'))
      }
    },
  })

  if (done) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <main className="flex flex-1 items-center justify-center px-4 py-16">
          <SuccessScreen />
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />

      <main className="flex flex-1 items-center justify-center px-4 py-16">
        <div className="w-full max-w-[440px]">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">{t('auth.signup_title')}</h1>
            <p className="mt-2 text-sm text-muted-foreground">{t('auth.signup_subtitle')}</p>
          </div>

          <form onSubmit={formik.handleSubmit} className="space-y-4" noValidate>
            {/* Username */}
            <div className="space-y-1.5">
              <label htmlFor="userName" className="block text-sm font-medium text-foreground">
                {t('auth.username')}
              </label>
              <Input
                id="userName"
                type="text"
                autoComplete="name"
                placeholder={t('auth.name_placeholder')}
                className={fieldCls(formik.touched.userName, formik.errors.userName)}
                {...formik.getFieldProps('userName')}
              />
              {formik.touched.userName && formik.errors.userName && (
                <p className="text-xs text-[#DB4444]">{t(formik.errors.userName)}</p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-sm font-medium text-foreground">
                {t('auth.email_label')}
              </label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder={t('auth.email_placeholder')}
                className={fieldCls(formik.touched.email, formik.errors.email)}
                {...formik.getFieldProps('email')}
              />
              {formik.touched.email && formik.errors.email && (
                <p className="text-xs text-[#DB4444]">{t(formik.errors.email)}</p>
              )}
            </div>

            {/* Phone (optional) */}
            <div className="space-y-1.5">
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-foreground">
                {t('auth.phone')}{' '}
                <span className="text-xs font-normal text-muted-foreground">({t('auth.optional')})</span>
              </label>
              <Input
                id="phoneNumber"
                type="tel"
                autoComplete="tel"
                placeholder={t('auth.phone_placeholder')}
                className={fieldCls(formik.touched.phoneNumber, formik.errors.phoneNumber)}
                {...formik.getFieldProps('phoneNumber')}
              />
              {formik.touched.phoneNumber && formik.errors.phoneNumber && (
                <p className="text-xs text-[#DB4444]">{t(formik.errors.phoneNumber)}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label htmlFor="password" className="block text-sm font-medium text-foreground">
                {t('auth.password')}
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder={t('auth.password_placeholder')}
                  className={`${fieldCls(formik.touched.password, formik.errors.password)} pr-11`}
                  {...formik.getFieldProps('password')}
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Toggle password"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {formik.touched.password && formik.errors.password && (
                <p className="text-xs text-[#DB4444]">{t(formik.errors.password)}</p>
              )}
              <p className="text-[11px] text-muted-foreground">
                {t('auth.password_hint')}
              </p>
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground">
                {t('auth.confirm_password')}
              </label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirm ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder={t('auth.confirm_password')}
                  className={`${fieldCls(formik.touched.confirmPassword, formik.errors.confirmPassword)} pr-11`}
                  {...formik.getFieldProps('confirmPassword')}
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Toggle confirm password"
                >
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {formik.touched.confirmPassword && formik.errors.confirmPassword && (
                <p className="text-xs text-[#DB4444]">{t(formik.errors.confirmPassword)}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={registerLoading}
              className="mt-2 w-full rounded-[6px] bg-[#DB4444] py-3.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {registerLoading ? t('auth.registering') : t('auth.create_account')}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {t('auth.has_account')}{' '}
            <Link
              to="/login"
              className="font-semibold text-foreground underline underline-offset-4 hover:text-[#DB4444] transition-colors"
            >
              {t('auth.log_in')}
            </Link>
          </p>
        </div>
      </main>

      <Footer />
    </div>
  )
}
