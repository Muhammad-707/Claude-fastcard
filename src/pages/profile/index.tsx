import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ChevronRight, User, Package, Heart, MapPin, LogOut, Camera } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { fetchProfile, updateProfile } from '@/features/profile/model/profileSlice'
import { logout, selectUserId } from '@/features/auth/model/authSlice'
import { NetworkError } from '@/shared/ui/network-error'
import { Header } from '@/widgets/header'
import { Footer } from '@/widgets/footer'
import { getImageUrl } from '@/shared/lib/image'

const profileSchema = z.object({
  firstName: z.string().min(1, 'required'),
  lastName: z.string().min(1, 'required'),
  email: z.string().email('errors.email_invalid'),
  phoneNumber: z.string().min(6, 'required'),
  dob: z.string().optional(),
})
type ProfileFormValues = z.infer<typeof profileSchema>

const NAV = [
  { icon: <User className="h-4 w-4" />, key: 'profile.my_profile', to: '/profile' },
  { icon: <MapPin className="h-4 w-4" />, key: 'profile.address_book', to: '/profile/address' },
  { icon: <Package className="h-4 w-4" />, key: 'profile.my_orders', to: '/profile/orders' },
  { icon: <Heart className="h-4 w-4" />, key: 'wishlist.title', to: '/wishlist' },
]

