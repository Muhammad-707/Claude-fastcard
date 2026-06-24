# 07 — Redux Structure

Redux Toolkit. Все async — через `createAsyncThunk`, которые внутри вызывают функции из `shared/api`. Прямой axios в компонентах запрещён.

## Store → `src/app/store.ts`

```ts
import { configureStore } from '@reduxjs/toolkit'
export const store = configureStore({
  reducer: {
    auth: authReducer,
    products: productsReducer,
    categories: categoriesReducer,
    brands: brandsReducer,
    colors: colorsReducer,
    cart: cartReducer,
    wishlist: wishlistReducer,   // client-side + persist
    ui: uiReducer,               // тема, мобильное меню
  },
})
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
```

`src/app/hooks.ts` — типизированные `useAppDispatch`, `useAppSelector`.

## Слайсы

| Slice | State | Thunks |
|---|---|---|
| `authSlice` | `user, token, status` | `login`, `register`, `loadSession`, `logout` |
| `productsSlice` | `list, current, filters, pagination, status` | `fetchProducts`, `fetchProductById` |
| `categoriesSlice` | `items, status` | `fetchCategories` |
| `brandsSlice` | `items, pagination` | `fetchBrands` |
| `colorsSlice` | `items, pagination` | `fetchColors` |
| `cartSlice` | `items, status` | `fetchCart`, `addToCart`, `increase`, `reduce`, `removeFromCart`, `clearCart` |
| `wishlistSlice` | `ids: number[]` | (sync) `toggle`, `remove`, `clear` — persist localStorage |
| `uiSlice` | `theme, isMobileMenuOpen` | (sync) |

## Паттерн async-слайса

```ts
export const fetchProducts = createAsyncThunk(
  'products/fetch',
  async (params: ProductFilters) => productsApi.getProducts(params),
)

const slice = createSlice({
  name: 'products',
  initialState,
  reducers: { setFilters(state, a) { state.filters = a.payload } },
  extraReducers: (b) => {
    b.addCase(fetchProducts.pending,   (s) => { s.status = 'loading' })
     .addCase(fetchProducts.fulfilled, (s, a) => { s.status = 'success'; s.list = a.payload.data; s.pagination = pick(a.payload) })
     .addCase(fetchProducts.rejected,  (s) => { s.status = 'error' })
  },
})
```

`status: 'idle' | 'loading' | 'success' | 'error'` — на его основе компонент показывает skeleton / данные / NetworkError. Каждое async-действие = 3 состояния (правило 16 из CLAUDE.md).

## wishlistSlice + persist

Подписка на store или middleware: при изменении `wishlist.ids` писать в `localStorage['wishlist']`; при `loadSession` — читать обратно. Можно ключевать по `user.id`.

## Селекторы

Выносить в `selectors.ts` каждого слайса: `selectCartCount`, `selectCartTotal`, `selectIsAuth`, `selectIsAdmin`, `selectWishlistIds`.
