# 10 — Implementation Plan (пошагово)

Идти строго по порядку. На каждом шаге: прочитать нужный .md → реализовать → `npm run type-check` + `npm run lint` → дальше. Этот файл — основа для команды `/start` (см. `.claude/skills/`). Прогресс отмечать чекбоксами здесь, итоги сессии писать через `/stop`.

**Легенда:** `[ ]` todo · `[~]` в работе · `[x]` готово · `[!]` заблокировано

## Шаг 0 — Подготовка
- [ ] Прочитать все `docs/01`–`docs/11`
- [ ] Подключить Figma MCP (docs/09), получить ссылку на макет
- [ ] `.env` / `.env.example` (см. CLAUDE.md), `.gitignore`

## Шаг 1 — Фундамент
- [ ] Установить зависимости (docs/02)
- [ ] alias `@/` (vite + tsconfig)
- [ ] Tailwind + CSS-переменные тем + шрифты (docs/04)
- [ ] shadcn init + базовые компоненты
- [ ] `shared/api/axios.ts` + interceptors (docs/03)
- [ ] `shared/api/types.ts` + функции api по доменам (auth, products, categories, brands, colors, cart, profile)

## Шаг 2 — App-каркас
- [ ] Redux store + hooks (docs/07)
- [ ] i18n + словари ru/en/tj (docs/05)
- [ ] Провайдеры (Redux, Theme, i18n, Router) в `app/providers`
- [ ] Роутер + lazy-роуты + `<Suspense>` + `<ErrorBoundary>` (docs/11)

## Шаг 3 — Системные компоненты (ДО страниц!)
- [ ] ErrorBoundary, PageLoader, NotFoundPage, EmptyState, NetworkError, ConfirmDialog, ProtectedRoute, Toaster (docs/11)

## Шаг 4 — Widgets
- [ ] Header (по Figma) + LangSwitcher + ThemeToggle (docs/04)
- [ ] Footer (по Figma)
- [ ] Mobile burger (sheet)

## Шаг 5 — Auth
- [ ] authSlice + thunks (login/register/loadSession/logout) (docs/06–07)
- [ ] `/login` (по Figma)
- [ ] `/register` (по Figma)
- [ ] ProtectedRoute подключён к роутам

## Шаг 6 — Каталог
- [ ] entities/product-card (по Figma)
- [ ] productsSlice, categoriesSlice, brandsSlice, colorsSlice
- [ ] `/products` — фильтры + сетка + пагинация + 204/empty
- [ ] `/product/:id` — галерея, варианты, related

## Шаг 7 — Корзина / Wishlist / Checkout
- [ ] cartSlice + `/cart`
- [ ] wishlistSlice (persist) + `/wishlist`
- [ ] `/checkout` (clear-cart + success; заказ = [!] blocked)

## Шаг 8 — Home + статические
- [ ] `/` Home (все 8 секций по Figma, таймеры, карусели)
- [ ] `/profile` (update-user-profile)
- [ ] `/about`, `/contact`, `404`

## Шаг 9 — Полировка
- [ ] Скелетоны/лоадеры везде, тосты, адаптив-проход по mobile-фреймам
- [ ] A11y, проверка `type-check` + `lint` + `build`
- [ ] (опц.) Admin-CRUD для Brand/Category/SubCategory/Color/Product

## Блокеры
- [!] Создание заказа — нет эндпоинта (docs/03). Checkout = clear-cart + success.
- [!] Wishlist — нет эндпоинта → клиентский slice + persist.
- [?] Путь к картинкам (`/images/`?) — подтвердить.
- [?] Register 500 — уточнить требования к полям/уникальности.

## Журнал решений
- (пусто — `/stop` дописывает)
