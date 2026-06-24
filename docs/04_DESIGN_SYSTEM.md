# 04 — Design System (shadcn + темы)

> Все точные значения берутся из **Figma через MCP**. Ниже — токены палитры «Exclusive» как база. Если Figma даёт другое значение — Figma в приоритете.

## Палитра (Exclusive)

| Токен | Значение | Использование |
|---|---|---|
| primary | `#DB4444` | кнопки, акценты, sale, активные табы |
| primary-hover | `#C13333` (затемнить ~8%) | hover кнопок |
| secondary | `#F5F5F5` | фон секций, плашка картинки в карточке |
| black | `#000000` | top-bar, footer, заголовки |
| white | `#FFFFFF` | фон |
| text | `#000000` | основной текст |
| text-muted | `#7D8184` | вторичный текст |
| success | `#00FF66` | «в наличии», кнопка «Buy Now!» в промо |
| border | `rgba(0,0,0,.30)` | бордеры инпутов |

Шрифты: **Poppins** (основной, заголовки + UI), **Inter** (вторичный/текст). Подключить через `@fontsource` или Google Fonts.
Радиус по умолчанию: `4px`. Контейнер: ~`1170px`, центр, `px-4`.

## CSS variables (light/dark) → `src/index.css`

Объявить переменные в формате shadcn (`--background`, `--foreground`, `--primary`, `--muted`, `--border`, ...) для `:root` и `.dark`. Класс `dark` вешается на `<html>`.

```css
:root {
  --primary: 0 72% 56%;      /* #DB4444 в HSL */
  --background: 0 0% 100%;
  --foreground: 0 0% 0%;
  --muted: 0 0% 96%;
  --muted-foreground: 200 3% 50%;
  --success: 146 100% 50%;
  --radius: 0.25rem;
}
.dark {
  --background: 0 0% 7%;
  --foreground: 0 0% 98%;
  --muted: 0 0% 14%;
  /* primary остаётся красным */
}
```
Тёмная тема: фон тёмный, текст светлый, красный акцент сохраняется. Top-bar/footer и так чёрные — в dark остаются тёмными.

## Кнопки (через shadcn `button` + cva)

- **primary**: красный фон, белый текст, `rounded`(4px), `py-4 px-12`, hover темнее.
- **secondary/outline**: прозрачный, бордер, текст чёрный/foreground.
- **success**: зелёный фон (`#00FF66`) — только промо «Buy Now!».

## Карточка товара (entities/product-card)

Плашка картинки `bg-secondary`; бейдж скидки `-NN%` (красный) top-left; иконки wishlist + quick-view top-right; по hover снизу появляется кнопка «Add To Cart»; ниже — название, цена (sale красным + старая зачёркнутая), звёзды + кол-во отзывов.

## Header — обязательные доработки (нет в Figma)

Добавить **справа, до иконок корзины/профиля**:
- **LangSwitcher**: dropdown (shadcn `dropdown-menu`) — RU / EN / TJ. Сохранять в localStorage `i18nextLng`. Меняет язык мгновенно (`i18n.changeLanguage`).
- **ThemeToggle**: иконка ☀️/🌙 (shadcn `button` variant ghost) — переключает класс `dark`, сохраняет в localStorage.
- На мобиле оба — внутри бургер-меню (shadcn `sheet`).

Не ломать остальной дизайн header'а из Figma (лого, навигация, поиск, иконки wishlist/cart/account).
