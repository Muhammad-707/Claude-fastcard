import { configureStore } from '@reduxjs/toolkit'
import authReducer from '@/features/auth/model/authSlice'
import productsReducer from '@/features/products/model/productsSlice'
import categoriesReducer from '@/features/categories/model/categoriesSlice'
import brandsReducer from '@/features/brands/model/brandsSlice'
import cartReducer from '@/features/cart/model/cartSlice'
import wishlistReducer from '@/features/wishlist/model/wishlistSlice'
import profileReducer from '@/features/profile/model/profileSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    products: productsReducer,
    categories: categoriesReducer,
    brands: brandsReducer,
    cart: cartReducer,
    wishlist: wishlistReducer,
    profile: profileReducer,
  },
  middleware: (getDefault) =>
    getDefault({
      serializableCheck: {
        // FormData (file upload) is passed through the profile/update thunk arg and never stored in state.
        ignoredActions: ['profile/update/pending'],
        ignoredActionPaths: ['meta.arg'],
      },
    }),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
