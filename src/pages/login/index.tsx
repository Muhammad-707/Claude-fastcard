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

const loginSchema = z.object({
  userName: z.string().min(1, 'errors.username_required'),
  password: z.string().min(6, 'errors.password_min'),
})

type LoginFormValues = z.infer<typeof loginSchema>

export default function LoginPage() {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { loginLoading, loginError, token } = useAppSelector((s) => s.auth)
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  })

  useEffect(() => {
    if (token) navigate('/', { replace: true })
  }, [token, navigate])

  useEffect(() => {
    if (loginError) {
      const knownKeys = ['invalid_credentials', 'server_error']
      const key = knownKeys.includes(loginError) ? loginError : 'server_error'
      toast.error(t(`auth.errors.${key}`))
      dispatch(clearLoginError())
    }
  }, [loginError, t, dispatch])

  const onSubmit = (data: LoginFormValues) => {
    dispatch(loginThunk(data))
  }

  return (
    <AuthLayout>
      <div className="space-y-6">
        {/* Heading */}
        <div>
          <h1 className="text-3xl font-medium text-foreground">{t('auth.welcome_back')}</h1>
          <p className="mt-2 text-sm text-[#8D8D8D]">{t('auth.login_subtitle')}</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          {/* Username */}
          <div className="flex flex-col gap-1">
            <input
              id="userName"
              type="text"
              placeholder={t('auth.username_placeholder')}
              autoComplete="username"
              aria-invalid={!!errors.userName}
              className="w-full rounded-[4px] border border-[#C4C4C4] bg-background px-4 py-3 text-sm text-foreground outline-none placeholder:text-[#8D8D8D] focus:border-foreground transition-colors"
              {...register('userName')}
            />
            {errors.userName && (
              <p className="text-xs text-primary">{t(`auth.${errors.userName.message}`)}</p>
            )}
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1">
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder={t('auth.password_placeholder')}
                autoComplete="current-password"
                aria-invalid={!!errors.password}
                className="w-full rounded-[4px] border border-[#C4C4C4] bg-background px-4 py-3 pr-11 text-sm text-foreground outline-none placeholder:text-[#8D8D8D] focus:border-foreground transition-colors"
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8D8D8D] hover:text-foreground transition-colors"
                tabIndex={-1}
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-primary">{t(`auth.${errors.password.message}`)}</p>
            )}
          </div>

          {/* Forgot password row */}
          <div className="flex justify-end">
            <Link
              to="/forgot-password"
              className="text-sm text-primary hover:underline underline-offset-4"
            >
              {t('auth.forgot_password')}
            </Link>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loginLoading}
            className="w-full rounded-[4px] bg-primary px-8 py-3.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {loginLoading ? t('auth.logging_in') : t('auth.log_in')}
          </button>
        </form>

        {/* No account */}
        <p className="text-center text-sm text-foreground">
          {t('auth.no_account')}{' '}
          <Link
            to="/signup"
            className="font-medium text-foreground underline underline-offset-4 hover:text-primary transition-colors"
          >
            {t('auth.sign_up')}
          </Link>
        </p>
      </div>
    </AuthLayout>
  )
}
