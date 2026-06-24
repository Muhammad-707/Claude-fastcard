# CLAUDE.md — Главное ТЗ для Claude Code

> Этот файл Claude Code читает автоматически при запуске в директории проекта. Здесь главные правила и ссылки на детальные документы в `docs/`.

---

## 🎯 Что нужно построить

Полноценный **E-commerce магазин** (фронтенд) на React + TypeScript, который работает с готовым бэкендом `https://store-api.softclub.tj`. Проект уже инициализирован через Vite (см. структуру в `src/`, `vite.config.ts`, `tsconfig.*.json`, `.oxlintrc.json`, `eslint.config.js`).

**Главная задача Claude Code:** превратить пустой Vite-стартер в полностью рабочий магазин по этому ТЗ, используя дизайны из Figma через MCP и Swagger API.

---

## 🔥 САМОЕ ВАЖНОЕ ПРАВИЛО — Figma-first

**Claude Code НЕ ВЫДУМЫВАЕТ дизайн. Каждая страница, каждый компонент строится ТОЛЬКО на основе Figma через MCP.**

Workflow ОБЯЗАТЕЛЬНО такой для **каждой** страницы и **каждого** компонента:

1. 📐 **Открыть Figma через MCP** (`figma-developer-mcp`) и получить точные размеры, цвета, шрифты, отступы, иконки, состояния (hover/active/disabled).
2. 🧩 **Определить из дизайна**: какие shadcn компоненты использовать как базу, какие нужно докрутить.
3. ✍️ **Реализовать компонент**, прикладывая значения из Figma. Если в Figma `padding: 24px` — пиши `p-6` (Tailwind), не `p-4` "потому что красивее".
4. 🌐 **Все тексты — через `t('...')`** из i18n, никаких хардкод-строк.
5. 📱 **Адаптив**: проверить, есть ли в Figma mobile-версия фрейма. Если есть — реализовать обе. Если нет — адаптировать самому по `docs/08_RESPONSIVE.md`.
6. ✅ **Проверить TypeScript и Oxlint** перед переходом дальше.

**Если Figma MCP не запущен / не отвечает — остановиться и сообщить пользователю**, не строить из головы.

**Исключения** (компоненты которые Claude Code строит САМ, без Figma):
- Все системные компоненты из `docs/11_SYSTEM_COMPONENTS.md` (ErrorBoundary, LoadingPage, NotFoundPage и т.д.)
- ThemeToggle и LangSwitcher в Header (их нет в дизайне — см. ниже)
- Toast'ы (sonner — стандартный вид)
- Скелетоны (на основе размеров компонента из Figma)

---

## 📐 Стек (обязательный, не отступать)

| Категория | Технология | Зачем |
|---|---|---|
| Framework | **React 18 + TypeScript** | основа |
| Bundler | **Vite** | уже настроен |
| UI | **shadcn/ui** (Radix + Tailwind) | все компоненты |
| Стили | **Tailwind CSS** | через shadcn |
| State | **Redux Toolkit** + `createAsyncThunk` | глобальный стейт + async |
| HTTP | **Axios** (с interceptors) | API запросы |
| Routing | **React Router v6** | страницы |
| Forms | **react-hook-form + zod** | валидация |
| i18n | **react-i18next** | ru / en / tj |
| Темы | **next-themes** (или своя реализация) | dark/light mode |
| Иконки | **lucide-react** | (идёт со shadcn) |
| Уведомления | **sonner** | toast'ы |
| Linting | **Oxlint** | уже настроен |

⚠️ Версии всех пакетов — последние стабильные. Все импорты строго через `@/` alias.

---

## 🗂 Структура папок (СТРОГО соблюдать — см. `docs/01_ARCHITECTURE.md`)

```
src/
├── app/                    # точка входа приложения
│   ├── store.ts            # Redux store
│   ├── hooks.ts            # типизированные useAppDispatch/useAppSelector
│   └── providers/          # все провайдеры (Theme, Redux, i18n, Router)
├── pages/                  # страницы (по одной папке на страницу)
│   ├── home/
│   ├── login/
│   ├── register/
│   ├── product-list/
│   ├── product-detail/
│   ├── cart/
│   ├── profile/
│   ├── checkout/
│   └── not-found/
├── widgets/                # крупные блоки: Header, Footer, Sidebar
├── features/               # бизнес-фичи (auth, cart, theme-toggle, lang-switcher)
├── entities/               # доменные сущности (product-card, brand-card)
├── shared/                 # общий код
│   ├── api/                # axios instance + типы Swagger
│   ├── config/             # константы, env
│   ├── lib/                # утилиты
│   ├── ui/                 # shadcn компоненты
│   ├── hooks/              # переиспользуемые хуки
│   └── types/              # глобальные типы
├── i18n/                   # настройка i18n + словари
│   ├── index.ts
│   ├── locales/
│   │   ├── ru.json
│   │   ├── en.json
│   │   └── tj.json
├── assets/                 # картинки, шрифты, svg
├── App.tsx
├── main.tsx
└── index.css               # Tailwind directives + CSS variables (темы)
```

