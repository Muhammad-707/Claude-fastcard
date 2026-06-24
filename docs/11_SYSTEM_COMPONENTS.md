# 11 — System Components

Реализовать ВСЕ до основных страниц (правило 13 CLAUDE.md). Строятся без Figma. На базе shadcn где возможно.

## ErrorBoundary
Класс-компонент (или `react-error-boundary`). Глобальный — оборачивает всё приложение в `app`. Лёгкая версия — на уровне страницы. Показывает «что-то пошло не так» + кнопку «обновить». Тексты через `t()`.

## ProtectedRoute
```tsx
function ProtectedRoute({ adminOnly = false }: { adminOnly?: boolean }) {
  const isAuth = useAppSelector(selectIsAuth)
  const isAdmin = useAppSelector(selectIsAdmin)
  const location = useLocation()
  if (!isAuth) return <Navigate to="/login" state={{ from: location }} replace />
  if (adminOnly && !isAdmin) return <Navigate to="/" replace />
  return <Outlet />
}
```

## PageLoader / LoadingPage
Полноэкранный центрированный спиннер. Использовать как `Suspense fallback` для всех lazy-роутов.

## NotFoundPage (404)
Отдельная страница: «404 Not Found» + подпись + кнопка «На главную». Маршрут `*`.

## EmptyState
Переиспользуемый: иконка + заголовок + подпись + (опц.) кнопка действия. Для пустой корзины, пустого wishlist, пустого поиска (включая 204).

```tsx
<EmptyState icon={<ShoppingCart/>} title={t('empty.cart')} action={...} />
```

## NetworkError
Показывать при `status === 'error'` от thunks / отвале axios: иконка + «Ошибка сети» + кнопка «Повторить» (повторный dispatch).

## ConfirmDialog
shadcn `dialog`/`alert-dialog`. Обязателен перед любым destructive (удаление из корзины, удаление аккаунта, очистка корзины). Promise-обёртка или контролируемый стейт.

## Toaster
`<Toaster/>` от sonner в корне (`app/providers`). Все уведомления (успех/ошибка) — через `toast.success` / `toast.error`. Ошибки API — `errors[0]`.

---

### Чек-лист (из Definition of Done)
- [ ] ErrorBoundary глобальный
- [ ] ProtectedRoute (+ adminOnly)
- [ ] PageLoader на lazy-роутах
- [ ] NotFoundPage на `*`
- [ ] EmptyState (корзина, поиск)
- [ ] NetworkError при отвале API
- [ ] ConfirmDialog перед delete
- [ ] Toaster подключён
