# 02 — Tech Stack (установка)

Все версии — последние стабильные. Менеджер пакетов — тот, что в проекте (npm / pnpm).

## Базовые

```bash
# state
npm i @reduxjs/toolkit react-redux

# http + jwt
npm i axios jwt-decode

# routing
npm i react-router-dom

# формы
npm i react-hook-form zod @hookform/resolvers

# i18n
npm i i18next react-i18next i18next-browser-languagedetector

# темы
npm i next-themes

# уведомления + карусель + утилиты
npm i sonner embla-carousel-react clsx tailwind-merge class-variance-authority
```

## Иконки

`lucide-react` ставится вместе с shadcn. Если нет: `npm i lucide-react`.

## shadcn/ui

```bash
npx shadcn@latest init
# по мере надобности добавлять компоненты:
npx shadcn@latest add button input form label dropdown-menu dialog \
  sheet skeleton sonner tabs select checkbox radio-group badge \
  separator avatar accordion tooltip pagination card
```

## package.json — обязательные скрипты

```jsonc
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "lint": "oxlint",
    "type-check": "tsc --noEmit"
  }
}
```

## tsconfig — alias `@/`

```jsonc
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": { "@/*": ["./src/*"] }
  }
}
```

И в `vite.config.ts`:

```ts
import path from 'node:path'
export default defineConfig({
  resolve: { alias: { '@': path.resolve(__dirname, './src') } },
})
```

## Что НЕ ставим

- Никаких UI-китов кроме shadcn/ui.
- Никакого state-менеджера кроме Redux Toolkit (RTK Query — опционально, но базово используем `createAsyncThunk`, см. docs/07).