Детали — в `docs/01_ARCHITECTURE.md`.

---

## 🔑 Главные правила для Claude Code

1. **Никогда не пиши логику внутри JSX.** Вся логика — в кастомных хуках (`useAuth`, `useCart`, `useProducts`) или в Redux thunks.

2. **Каждая страница = отдельная папка** с `index.tsx`, при необходимости — локальными компонентами в `./components/`, хуками в `./hooks/`, типами в `./types.ts`.

3. **Все запросы к API — только через Redux Toolkit `createAsyncThunk`** в соответствующем слайсе. Никаких прямых `axios.get(...)` в компонентах.

4. **Axios instance — один**, в `src/shared/api/axios.ts`. Interceptors:
   - request: добавлять `Authorization: Bearer <token>` из localStorage
   - response: при 401 → logout + redirect на `/login`

5. **JWT токен хранить в localStorage** под ключом `access_token`. Декодировать через `jwt-decode` для получения `sid`, `role`, `name`, `email`.

6. **Все строки в UI — через `t('ключ')`** из i18next. Никаких хардкод-текстов на русском/английском в JSX.

7. **Тёмная/светлая тема — через CSS variables** (см. shadcn). Класс `dark` на `<html>`. Переключатель в header.

8. **Адаптивность обязательна:** desktop (≥1024px), tablet (768–1023), mobile (<768). На мобиле — burger menu, drawer для cart, упрощённые формы.

9. **Все формы — через react-hook-form + zod**. Никаких неуправляемых форм.

10. **Никакой ESLint disable.** Если правило мешает — переписать код, а не отключить правило.

11. **Все типы из Swagger — генерировать руками** в `src/shared/api/types.ts` (см. `docs/03_API_INTEGRATION.md`). Никаких `any`.

12. **Header и Footer — это widgets**, не страницы. Должны быть на ВСЕХ страницах кроме `/login` и `/register`.

13. **Обязательные системные компоненты** (см. `docs/11_SYSTEM_COMPONENTS.md`) — без них проект не считается готовым:
    - `<ErrorBoundary>` — глобальный + на каждой странице с лёгкой версией для page-level ошибок
    - `<ProtectedRoute>` — защита роутов (User + Admin), редирект на `/login` если не авторизован
    - `<LoadingPage>` / `<PageLoader>` — полноэкранный лоадер
    - `<Suspense fallback={<PageLoader/>}>` — для lazy-loaded routes
    - `<NotFoundPage>` (404) — отдельная страница с кнопкой "На главную"
    - `<EmptyState>` — когда нет данных (пустая корзина, нет товаров по фильтрам)
    - `<NetworkError>` — когда axios отвалился (нет интернета / сервер упал)
    - `<ConfirmDialog>` — обязательно перед любым destructive действием (delete)
    - `<Toaster />` от sonner — для всех уведомлений

14. **Все роуты — lazy-loaded** через `React.lazy()` + `Suspense fallback={<PageLoader/>}` чтобы не грузить весь bundle сразу.

15. **При сборке проекта Claude Code должен** строго следовать порядку из `docs/10_IMPLEMENTATION_PLAN.md` и не пропускать шаги. Перед каждым шагом — прочитать соответствующий .md.

16. **Каждое async-действие должно иметь все 3 состояния**: loading (skeleton / spinner), success (данные), error (NetworkError или toast).

---

## 🎨 Особое требование к Header

В дизайне Figma в Header **НЕТ** переключателя темы и языка. Claude Code **обязан** добавить их сам, не ломая остальной дизайн:

- **Language switcher**: dropdown с тремя флагами/кодами (🇷🇺 RU, 🇬🇧 EN, 🇹🇯 TJ). Сохранять выбор в localStorage под `i18nextLng`.
- **Theme toggle**: кнопка-иконка (☀️ / 🌙) рядом с language switcher.
- Оба элемента — справа от стандартного контента header'а, до иконок корзины/профиля.
- На мобиле — внутри бургер-меню.

