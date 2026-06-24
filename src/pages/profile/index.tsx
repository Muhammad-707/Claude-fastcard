import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { fetchProfile, updateProfile } from '@/features/profile/model/profileSlice'
import { logout, selectUserId } from '@/features/auth/model/authSlice'
import { NetworkError } from '@/shared/ui/network-error'
import { Header } from '@/widgets/header'
import { Footer } from '@/widgets/footer'

const schema = z.object({
  firstName: z.string().min(1, 'required'),
  lastName: z.string().min(1, 'required'),
  email: z.string().email('errors.email_invalid'),
  streetAddress: z.string().optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().optional(),
  confirmNewPassword: z.string().optional(),
})
type ProfileFormValues = z.infer<typeof schema>

const SIDEBAR = [
  {
    heading: 'profile.manage_account',
    links: [
      { key: 'profile.my_profile', to: '/profile' },
      { key: 'profile.address_book', to: '/profile/address' },
      { key: 'profile.payment_options', to: '/profile/payment' },
    ],
  },
  {
    heading: 'profile.my_orders',
    links: [
      { key: 'profile.my_returns', to: '/profile/returns' },
      { key: 'profile.my_cancellations', to: '/profile/cancellations' },
    ],
  },
]

function FloatingInput({
  id,
  label,
  type = 'text',
  className = '',
  ...props
}: {
  id: string
  label: string
  type?: string
  className?: string
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className={`relative rounded-[4px] border border-border bg-background transition-colors focus-within:border-foreground ${className}`}>
      <label htmlFor={id} className="absolute left-3 top-1.5 pointer-events-none text-[10px] leading-none text-muted-foreground">
        {label}
      </label>
      <input
        id={id}
        type={type}
        className="block w-full bg-transparent pb-3 pl-3 pr-3 pt-5 text-sm text-foreground outline-none"
        {...props}
      />
    </div>
  )
}

