import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Camera, ChevronRight, Eye, EyeOff } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import {
  fetchProfile,
  updateProfile,
  resetUpdateStatus,
} from '@/features/profile/model/profileSlice'
import { logout, selectUserId, selectAuthUser } from '@/features/auth/model/authSlice'
import { NetworkError } from '@/shared/ui/network-error'
import { Header } from '@/widgets/header'
import { Footer } from '@/widgets/footer'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/ui/form'

const schema = z.object({
  firstName: z.string().min(1, 'required'),
  lastName: z.string().min(1, 'required'),
  email: z.string().email('errors.email_invalid'),
  phoneNumber: z.string().optional(),
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

const LS_AVATAR_KEY = 'user_avatar'

// Minimal 1×1 transparent PNG — used as server placeholder when no real image exists.
// The PUT endpoint marks Image as [Required] in the .NET model, so we must always send a file.
const PLACEHOLDER_PNG_B64 =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='

function dataUrlToBlob(dataUrl: string): Blob {
  const [header, b64] = dataUrl.split(',')
  const mime = header.match(/:(.*?);/)?.[1] ?? 'image/png'
  const raw = atob(b64)
  const arr = new Uint8Array(raw.length)
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i)
  return new Blob([arr], { type: mime })
}

function placeholderBlob(): Blob {
  return dataUrlToBlob(`data:image/png;base64,${PLACEHOLDER_PNG_B64}`)
}

export default function ProfilePage() {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const location = useLocation()
  const userId = useAppSelector(selectUserId)
  const authUser = useAppSelector(selectAuthUser)
  const { data: profile, status, updateStatus } = useAppSelector((s) => s.profile)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  // Initialize from localStorage immediately so the avatar persists across page refreshes
  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    () => localStorage.getItem(LS_AVATAR_KEY),
  )
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: '',
    },
  })

  const { reset } = form

  // Fetch on mount whenever we have a user id
  useEffect(() => {
    if (userId) dispatch(fetchProfile(userId))
  }, [dispatch, userId])

  // Populate form once server data arrives.
  // Falls back to the JWT claims (authUser.name / authUser.email) if the
  // profile table was never populated (e.g. user registered without first/last name).
  useEffect(() => {
    if (status !== 'success') return

    reset({
      firstName: profile?.firstName || '',
      lastName: profile?.lastName || '',
      email: profile?.email || authUser?.email || '',
      phoneNumber: profile?.phoneNumber || '',
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: '',
    })
  }, [status, profile, authUser, reset])

  // Toast after save & re-fetch so the form refreshes
  useEffect(() => {
    if (updateStatus === 'success') {
      toast.success(t('profile.save_success'))
      if (userId) dispatch(fetchProfile(userId))
      dispatch(resetUpdateStatus())
    }
    if (updateStatus === 'error') {
      toast.error(t('profile.save_error'))
      dispatch(resetUpdateStatus())
    }
  }, [updateStatus, t, dispatch, userId])

  // Build the multipart payload. Image is [Required] on the server so we always supply a blob.
  const buildFormData = useCallback(
    (
      values: { firstName: string; lastName: string; email: string; phoneNumber?: string },
      imgOverride?: Blob | null,
    ) => {
      const fd = new FormData()
      fd.append('FirstName', values.firstName)
      fd.append('LastName', values.lastName)
      fd.append('Email', values.email)
      fd.append('PhoneNumber', values.phoneNumber || profile?.phoneNumber || '000000000')
      fd.append('Dob', profile?.dob || '2000-01-01')

      if (imgOverride !== undefined) {
        // explicit override (e.g. placeholder on delete, or null to skip)
        fd.append('Image', imgOverride ?? placeholderBlob(), 'avatar.png')
      } else if (avatarFile) {
        // new file chosen this session
        fd.append('Image', avatarFile, avatarFile.name)
      } else {
        // no new file — re-send what's in localStorage (base64 → blob) or fall back to placeholder
        const stored = localStorage.getItem(LS_AVATAR_KEY)
        if (stored) {
          fd.append('Image', dataUrlToBlob(stored), 'avatar.jpg')
        } else {
          fd.append('Image', placeholderBlob(), 'placeholder.png')
        }
      }
      return fd
    },
    [profile, avatarFile],
  )

  const onSubmit = (data: ProfileFormValues) => {
    dispatch(updateProfile(buildFormData(data)))
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarFile(file)
    const reader = new FileReader()
    reader.onloadend = () => {
      const dataUrl = reader.result as string
      setAvatarPreview(dataUrl)
      localStorage.setItem(LS_AVATAR_KEY, dataUrl)
    }
    reader.readAsDataURL(file)
  }

  const handleDeletePhoto = () => {
    setAvatarFile(null)
    setAvatarPreview(null)
    localStorage.removeItem(LS_AVATAR_KEY)
    if (fileInputRef.current) fileInputRef.current.value = ''
    // Sync the deletion to the server immediately using current form values
    const vals = form.getValues()
    dispatch(updateProfile(buildFormData(vals, placeholderBlob())))
  }

  const avatarSrc = avatarPreview ?? profile?.image ?? null
  const initials = (profile?.firstName?.[0] ?? authUser?.name?.[0] ?? '?').toUpperCase()

  const isLoading = status === 'idle' || status === 'loading'

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />

      <main className="flex-1">
        {/* Breadcrumb */}
        <div className="mx-auto w-full max-w-[1280px] px-4 py-5 xl:px-0">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link to="/" className="transition-colors hover:text-foreground">
              {t('nav.home')}
            </Link>
            <ChevronRight className="h-3.5 w-3.5 shrink-0" />
            <span className="font-medium text-foreground">{t('profile.my_account')}</span>
          </nav>
        </div>

        <div className="mx-auto max-w-[1280px] px-4 pb-20 xl:px-0">
          <div className="flex flex-col gap-10 lg:flex-row">

            {/* ── Sidebar ── */}
            <aside className="w-full shrink-0 lg:w-[220px]">
              {SIDEBAR.map((section) => (
                <div key={section.heading} className="mb-7">
                  <p className="mb-3 text-sm font-semibold tracking-wide text-foreground">
                    {t(section.heading)}
                  </p>
                  <ul className="space-y-0.5">
                    {section.links.map((link) => {
                      const isActive = location.pathname === link.to
                      return (
                        <li key={link.key}>
                          <Link
                            to={link.to}
                            className={`flex items-center gap-2 rounded-md py-1.5 pl-4 text-sm transition-colors ${
                              isActive
                                ? 'bg-[#DB4444]/5 font-semibold text-[#DB4444]'
                                : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
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

              <div className="mb-7">
                <Link
                  to="/wishlist"
                  className="block text-sm font-semibold text-foreground transition-colors hover:text-[#DB4444]"
                >
                  {t('profile.my_wishlist')}
                </Link>
              </div>

              <button
                type="button"
                onClick={() => dispatch(logout())}
                className="text-sm text-muted-foreground transition-colors hover:text-destructive"
              >
                {t('auth.logout')}
              </button>
            </aside>

            {/* ── Main content ── */}
            <div className="min-w-0 flex-1">

              {/* Skeleton while fetching */}
              {isLoading && (
                <div className="animate-pulse space-y-5 rounded-xl border border-border bg-card p-8 shadow-sm">
                  <div className="h-6 w-36 rounded-md bg-muted" />
                  <div className="flex items-center gap-4">
                    <div className="h-20 w-20 rounded-full bg-muted" />
                    <div className="space-y-2">
                      <div className="h-4 w-32 rounded bg-muted" />
                      <div className="h-3 w-48 rounded bg-muted" />
                    </div>
                  </div>
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="grid grid-cols-2 gap-4">
                      <div className="h-11 rounded-lg bg-muted" />
                      <div className="h-11 rounded-lg bg-muted" />
                    </div>
                  ))}
                </div>
              )}

              {status === 'error' && (
                <NetworkError onRetry={() => userId && dispatch(fetchProfile(userId))} />
              )}

              {status === 'success' && (
                <div className="rounded-xl border border-border bg-card shadow-sm">
                  {/* Card header */}
                  <div className="flex items-center border-b border-border px-8 py-5">
                    <h1 className="text-xl font-semibold tracking-tight text-[#DB4444]">
                      {t('profile.edit_profile')}
                    </h1>
                  </div>

                  <div className="px-8 py-7">
                    {/* Avatar */}
                    <div className="mb-8 flex items-center gap-5">
                      <div className="relative">
                        <div className="h-20 w-20 overflow-hidden rounded-full bg-muted ring-2 ring-border ring-offset-2 ring-offset-card">
                          {avatarSrc ? (
                            <img
                              src={avatarSrc}
                              alt={profile?.firstName ?? ''}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-2xl font-semibold text-muted-foreground">
                              {initials}
                            </div>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-[#DB4444] text-white shadow-md transition-opacity hover:opacity-90"
                          aria-label={t('profile.change_photo')}
                        >
                          <Camera className="h-3.5 w-3.5" />
                        </button>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleAvatarChange}
                        />
                      </div>
                      <div>
                        <p className="text-base font-semibold text-foreground">
                          {profile?.firstName
                            ? `${profile.firstName} ${profile.lastName}`.trim()
                            : (authUser?.name ?? '')}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {profile?.email || authUser?.email || ''}
                        </p>
                        <div className="mt-1 flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="text-xs text-[#DB4444] transition-opacity hover:opacity-75"
                          >
                            {t('profile.change_photo')}
                          </button>
                          {(avatarPreview ?? profile?.image) && (
                            <button
                              type="button"
                              onClick={handleDeletePhoto}
                              className="text-xs text-muted-foreground transition-colors hover:text-destructive"
                            >
                              {t('profile.delete_photo')}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="space-y-6">
                        {/* Row 1 */}
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <FormField
                            control={form.control}
                            name="firstName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                  {t('profile.first_name')}
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder={t('profile.first_name')}
                                    className="h-11 rounded-lg border-border bg-background transition-shadow focus-visible:ring-[#DB4444]/30 focus-visible:ring-offset-0"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="lastName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                  {t('profile.last_name')}
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder={t('profile.last_name')}
                                    className="h-11 rounded-lg border-border bg-background transition-shadow focus-visible:ring-[#DB4444]/30 focus-visible:ring-offset-0"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        {/* Row 2 */}
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                  {t('profile.email_address')}
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    type="email"
                                    placeholder={t('profile.email_address')}
                                    className="h-11 rounded-lg border-border bg-background transition-shadow focus-visible:ring-[#DB4444]/30 focus-visible:ring-offset-0"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="phoneNumber"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                  {t('profile.phone')}
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    type="tel"
                                    placeholder={t('profile.phone')}
                                    className="h-11 rounded-lg border-border bg-background transition-shadow focus-visible:ring-[#DB4444]/30 focus-visible:ring-offset-0"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        {/* Password Changes */}
                        <div className="rounded-lg border border-dashed border-border p-5">
                          <h2 className="mb-4 text-sm font-semibold text-foreground">
                            {t('profile.password_changes')}
                          </h2>
                          <div className="space-y-3">
                            <FormField
                              control={form.control}
                              name="currentPassword"
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <div className="relative">
                                      <Input
                                        type={showCurrent ? 'text' : 'password'}
                                        placeholder={t('profile.current_password')}
                                        className="h-11 rounded-lg border-border bg-background pr-10 transition-shadow focus-visible:ring-[#DB4444]/30 focus-visible:ring-offset-0"
                                        {...field}
                                      />
                                      <button
                                        type="button"
                                        tabIndex={-1}
                                        onClick={() => setShowCurrent((v) => !v)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                                        aria-label={showCurrent ? 'Hide password' : 'Show password'}
                                      >
                                        {showCurrent ? (
                                          <EyeOff className="h-4 w-4" />
                                        ) : (
                                          <Eye className="h-4 w-4" />
                                        )}
                                      </button>
                                    </div>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                              <FormField
                                control={form.control}
                                name="newPassword"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormControl>
                                      <div className="relative">
                                        <Input
                                          type={showNew ? 'text' : 'password'}
                                          placeholder={t('profile.new_password')}
                                          className="h-11 rounded-lg border-border bg-background pr-10 transition-shadow focus-visible:ring-[#DB4444]/30 focus-visible:ring-offset-0"
                                          {...field}
                                        />
                                        <button
                                          type="button"
                                          tabIndex={-1}
                                          onClick={() => setShowNew((v) => !v)}
                                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                                          aria-label={showNew ? 'Hide password' : 'Show password'}
                                        >
                                          {showNew ? (
                                            <EyeOff className="h-4 w-4" />
                                          ) : (
                                            <Eye className="h-4 w-4" />
                                          )}
                                        </button>
                                      </div>
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name="confirmNewPassword"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormControl>
                                      <div className="relative">
                                        <Input
                                          type={showConfirm ? 'text' : 'password'}
                                          placeholder={t('profile.confirm_new_password')}
                                          className="h-11 rounded-lg border-border bg-background pr-10 transition-shadow focus-visible:ring-[#DB4444]/30 focus-visible:ring-offset-0"
                                          {...field}
                                        />
                                        <button
                                          type="button"
                                          tabIndex={-1}
                                          onClick={() => setShowConfirm((v) => !v)}
                                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                                          aria-label={showConfirm ? 'Hide password' : 'Show password'}
                                        >
                                          {showConfirm ? (
                                            <EyeOff className="h-4 w-4" />
                                          ) : (
                                            <Eye className="h-4 w-4" />
                                          )}
                                        </button>
                                      </div>
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-end gap-3 border-t border-border pt-5">
                          <Button
                            type="button"
                            variant="ghost"
                            className="rounded-lg px-7 text-sm font-medium"
                            onClick={() =>
                              reset({
                                firstName: profile?.firstName || '',
                                lastName: profile?.lastName || '',
                                email: profile?.email || authUser?.email || '',
                                phoneNumber: profile?.phoneNumber || '',
                                currentPassword: '',
                                newPassword: '',
                                confirmNewPassword: '',
                              })
                            }
                          >
                            {t('profile.cancel')}
                          </Button>
                          <Button
                            type="submit"
                            disabled={updateStatus === 'loading'}
                            className="rounded-lg bg-[#DB4444] px-8 text-sm font-semibold text-white shadow-sm hover:bg-[#c53a3a] active:scale-[0.98] disabled:opacity-60"
                          >
                            {updateStatus === 'loading' ? '…' : t('profile.save_changes')}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </div>
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
