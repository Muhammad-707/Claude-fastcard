import { forwardRef, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { loginThunk, clearLoginError } from '@/features/auth/model/authSlice'
import { Header } from '@/widgets/header'
import { Footer } from '@/widgets/footer'

const schema = z.object({
  userName: z.string().min(1, 'errors.username_required'),
  password: z.string().min(6, 'errors.password_min'),
})
type FormValues = z.infer<typeof schema>

interface FloatingInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string
  label: string
  hasError?: boolean
  showToggle?: boolean
  onToggle?: () => void
  showValue?: boolean
}

const FloatingInput = forwardRef<HTMLInputElement, FloatingInputProps>(function FloatingInput(
  { id, label, type = 'text', hasError, showToggle, onToggle, showValue, ...props },
  ref
) {
  return (
    <div className={`relative rounded-[4px] border bg-background transition-colors focus-within:border-foreground ${hasError ? 'border-[#DB4444]' : 'border-border'}`}>
      <label htmlFor={id} className="absolute left-3 top-1.5 pointer-events-none text-[10px] leading-none text-muted-foreground">
        {label}
      </label>
      <input
        ref={ref}
        id={id}
        type={showToggle ? (showValue ? 'text' : 'password') : type}
        className="block w-full bg-transparent pb-3 pl-3 pr-10 pt-5 text-sm text-foreground outline-none"
        {...props}
      />
      {showToggle && (
        <button
          type="button"
          onClick={onToggle}
          tabIndex={-1}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Toggle password visibility"
        >
          {showValue ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      )}
    </div>
  )
})

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

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />

      <main className="flex flex-1 items-center justify-center px-4 py-16">
        <div className="w-full max-w-[371px]">
          <h1 className="text-3xl font-medium text-foreground">{t('auth.login_title')}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{t('auth.login_subtitle')}</p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-10 space-y-5" noValidate>
            <div>
              <FloatingInput
                id="userName"
                label={t('auth.email_phone_label')}
                type="text"
                autoComplete="username"
                hasError={!!errors.userName}
                {...register('userName')}
              />
              {errors.userName && (
                <p className="mt-1 text-xs text-[#DB4444]">{t('auth.errors.username_required')}</p>
              )}
            </div>

            <div>
              <FloatingInput
                id="password"
                label={t('auth.password_label')}
                hasError={!!errors.password}
                showToggle
                onToggle={() => setShowPassword((v) => !v)}
                showValue={showPassword}
                autoComplete="current-password"
                {...register('password')}
              />
              {errors.password && (
                <p className="mt-1 text-xs text-[#DB4444]">{t('auth.errors.password_min')}</p>
              )}
            </div>

            <div className="text-center">
              <button type="button" className="text-sm text-[#DB4444] hover:underline underline-offset-4">
                {t('auth.forgot_password')}
              </button>
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full rounded-[4px] bg-[#DB4444] py-4 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {loginLoading ? t('auth.logging_in') : t('auth.log_in')}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            {t('auth.no_account')}{' '}
            <Link to="/signup" className="font-medium text-foreground underline underline-offset-4 hover:text-[#DB4444] transition-colors">
              {t('auth.sign_up')}
            </Link>
          </p>
        </div>
      </main>

      <Footer />
    </div>
  )
}