Подробно — в `docs/04_DESIGN_SYSTEM.md` и `docs/05_I18N.md`.

---

## 📚 Документация по модулям

Изучи эти файлы ПЕРЕД написанием кода — порядок важен:

1. **`docs/01_ARCHITECTURE.md`** — структура папок, FSD-подход, naming
2. **`docs/02_TECH_STACK.md`** — все библиотеки с командами установки
3. **`docs/03_API_INTEGRATION.md`** — все эндпоинты Swagger + типы + поведение
4. **`docs/04_DESIGN_SYSTEM.md`** — shadcn, темы, дизайн-токены, header
5. **`docs/05_I18N.md`** — настройка i18next, словари ru/en/tj
6. **`docs/06_AUTH_FLOW.md`** — регистрация, логин, JWT, защищённые роуты
7. **`docs/07_REDUX_STRUCTURE.md`** — все слайсы, thunks, селекторы
8. **`docs/08_RESPONSIVE.md`** — брейкпоинты, mobile-first правила + карта роутов
9. **`docs/09_FIGMA_MCP_SETUP.md`** — как пользоваться Figma через MCP + workflow
10. **`docs/10_IMPLEMENTATION_PLAN.md`** — пошаговый план реализации
11. **`docs/11_SYSTEM_COMPONENTS.md`** — ErrorBoundary, LoadingPage, NotFound, EmptyState и др. — **обязательно** реализовать ВСЕ перед основными страницами

---

## 🚦 Порядок выполнения

Claude Code должен идти строго по `docs/10_IMPLEMENTATION_PLAN.md`. На каждом шаге:
1. Прочитать соответствующий .md файл
2. Реализовать шаг
3. Проверить TypeScript (`tsc --noEmit`) и Oxlint
4. Только потом переходить к следующему шагу

---

## ✅ Definition of Done

Проект считается готовым когда:

- [ ] Все страницы из `docs/08_RESPONSIVE.md` реализованы и работают
- [ ] **КАЖДАЯ страница и компонент построены по дизайну из Figma** (через MCP), а не выдуманы
- [ ] Все API эндпоинты из Swagger подключены (см. `docs/03_API_INTEGRATION.md`)
- [ ] Работает регистрация + логин с сохранением JWT
- [ ] Работает корзина (добавление/изменение/удаление с сервером)
- [ ] Переключение тем сохраняется в localStorage
- [ ] Переключение языков (ru/en/tj) работает мгновенно без перезагрузки
- [ ] Desktop, tablet, mobile — всё адаптивно
- [ ] Нет ошибок TypeScript (`npm run type-check`)
- [ ] Нет ошибок Oxlint (`npm run lint`)
- [ ] Сборка проходит (`npm run build`)
- [ ] Нет хардкод-строк в UI (всё через i18n)
- [ ] Нет `any` в коде
- [ ] **Все системные компоненты реализованы** (см. `docs/11_SYSTEM_COMPONENTS.md`):
  - [ ] Глобальный `<ErrorBoundary>` на корне приложения
  - [ ] `<ProtectedRoute>` редиректит неавторизованных на `/login`
  - [ ] `<ProtectedRoute adminOnly>` редиректит не-админов на `/`
  - [ ] `<PageLoader>` показывается при lazy-loading роутов
  - [ ] `<NotFoundPage>` отображается на любом несуществующем роуте
  - [ ] `<EmptyState>` — на пустой корзине и пустых результатах поиска
  - [ ] `<NetworkError>` — при отвалившемся API
  - [ ] `<ConfirmDialog>` — перед каждым delete
- [ ] Все роуты lazy-loaded через `React.lazy()`
- [ ] Header с language switcher + theme toggle работает на всех страницах кроме auth
- [ ] Все компоненты — на базе shadcn/ui

---

## 🔐 Переменные окружения

Создать `.env` и `.env.example`:

```env
VITE_API_BASE_URL=https://store-api.softclub.tj
VITE_TOKEN_KEY=access_token
VITE_DEFAULT_LANG=ru
```

В `.gitignore` обязательно: `.env`, `node_modules`, `dist`.

---

## 🤖 Figma MCP

См. `docs/09_FIGMA_MCP_SETUP.md`. Используй Figma MCP чтобы получать точные размеры, цвета, шрифты, отступы. Не выдумывай дизайн.

---

**Начни с прочтения всех файлов в `docs/` по порядку, потом следуй `docs/10_IMPLEMENTATION_PLAN.md`.**
