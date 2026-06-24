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
import { registerThunk, clearRegisterError } from '@/features/auth/model/authSlice'

const signupSchema = z
  .object({
    userName: z.string().min(1, 'errors.username_required'),
    email: z.string().min(1, 'errors.email_required').email('errors.email_invalid'),
    phoneNumber: z.string().min(1, 'errors.phone_required'),
    password: z.string().min(6, 'errors.password_min'),
    confirmPassword: z.string().min(6, 'errors.password_min'),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'errors.passwords_mismatch',
    path: ['confirmPassword'],
  })

type SignupFormValues = z.infer<typeof signupSchema>

export default function SignUpPage() {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { registerLoading, registerError } = useAppSelector((s) => s.auth)
  const [showPwd, setShowPwd] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
  })

  useEffect(() => {
    if (registerError) {
      toast.error(t(`auth.${registerError}`))
      dispatch(clearRegisterError())
    }
  }, [registerError, t, dispatch])

  const onSubmit = async (data: SignupFormValues) => {
    const result = await dispatch(registerThunk(data))
    if (registerThunk.fulfilled.match(result)) {
      toast.success(t('auth.register_success'))
      navigate('/login', { replace: true })
    }
  }

  return (
    <AuthLayout>
      <div className="space-y-6">
        {/* Heading */}
        <div>
          <h1 className="text-3xl font-medium text-foreground">{t('auth.signup_title')}</h1>
          <p className="mt-2 text-sm text-[#8D8D8D]">{t('auth.signup_subtitle')}</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          {/* Name */}
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

          {/* Email */}
          <div className="flex flex-col gap-1">
            <input
              id="email"
              type="email"
              placeholder={t('auth.email_placeholder')}
              autoComplete="email"
              aria-invalid={!!errors.email}
              className="w-full rounded-[4px] border border-[#C4C4C4] bg-background px-4 py-3 text-sm text-foreground outline-none placeholder:text-[#8D8D8D] focus:border-foreground transition-colors"
              {...register('email')}
            />
            {errors.email && (
              <p className="text-xs text-primary">{t(`auth.${errors.email.message}`)}</p>
            )}
          </div>

          {/* Phone */}
          <div className="flex flex-col gap-1">
            <input
              id="phoneNumber"
              type="tel"
              placeholder={t('auth.phone_placeholder')}
              autoComplete="tel"
              aria-invalid={!!errors.phoneNumber}
              className="w-full rounded-[4px] border border-[#C4C4C4] bg-background px-4 py-3 text-sm text-foreground outline-none placeholder:text-[#8D8D8D] focus:border-foreground transition-colors"
              {...register('phoneNumber')}
            />
            {errors.phoneNumber && (
              <p className="text-xs text-primary">{t(`auth.${errors.phoneNumber.message}`)}</p>
            )}
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1">
            <div className="relative">
              <input
                id="password"
                type={showPwd ? 'text' : 'password'}
                placeholder={t('auth.password_placeholder')}
                autoComplete="new-password"
                aria-invalid={!!errors.password}
                className="w-full rounded-[4px] border border-[#C4C4C4] bg-background px-4 py-3 pr-11 text-sm text-foreground outline-none placeholder:text-[#8D8D8D] focus:border-foreground transition-colors"
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPwd((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8D8D8D] hover:text-foreground transition-colors"
                tabIndex={-1}
                aria-label="Toggle password visibility"
              >
                {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-primary">{t(`auth.${errors.password.message}`)}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div className="flex flex-col gap-1">
            <div className="relative">
              <input
                id="confirmPassword"
                type={showConfirm ? 'text' : 'password'}
                placeholder={t('auth.confirm_password_placeholder')}
                autoComplete="new-password"
                aria-invalid={!!errors.confirmPassword}
                className="w-full rounded-[4px] border border-[#C4C4C4] bg-background px-4 py-3 pr-11 text-sm text-foreground outline-none placeholder:text-[#8D8D8D] focus:border-foreground transition-colors"
                {...register('confirmPassword')}
              />
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8D8D8D] hover:text-foreground transition-colors"
                tabIndex={-1}
                aria-label="Toggle confirm password visibility"
              >
                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-xs text-primary">{t(`auth.${errors.confirmPassword.message}`)}</p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={registerLoading}
            className="mt-2 w-full rounded-[4px] bg-primary px-8 py-3.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {registerLoading ? t('auth.registering') : t('auth.create_account')}
          </button>
        </form>

        {/* Already have account */}
        <p className="text-center text-sm text-foreground">
          {t('auth.has_account')}{' '}
          <Link
            to="/login"
            className="font-medium text-foreground underline underline-offset-4 hover:text-primary transition-colors"
          >
            {t('auth.sign_in')}
          </Link>
        </p>
      </div>
    </AuthLayout>
  )
}
