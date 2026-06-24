import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { AuthLayout } from '@/shared/ui/auth-layout'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { loginThunk, clearLoginError } from '@/features/auth/model/authSlice'

const schema = z.object({
  userName: z.string().min(1, 'errors.username_required'),
  password: z.string().min(6, 'errors.password_min'),
})

type FormValues = z.infer<typeof schema>

function FieldError({ msg }: { msg: string | undefined }) {
  if (!msg) return null
  return <p className="mt-1 text-xs text-[#DB4444]">{msg}</p>
}

export default function LoginPage() {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { loginLoading, loginError, token } = useAppSelector((s) => s.auth)
  const [showPassword, setShowPassword] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

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

  const onSubmit = (data: FormValues) => {
    dispatch(loginThunk(data))
  }

  const inputCls = (hasError: boolean) =>
    `w-full rounded-[4px] border bg-background px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground transition-colors ${
      hasError ? 'border-[#DB4444] focus:border-[#DB4444]' : 'border-border focus:border-foreground'
    }`

  return (
    <AuthLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-semibold text-foreground">{t('auth.welcome_back')}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{t('auth.login_subtitle')}</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div>
            <input
              type="text"
              placeholder={t('auth.username_placeholder')}
              autoComplete="username"
              aria-invalid={!!errors.userName}
              className={inputCls(!!errors.userName)}
              {...register('userName')}
            />
            <FieldError msg={errors.userName ? t(`auth.${errors.userName.message}`) : undefined} />
          </div>

          <div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder={t('auth.password_placeholder')}
                autoComplete="current-password"
                aria-invalid={!!errors.password}
                className={inputCls(!!errors.password) + ' pr-11'}
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                tabIndex={-1}
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <FieldError msg={errors.password ? t(`auth.${errors.password.message}`) : undefined} />
          </div>

          <div className="flex justify-end">
            <button type="button" className="text-sm text-[#DB4444] hover:underline underline-offset-4">
              {t('auth.forgot_password')}
            </button>
          </div>

          <button
            type="submit"
            disabled={loginLoading}
            className="w-full rounded-[4px] bg-[#DB4444] py-3.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {loginLoading ? t('auth.logging_in') : t('auth.log_in')}
          </button>
        </form>

        {/* Divider */}
        <div className="relative flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs text-muted-foreground">OR</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        {/* Google button */}
        <button
          type="button"
          className="flex w-full items-center justify-center gap-3 rounded-[4px] border border-border bg-background py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          {t('auth.google_login')}
        </button>

        <p className="text-center text-sm text-muted-foreground">
          {t('auth.no_account')}{' '}
          <Link to="/signup" className="font-semibold text-foreground underline underline-offset-4 hover:text-[#DB4444] transition-colors">
            {t('auth.sign_up')}
          </Link>
        </p>
      </div>
    </AuthLayout>
  )
}