export default function ProfilePage() {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const userId = useAppSelector(selectUserId)
  const { data: profile, status, updateStatus } = useAppSelector((s) => s.profile)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      dob: '',
    },
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
        phoneNumber: profile.phoneNumber ?? '',
        dob: profile.dob ?? '',
      })
    }
  }, [profile, reset])

  useEffect(() => {
    if (updateStatus === 'success') {
      toast.success(t('profile.save_success'))
      if (userId) dispatch(fetchProfile(userId))
    }
    if (updateStatus === 'error') {
      toast.error(t('profile.save_error'))
    }
  }, [updateStatus, t, dispatch, userId])

  const onSubmit = (data: ProfileFormValues) => {
    const formData = new FormData()
    formData.append('FirstName', data.firstName)
    formData.append('LastName', data.lastName)
    formData.append('Email', data.email)
    formData.append('PhoneNumber', data.phoneNumber)
    if (data.dob) formData.append('Dob', data.dob)
    if (fileInputRef.current?.files?.[0]) {
      formData.append('Image', fileInputRef.current.files[0])
    }
    dispatch(updateProfile(formData))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setAvatarPreview(url)
    }
  }

  const handleLogout = () => {
    dispatch(logout())
  }

  const inputClass = (hasError: boolean) =>
    `w-full rounded-[4px] border bg-[#F5F5F5] px-4 py-3 text-sm text-foreground outline-none placeholder:text-[#8D8D8D] transition-colors focus:border-primary ${
      hasError ? 'border-primary' : 'border-transparent'
    }`

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />

      <main className="flex-1">
        {/* ── Breadcrumb ── */}
        <div className="mx-auto w-full max-w-[1170px] px-4 py-5 xl:px-0">
          <nav className="flex items-center gap-2 text-sm text-[#8D8D8D]">
            <Link to="/" className="transition-colors hover:text-foreground">
              {t('nav.home')}
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground">{t('profile.title')}</span>
          </nav>
        </div>

        <div className="mx-auto max-w-[1170px] px-4 pb-16 xl:px-0">
          <div className="flex flex-col gap-8 lg:flex-row">

            {/* ── Sidebar ── */}
            <aside className="w-full shrink-0 lg:w-[250px]">
              <div className="rounded-[4px] border border-[#EBEBEB] p-5">
                <div className="mb-6">
                  <p className="text-xs font-medium uppercase tracking-wider text-[#8D8D8D]">
                    Manage My Account
                  </p>
                  <ul className="mt-3 space-y-1">
                    {NAV.map((item) => (
                      <li key={item.key}>
                        <Link
                          to={item.to}
                          className="flex items-center gap-3 rounded-[4px] px-3 py-2.5 text-sm transition-colors hover:bg-[#F5F5F5] hover:text-primary"
                        >
                          {item.icon}
                          {t(item.key)}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="border-t border-[#EBEBEB] pt-4">
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-[4px] px-3 py-2.5 text-sm text-[#8D8D8D] transition-colors hover:bg-[#F5F5F5] hover:text-primary"
                  >
                    <LogOut className="h-4 w-4" />
                    {t('auth.logout')}
                  </button>
                </div>
              </div>
            </aside>

            {/* ── Main content ── */}
            <div className="flex-1">
              {status === 'loading' && (
                <div className="animate-pulse space-y-4">
                  <div className="h-8 w-48 rounded bg-[#F5F5F5]" />
                  <div className="h-24 w-24 rounded-full bg-[#F5F5F5]" />
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-12 rounded bg-[#F5F5F5]" />
                  ))}
                </div>
              )}

              {status === 'error' && (
                <NetworkError onRetry={() => userId && dispatch(fetchProfile(userId))} />
              )}

              {(status === 'success' || status === 'idle') && (
                <div className="rounded-[4px] border border-[#EBEBEB] p-8">
                  <h1 className="mb-8 text-xl font-semibold text-primary">
                    {t('profile.edit_profile')}
                  </h1>

                  {/* Avatar */}
                  <div className="mb-8 flex items-center gap-6">
                    <div className="relative">
                      <div className="h-24 w-24 overflow-hidden rounded-full bg-[#F5F5F5]">
                        {avatarPreview ? (
                          <img
                            src={avatarPreview}
                            alt="Avatar"
                            className="h-full w-full object-cover"
                          />
                        ) : profile?.image ? (
                          <img
                            src={getImageUrl(profile.image)}
                            alt="Avatar"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-[#8D8D8D]">
                            <User className="h-12 w-12" />
                          </div>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white shadow transition-opacity hover:opacity-90"
                        aria-label={t('profile.change_photo')}
                      >
                        <Camera className="h-4 w-4" />
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileChange}
                      />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {profile?.firstName} {profile?.lastName}
                      </p>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="mt-1 text-sm text-primary underline underline-offset-4 hover:opacity-80"
                      >
                        {t('profile.change_photo')}
                      </button>
                    </div>
                  </div>

                  {/* Form */}
                  <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className="mb-1.5 block text-sm font-medium text-foreground">
                          {t('profile.first_name')}
                        </label>
                        <input
                          {...register('firstName')}
                          className={inputClass(!!errors.firstName)}
                        />
                      </div>
                      <div>
                        <label className="mb-1.5 block text-sm font-medium text-foreground">
                          {t('profile.last_name')}
                        </label>
                        <input
                          {...register('lastName')}
                          className={inputClass(!!errors.lastName)}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className="mb-1.5 block text-sm font-medium text-foreground">
                          {t('profile.email')}
                        </label>
                        <input
                          {...register('email')}
                          type="email"
                          className={inputClass(!!errors.email)}
                        />
                        {errors.email && (
                          <p className="mt-1 text-xs text-primary">{t(errors.email.message ?? 'errors.email_invalid')}</p>
                        )}
                      </div>
                      <div>
                        <label className="mb-1.5 block text-sm font-medium text-foreground">
                          {t('profile.phone')}
                        </label>
                        <input
                          {...register('phoneNumber')}
                          type="tel"
                          className={inputClass(!!errors.phoneNumber)}
                        />
                      </div>
                    </div>

                    <div className="sm:w-1/2">
                      <label className="mb-1.5 block text-sm font-medium text-foreground">
                        {t('profile.dob')}
                      </label>
                      <input
                        {...register('dob')}
                        type="date"
                        className={inputClass(!!errors.dob)}
                      />
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => profile && reset({
                          firstName: profile.firstName,
                          lastName: profile.lastName,
                          email: profile.email,
                          phoneNumber: profile.phoneNumber,
                          dob: profile.dob,
                        })}
                        className="rounded-[4px] border border-[#C4C4C4] px-8 py-3 text-sm font-medium text-foreground transition-colors hover:border-primary hover:text-primary"
                      >
                        {t('profile.cancel')}
                      </button>
                      <button
                        type="submit"
                        disabled={updateStatus === 'loading'}
                        className="rounded-[4px] bg-primary px-8 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
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
