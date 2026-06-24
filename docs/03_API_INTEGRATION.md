# 03 — API Integration (полный Swagger)

**Base URL:** `https://store-api.softclub.tj`
**Swagger:** `https://store-api.softclub.tj/swagger/v1/swagger.json`
**Картинки:** `https://store-api.softclub.tj/images/{fileName}` — ⚠️ путь подтвердить на реальном имени файла (бывает `/Images/` или корень). Хелпер `getImageUrl(name)` в `shared/lib`.

🔒 = требует `Authorization: Bearer <token>`.

---

## Формат ответов (envelope)

Обычный:
```json
{ "data": <T> | null, "errors": string[], "statusCode": number }
```
С пагинацией:
```json
{ "pageNumber": 1, "pageSize": 10, "totalPage": 1, "totalRecord": 5,
  "data": <T[]>, "errors": [], "statusCode": 200 }
```
Всегда читать `errors[]` и `statusCode`. При ошибке показывать `errors[0]` через sonner.
**Особый случай:** `GET /Product/get-products` может вернуть **204 No Content** — это «ничего не найдено», обрабатывать как пустой массив, НЕ как ошибку.

---

## Account

| Метод | Путь | Тело / параметры | Ответ |
|---|---|---|---|
| POST | `/Account/register` | `{ userName, phoneNumber, email, password, confirmPassword }` | envelope (может вернуть 500 на дубль/seed — обработать) |
| POST | `/Account/login` | `{ userName, password }` | `data` = **JWT-строка** |

JWT payload: `sid` (id юзера), `name`, `email`, `role` (`User`/`Admin`), `exp`, `iss`, `aud`. `/me` нет — личность берём из токена. Подробно — docs/06.

## Brand

| Метод | Путь | Параметры |
|---|---|---|
| GET | `/Brand/get-brands` | `BrandName?`, `BrandId?`, `PageNumber?`, `PageSize?` → paginated `{ id, brandName }` |
| GET | `/Brand/get-brand-by-id` | `id` |
| POST 🔒 | `/Brand/add-brand` | `BrandName` (query) |
| PUT 🔒 | `/Brand/update-brand` | `Id`, `BrandName` (query) |
| DELETE 🔒 | `/Brand/delete-brand` | `id` (query) |

## Category

| Метод | Путь | Параметры |
|---|---|---|
| GET | `/Category/get-categories` | → `{ id, categoryName, categoryImage, subCategories:[{ id, subCategoryName }] }` |
| GET | `/Category/get-category-by-id` | `id` |
| POST 🔒 | `/Category/add-category` | multipart: `CategoryImage` (file), `CategoryName` |
| PUT 🔒 | `/Category/update-category` | multipart: `Id`, `CategoryImage`, `CategoryName` |
| DELETE 🔒 | `/Category/delete-category` | `id` (query) |

## SubCategory

| Метод | Путь | Параметры |
|---|---|---|
| GET | `/SubCategory/get-sub-category` | → `{ id, subCategoryName }` |
| GET | `/SubCategory/get-sub-category-by-id` | `id` (404 если нет) |
| POST 🔒 | `/SubCategory/add-sub-category` | `CategoryId`, `SubCategoryName` (query) |
| PUT 🔒 | `/SubCategory/update-sub-category` | `Id`, `CategoryId`, `SubCategoryName` (query) |
| DELETE 🔒 | `/SubCategory/delete-sub-category` | `id` (query) |

## Color

| Метод | Путь | Параметры |
|---|---|---|
| GET | `/Color/get-colors` | `ColorName?`, `PageNumber?`, `PageSize?` → paginated `{ id, colorName }` |
| GET | `/Color/get-color-by-id` | `id` → `{ id, colorName }` |
| POST 🔒 | `/Color/add-color` | `ColorName` (query) |
| PUT 🔒 | `/Color/update-color` | `Id`, `ColorName` (query) → `data: number` |
| DELETE 🔒 | `/Color/delete-color` | `id` (query) |

## Product

| Метод | Путь | Параметры |
|---|---|---|
| GET | `/Product/get-products` | `UserId?`, `ProductName?`, `MinPrice?`, `MaxPrice?`, `BrandId?`, `ColorId?`, `CategoryId?`, `SubcategoryId?`, `PageNumber?`, `PageSize?` → paginated. **204 = пусто** |
| GET | `/Product/get-product-by-id` | `id` (404 если нет) |
| POST 🔒 | `/Product/add-product` | multipart: `Images[]`, `BrandId`, `ColorId`, `ProductName`, `Description`, `Quantity`, `Weight`, `Size`, `Code`, `Price`, `HasDiscount`, `DiscountPrice`, `SubCategoryId` |
| PUT 🔒 | `/Product/update-product` | query: `Id`, `BrandId`, `ColorId`, `ProductName`, `Description`, `Quantity`, `Weight`, `Size`, `Code`, `Price`, `HasDiscount`, `DiscountPrice`, `SubCategoryId` |
| POST 🔒 | `/Product/add-image-to-product` | multipart: `ProductId`, `Files[]` |
| DELETE 🔒 | `/Product/delete-image-from-product` | `imageId` (query) |
| DELETE 🔒 | `/Product/delete-product` | `id` (query) |

