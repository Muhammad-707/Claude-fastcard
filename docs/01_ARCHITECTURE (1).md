# 01 — Архитектура (FSD)

Проект построен по **Feature-Sliced Design**. Слои импортируются строго сверху вниз — нижний слой не знает о верхнем.

## Слои (от верхнего к нижнему)

```
app → pages → widgets → features → entities → shared
```

| Слой | Что лежит | Может импортировать |
|---|---|---|
| `app` | store, провайдеры, роутер, глобальные стили | всё ниже |
| `pages` | страницы-роуты (по папке на страницу) | widgets, features, entities, shared |
| `widgets` | крупные самостоятельные блоки (Header, Footer, Sidebar, фильтры) | features, entities, shared |
| `features` | действия пользователя (auth, add-to-cart, theme-toggle, lang-switcher) | entities, shared |
| `entities` | доменные сущности (ProductCard, BrandCard, CategoryItem) | shared |
| `shared` | api, ui (shadcn), lib, hooks, config, types | ничего из проекта |

**Правило:** `entities` не импортирует `features`; `features` не импортирует другие `features` напрямую. Нарушение = рефактор, не отключение линтера.

## Структура страницы (pages/*)

```
pages/product-list/
├── index.tsx           # сборка страницы (только композиция)
├── components/         # локальные блоки страницы (FilterSidebar, SortBar)
├── hooks/              # useProductListPage и т.п. (вся логика тут)
└── types.ts            # локальные типы страницы
```

В `index.tsx` — **только JSX-композиция**. Логика (fetch, фильтры, пагинация) — в `hooks/`.

## Naming

- Папки: `kebab-case` (`product-detail`).
- Компоненты/файлы компонентов: `PascalCase` (`ProductCard.tsx`).
- Хуки: `useCamelCase` (`useProducts.ts`).
- Slice: `camelCaseSlice.ts` (`cartSlice.ts`).
- Все импорты через alias `@/` → `@/shared/ui/button`, `@/entities/product-card`.

## Barrel-файлы

Каждый слайс/сегмент экспортирует публичный API через `index.ts`. Снаружи импортируем только из `index.ts` сегмента, не из глубины.

```ts
// entities/product-card/index.ts
export { ProductCard } from './ui/ProductCard'
export type { ProductCardProps } from './types'
```

## Полный список страниц (см. docs/08)

home, login, register, product-list, product-detail, **wishlist**, cart, checkout, profile, **about**, **contact**, not-found.

> `wishlist`, `about`, `contact` — новые, их не было в исходной структуре `src/pages/`. Добавить папки.
