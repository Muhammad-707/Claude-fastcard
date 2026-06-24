import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { CheckCircle2, Eye, EyeOff, ShoppingCart } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { registerThunk, clearRegisterError } from '@/features/auth/model/authSlice'
import { Header } from '@/widgets/header'
import { Footer } from '@/widgets/footer'

const schema = z.object({
  userName: z.string().min(2, 'auth.errors.username_required'),
  email: z.string().email('auth.errors.email_invalid'),
  phoneNumber: z
    .string()
    .min(6, 'auth.errors.phone_required')
    .regex(/^\+?\d[\d\s\-()]{5,}$/, 'auth.errors.phone_required'),
  password: z
    .string()
    .min(8, 'auth.errors.password_min')
    .regex(/[A-Z]/, 'auth.errors.password_uppercase')
    .regex(/[!@#$%^&*(),.?":{}|<>]/, 'auth.errors.password_special'),
  confirmPassword: z.string().min(1, 'auth.errors.password_required'),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'auth.errors.passwords_mismatch',
  path: ['confirmPassword'],
})

type FormValues = z.infer<typeof schema>

const inputCls = (hasError: boolean) =>
  `w-full rounded-[4px] border bg-background px-4 py-3.5 text-sm text-foreground outline-none placeholder:text-muted-foreground transition-colors ${
    hasError ? 'border-[#DB4444] focus:border-[#DB4444]' : 'border-border focus:border-foreground'
  }`

function SuccessScreen({ email }: { email: string }) {
  const { t } = useTranslation()
  const navigate = useNavigate()

  return (
    <div className="flex w-full max-w-[400px] flex-col items-center gap-6 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#DB4444]/10">
        <CheckCircle2 className="h-10 w-10 text-[#DB4444]" />
      </div>
      <div>
        <h1 className="text-2xl font-bold text-foreground">{t('auth.register_success_title')}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {t('auth.register_success_desc', { email })}
        </p>
      </div>
      <div className="w-full rounded-xl border border-border bg-muted/50 p-5">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {t('auth.registered_as')}
        </p>
        <p className="mt-1 text-sm font-semibold text-foreground">{email}</p>
      </div>
      <button
        onClick={() => navigate('/login', { replace: true })}
        className="w-full rounded-[4px] bg-[#DB4444] py-4 text-sm font-semibold text-white transition-opacity hover:opacity-90"
      >
        {t('auth.go_to_login')}
      </button>
      <p className="text-xs text-muted-foreground">
        {t('auth.login_after_register')}
      </p>
    </div>
  )
}

export default function SignUpPage() {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const { registerLoading } = useAppSelector((s) => s.auth)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [registeredEmail, setRegisteredEmail] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  const getErrorMsg = (key: string | undefined) => {
    if (!key) return null
    return t(key) ?? key
  }

  const onSubmit = async (data: FormValues) => {
    const result = await dispatch(registerThunk({
      userName: data.userName,
      email: data.email,
      phoneNumber: data.phoneNumber.startsWith('+') ? data.phoneNumber : `+${data.phoneNumber}`,
      password: data.password,
      confirmPassword: data.confirmPassword,
    }))

    if (registerThunk.fulfilled.match(result)) {
      setRegisteredEmail(data.email)
      dispatch(clearRegisterError())
    } else {
      const err = result.payload as string
      const errorMap: Record<string, string> = {
        user_exists: t('auth.errors.user_exists'),
        server_error: t('auth.errors.server_error'),
      }
      toast.error(errorMap[err] ?? t('auth.errors.server_error'))
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />

      <main className="flex flex-1 items-center justify-center px-4 py-16">
        {registeredEmail ? (
          <SuccessScreen email={registeredEmail} />
        ) : (
          <div className="flex w-full max-w-[440px] flex-col gap-8">
            {/* Logo + heading */}
            <div className="flex flex-col items-center gap-3 text-center sm:items-start sm:text-left">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#DB4444]">
                  <ShoppingCart className="h-4 w-4 text-white" />
                </div>
                <span className="text-xl font-bold italic text-foreground">Exclusive</span>
              </div>
              <h1 className="text-3xl font-bold text-foreground">{t('auth.signup_title')}</h1>
              <p className="text-sm text-muted-foreground">{t('auth.signup_subtitle')}</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
              {/* Username */}
              <div>
                <input
                  type="text"
                  placeholder={t('auth.name_placeholder')}
                  autoComplete="name"
                  className={inputCls(!!errors.userName)}
                  {...register('userName')}
                />
                {errors.userName && (
                  <p className="mt-1 text-xs text-[#DB4444]">{getErrorMsg(errors.userName.message)}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <input
                  type="email"
                  placeholder={t('auth.email_label')}
                  autoComplete="email"
                  className={inputCls(!!errors.email)}
                  {...register('email')}
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-[#DB4444]">{getErrorMsg(errors.email.message)}</p>
                )}
              </div>

              {/* Phone */}
              <div>
                <input
                  type="tel"
                  placeholder={t('auth.phone_placeholder') + ' (e.g. +992xxxxxxxxx)'}
                  autoComplete="tel"
                  className={inputCls(!!errors.phoneNumber)}
                  {...register('phoneNumber')}
                />
                {errors.phoneNumber && (
                  <p className="mt-1 text-xs text-[#DB4444]">{t('auth.errors.phone_required')}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder={t('auth.password_placeholder')}
                    autoComplete="new-password"
                    className={`${inputCls(!!errors.password)} pr-11`}
                    {...register('password')}
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label="Toggle password"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-xs text-[#DB4444]">{t('auth.errors.password_min')}</p>
                )}
                <p className="mt-1 text-[10px] text-muted-foreground">
                  Min 8 chars, uppercase letter and special character required
                </p>
              </div>

              {/* Confirm Password */}
              <div>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder={t('auth.confirm_password')}
                    autoComplete="new-password"
                    className={`${inputCls(!!errors.confirmPassword)} pr-11`}
                    {...register('confirmPassword')}
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowConfirmPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label="Toggle confirm password"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-xs text-[#DB4444]">{t('auth.errors.passwords_mismatch')}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={registerLoading}
                className="w-full rounded-[4px] bg-[#DB4444] py-4 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
              >
                {registerLoading ? t('auth.registering') : t('auth.create_account')}
              </button>
            </form>

            <p className="text-center text-sm text-muted-foreground">
              {t('auth.has_account')}{' '}
              <Link
                to="/login"
                className="font-semibold text-foreground underline underline-offset-4 hover:text-[#DB4444] transition-colors"
              >
                {t('auth.log_in')}
              </Link>
            </p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
