# 09 — Figma MCP Setup

Дизайн берётся ТОЛЬКО из Figma через MCP (`figma-developer-mcp`). Не выдумывать.

## Подключение MCP к Claude Code

```bash
# вариант через CLI (пример; токен — свой Figma personal access token)
claude mcp add figma -- npx -y figma-developer-mcp --figma-api-key=<FIGMA_TOKEN> --stdio
```

Либо добавить сервер в конфиг MCP проекта. Токен Figma создаётся в Figma → Settings → Personal access tokens. Хранить вне репозитория (не коммитить).

## Что нужно от пользователя
- Ссылка на Figma-файл (или file key) макета Fastcart/Exclusive.
- Доступ (токен) с правом чтения файла.

## Workflow для каждого экрана/компонента
1. Получить node макета через MCP (фрейм нужной страницы).
2. Снять токены: размеры, цвета (сверить с палитрой docs/04), шрифты/размеры текста, отступы, радиусы, иконки, состояния hover/active/disabled.
3. Перевести в Tailwind точно (`padding:24px` → `p-6`). Не «на глаз».
4. Собрать на shadcn-компонентах; тексты — через `t()`.
5. Проверить mobile-фрейм; если есть — реализовать адаптив по нему.

## Если MCP недоступен
Если `figma-developer-mcp` не запущен или не отвечает — **остановиться и сообщить пользователю**. Не строить дизайн из головы (правило Figma-first в CLAUDE.md). Системные компоненты (docs/11), ThemeToggle, LangSwitcher, toasts, скелетоны — исключение, их можно строить без Figma.