> `UserId` в `get-products` — передавать `sid` залогиненного юзера, чтобы сервер помечал избранное/в корзине, если поддерживает.

## Cart 🔒 (всё требует токен)

| Метод | Путь | Параметры |
|---|---|---|
| GET | `/Cart/get-products-from-cart` | — |
| POST | `/Cart/add-product-to-cart` | `id` = productId (query) |
| PUT | `/Cart/increase-product-in-cart` | `id` (query) |
| PUT | `/Cart/reduce-product-in-cart` | `id` (query) |
| DELETE | `/Cart/delete-product-from-cart` | `id` (query) |
| DELETE | `/Cart/clear-cart` | — |

## UserProfile 🔒

| Метод | Путь | Параметры |
|---|---|---|
| GET | `/UserProfile/get-user-profiles` | `UserName?`, `PageNumber?`, `PageSize?` |
| GET | `/UserProfile/get-user-profile-by-id` | `id` |
| PUT | `/UserProfile/update-user-profile` | multipart: `Image`, `FirstName`, `LastName`, `Email`, `PhoneNumber`, `Dob` |
| DELETE | `/UserProfile/delete-user` | `id` (query) |
| POST | `/UserProfile/addrole-from-user` | `UserId`, `RoleId` (query) |
| DELETE | `/UserProfile/remove-role-from-user` | `UserId`, `RoleId` (query) |
| GET | `/UserProfile/get-user-roles` | — |

---

## ⚠️ Пробелы API (важно — решить, не блокироваться)

В Figma есть фичи, которых в бэкенде НЕТ. Делаем на клиенте, пока бэк не добавит:

- **Wishlist** — эндпоинта нет. Хранить в Redux `wishlistSlice` + persist в localStorage (ключ `wishlist`), пер-юзер. Страница Wishlist резолвит товары по id.
- **Оформление заказа (Place Order)** — эндпоинта создания заказа нет. Checkout: собрать форму + валидацию, по submit → `DELETE /Cart/clear-cart` + экран успеха. Реальный POST заказа пометить TODO/blocked.
- **Отзывы / рейтинг** — в API нет. Звёзды — статичный плейсхолдер.

Любой найденный пробел фиксировать в логе сессии (`/stop`).

---

## TypeScript типы → `src/shared/api/types.ts`

```ts
export interface ApiEnvelope<T> { data: T | null; errors: string[]; statusCode: number }
export interface Paginated<T> {
  pageNumber: number; pageSize: number; totalPage: number; totalRecord: number
  data: T[]; errors: string[]; statusCode: number
}

export interface Brand { id: number; brandName: string }
export interface Color { id: number; colorName: string }
export interface SubCategory { id: number; subCategoryName: string }
export interface Category {
  id: number; categoryName: string; categoryImage: string; subCategories: SubCategory[]
}
export interface ProductImage { id: number; imageName: string }
export interface Product {
  id: number; productName: string; description: string
  price: number; hasDiscount: boolean; discountPrice?: number
  quantity: number; code: string; weight?: string; size?: string
  brandId: number; brandName?: string
  colorId: number; colorName?: string
  subCategoryId: number; images: ProductImage[]
}
export interface CartItem { productId: number; product: Product; quantity: number }
export interface AuthUser { id: string; userName: string; email: string; role: 'User' | 'Admin' }
export interface UserProfile {
  id: string; firstName: string; lastName: string; email: string
  phoneNumber: string; dob: string; image?: string
}

// DTO
export interface LoginDto { userName: string; password: string }
export interface RegisterDto {
  userName: string; phoneNumber: string; email: string
  password: string; confirmPassword: string
}
```

> Поля `Product` уточнить по реальному ответу `get-product-by-id` (имена могут отличаться). `any` запрещён.

## axios instance → `src/shared/api/axios.ts`

```ts
import axios from 'axios'
const TOKEN_KEY = import.meta.env.VITE_TOKEN_KEY ?? 'access_token'

export const api = axios.create({ baseURL: import.meta.env.VITE_API_BASE_URL })

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY)
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY)
      window.location.assign('/login')
    }
    return Promise.reject(error)
  },
)
```
