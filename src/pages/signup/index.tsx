import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { registerThunk, clearRegisterError } from '@/features/auth/model/authSlice'
import { Header } from '@/widgets/header'
import { Footer } from '@/widgets/footer'

const schema = z.object({
  userName: z.string().min(1, 'errors.username_required'),
  email: z.string().email('errors.email_invalid').min(1, 'errors.email_required'),
  phoneNumber: z.string().min(6, 'errors.phone_required'),
  password: z.string().min(6, 'errors.password_min'),
})
type FormValues = z.infer<typeof schema>

const inputCls = (hasError: boolean) =>
  `w-full rounded-[4px] border bg-background px-4 py-3.5 text-sm text-foreground outline-none placeholder:text-muted-foreground transition-colors ${
    hasError ? 'border-[#DB4444] focus:border-[#DB4444]' : 'border-border focus:border-foreground'
  }`

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" aria-hidden="true">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  )
}

export default function SignUpPage() {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { registerLoading, registerError } = useAppSelector((s) => s.auth)

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  useEffect(() => {
    if (registerError) {
      const errorMap: Record<string, string> = {
        user_exists: t('auth.errors.user_exists'),
        server_error: t('auth.errors.server_error'),
      }
      toast.error(errorMap[registerError] ?? t('auth.errors.server_error'))
      dispatch(clearRegisterError())
    }
  }, [registerError, t, dispatch])

  const onSubmit = async (data: FormValues) => {
    const result = await dispatch(registerThunk({
      userName: data.userName,
      email: data.email,
      phoneNumber: data.phoneNumber,
      password: data.password,
      confirmPassword: data.password,
    }))
    if (registerThunk.fulfilled.match(result)) {
      toast.success(t('auth.register_success'))
      navigate('/login', { replace: true })
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />

      <main className="flex flex-1 items-center justify-center px-4 py-16">
        <div className="w-full max-w-[371px]">
          <h1 className="text-3xl font-medium text-foreground">{t('auth.signup_title')}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{t('auth.signup_subtitle')}</p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-10 space-y-5" noValidate>
            <div>
              <input
                type="text"
                placeholder={t('auth.name_placeholder')}
                autoComplete="name"
                className={inputCls(!!errors.userName)}
                {...register('userName')}
              />
              {errors.userName && (
                <p className="mt-1 text-xs text-[#DB4444]">{t('auth.errors.username_required')}</p>
              )}
            </div>

            <div>
              <input
                type="email"
                placeholder={t('auth.email_label')}
                autoComplete="email"
                className={inputCls(!!errors.email)}
                {...register('email')}
              />
              {errors.email && (
                <p className="mt-1 text-xs text-[#DB4444]">{t('auth.errors.email_invalid')}</p>
              )}
            </div>

            <div>
              <input
                type="tel"
                placeholder={t('auth.phone')}
                autoComplete="tel"
                className={inputCls(!!errors.phoneNumber)}
                {...register('phoneNumber')}
              />
              {errors.phoneNumber && (
                <p className="mt-1 text-xs text-[#DB4444]">{t('auth.errors.phone_required')}</p>
              )}
            </div>

            <div>
              <input
                type="password"
                placeholder={t('auth.password_placeholder')}
                autoComplete="new-password"
                className={inputCls(!!errors.password)}
                {...register('password')}
              />
              {errors.password && (
                <p className="mt-1 text-xs text-[#DB4444]">{t('auth.errors.password_min')}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={registerLoading}
              className="w-full rounded-[4px] bg-[#DB4444] py-4 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {registerLoading ? t('auth.registering') : t('auth.create_account')}
            </button>

            <button
              type="button"
              className="flex w-full items-center justify-center gap-3 rounded-[4px] border border-border bg-background py-3.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              <GoogleIcon />
              {t('auth.google_signup')}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            {t('auth.has_account')}{' '}
            <Link to="/login" className="font-medium text-foreground underline underline-offset-4 hover:text-[#DB4444] transition-colors">
              {t('auth.log_in')}
            </Link>
          </p>
        </div>
      </main>

      <Footer />
    </div>
  )
}
