# 06 — Auth Flow

## Регистрация
`POST /Account/register` с `{ userName, phoneNumber, email, password, confirmPassword }`.
Форма (react-hook-form + zod): валидировать совпадение паролей, формат email/телефона. При 500/дубле — toast с `errors[0]`. После успеха — редирект на `/login` (или авто-логин, если решим).

## Логин
`POST /Account/login` с `{ userName, password }` → `data` = JWT.
1. Сохранить токен в `localStorage[access_token]`.
2. Декодировать `jwt-decode` → `sid`, `name`, `email`, `role`.
3. Записать `AuthUser` в `authSlice`.
4. Редирект на исходный роут (или `/`).

```ts
import { jwtDecode } from 'jwt-decode'
interface JwtPayload {
  sid: string; name: string; email: string
  role: 'User' | 'Admin'; exp: number; iss: string; aud: string
}
```

## Хранение / восстановление сессии
При старте приложения: прочитать токен из localStorage, проверить `exp` (не истёк), декодировать, заполнить `authSlice`. Истёк → удалить, считать гостем.

## Logout
Удалить токен, очистить `authSlice`, редирект на `/login`.

## 401 от сервера
Перехватывается в axios-interceptor (docs/03): удалить токен + редирект `/login`.

## ProtectedRoute (docs/11)
- `<ProtectedRoute>` — пускает только авторизованных, иначе `Navigate` на `/login` (с сохранением `from`).
- `<ProtectedRoute adminOnly>` — только `role === 'Admin'`, иначе `Navigate` на `/`.

| Роут | Доступ |
|---|---|
| `/`, `/products`, `/product/:id`, `/about`, `/contact` | публично |
| `/login`, `/register` | только гость (авторизованного редиректить на `/`) |
| `/cart`, `/checkout`, `/profile` | только User+ |
| `/wishlist` | работает на клиенте; гостю показывать приглашение залогиниться |
| админ-CRUD (опц., Phase позже) | только Admin |