export default function ProfilePage() {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const location = useLocation()
  const userId = useAppSelector(selectUserId)
  const { data: profile, status, updateStatus } = useAppSelector((s) => s.profile)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [_avatarFile, setAvatarFile] = useState<File | null>(null)

  const { register, handleSubmit, reset } = useForm<ProfileFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { firstName: '', lastName: '', email: '', streetAddress: '' },
  })

  useEffect(() => {
    if (userId) dispatch(fetchProfile(userId))
  }, [dispatch, userId])

  useEffect(() => {
    if (profile) {
      reset({
        firstName: profile.firstName ?? '',
        lastName: profile.lastName ?? '',
        email: profile.email ?? '',
        streetAddress: '',
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: '',
      })
    }
  }, [profile, reset])

  useEffect(() => {
    if (updateStatus === 'success') {
      toast.success(t('profile.save_success'))
      if (userId) dispatch(fetchProfile(userId))
    }
    if (updateStatus === 'error') toast.error(t('profile.save_error'))
  }, [updateStatus, t, dispatch, userId])

  const onSubmit = (data: ProfileFormValues) => {
    const formData = new FormData()
    formData.append('FirstName', data.firstName)
    formData.append('LastName', data.lastName)
    formData.append('Email', data.email)
    formData.append('PhoneNumber', profile?.phoneNumber ?? '')
    if (fileInputRef.current?.files?.[0]) {
      formData.append('Image', fileInputRef.current.files[0])
    }
    dispatch(updateProfile(formData))
  }

  const handleLogout = () => { dispatch(logout()) }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />

      <main className="flex-1">
        {/* Breadcrumb */}
        <div className="mx-auto w-full max-w-[1170px] px-4 py-5 xl:px-0">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link to="/" className="transition-colors hover:text-foreground">{t('nav.home')}</Link>
            <span>/</span>
            <span className="text-foreground">{t('profile.my_account')}</span>
          </nav>
        </div>

        <div className="mx-auto max-w-[1170px] px-4 pb-16 xl:px-0">
          <div className="flex flex-col gap-10 lg:flex-row">

            {/* ── Sidebar (text-only, no icons) ── */}
            <aside className="w-full shrink-0 lg:w-[220px]">
              {SIDEBAR.map((section) => (
                <div key={section.heading} className="mb-6">
                  <p className="mb-3 text-sm font-semibold text-foreground">{t(section.heading)}</p>
                  <ul className="space-y-1">
                    {section.links.map((link) => {
                      const isActive = location.pathname === link.to
                      return (
                        <li key={link.key}>
                          <Link
                            to={link.to}
                            className={`block pl-4 py-1 text-sm transition-colors ${
                              isActive ? 'text-[#DB4444] font-medium' : 'text-muted-foreground hover:text-foreground'
                            }`}
                          >
                            {t(link.key)}
                          </Link>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              ))}

              <div>
                <Link
                  to="/wishlist"
                  className="block text-sm font-semibold text-foreground transition-colors hover:text-[#DB4444]"
                >
                  {t('profile.my_wishlist')}
                </Link>
              </div>

              <button
                onClick={handleLogout}
                className="mt-8 block text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {t('auth.logout')}
              </button>
            </aside>

            {/* ── Profile form card ── */}
            <div className="flex-1">
              {status === 'loading' && (
                <div className="animate-pulse space-y-4 rounded-[4px] border border-border p-8">
                  {[1, 2, 3, 4, 5].map((i) => <div key={i} className="h-12 rounded bg-muted" />)}
                </div>
              )}

              {status === 'error' && (
                <NetworkError onRetry={() => userId && dispatch(fetchProfile(userId))} />
              )}

              {(status === 'success' || status === 'idle') && (
                <div className="rounded-[4px] border border-border p-8 shadow-sm">
                  <h1 className="mb-8 text-xl font-semibold text-[#DB4444]">
                    {t('profile.profile_title')}
                  </h1>

                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { if (e.target.files?.[0]) setAvatarFile(e.target.files[0]) }} />

                  <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
                    {/* Row 1: First name + Last name */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <FloatingInput
                        id="firstName"
                        label={t('profile.first_name')}
                        {...register('firstName')}
                      />
                      <FloatingInput
                        id="lastName"
                        label={t('profile.last_name')}
                        {...register('lastName')}
                      />
                    </div>

                    {/* Row 2: Email + Street address */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <FloatingInput
                        id="email"
                        label={t('profile.email_address')}
                        type="email"
                        {...register('email')}
                      />
                      <FloatingInput
                        id="streetAddress"
                        label={t('profile.street_address')}
                        {...register('streetAddress')}
                      />
                    </div>

                    {/* Password Changes */}
                    <div>
                      <h2 className="mb-4 text-sm font-medium text-foreground">{t('profile.password_changes')}</h2>

                      <div className="space-y-4">
                        <input
                          type="password"
                          placeholder={t('profile.current_password')}
                          className="w-full rounded-[4px] border border-border bg-background px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-foreground"
                          {...register('currentPassword')}
                        />
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <input
                            type="password"
                            placeholder={t('profile.new_password')}
                            className="w-full rounded-[4px] border border-border bg-background px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-foreground"
                            {...register('newPassword')}
                          />
                          <input
                            type="password"
                            placeholder={t('profile.confirm_new_password')}
                            className="w-full rounded-[4px] border border-border bg-background px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-foreground"
                            {...register('confirmNewPassword')}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-4 pt-2">
                      <button
                        type="button"
                        onClick={() => profile && reset({
                          firstName: profile.firstName ?? '',
                          lastName: profile.lastName ?? '',
                          email: profile.email ?? '',
                          streetAddress: '',
                          currentPassword: '',
                          newPassword: '',
                          confirmNewPassword: '',
                        })}
                        className="rounded-[4px] px-8 py-3 text-sm font-medium text-foreground transition-colors hover:text-muted-foreground"
                      >
                        {t('profile.cancel')}
                      </button>
                      <button
                        type="submit"
                        disabled={updateStatus === 'loading'}
                        className="rounded-[4px] bg-[#DB4444] px-8 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
                      >
                        {updateStatus === 'loading' ? '...' : t('profile.save_changes')}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
