import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { cartApi } from '@/shared/api/cart'
import type { CartItem } from '@/shared/api/types'

type Status = 'idle' | 'loading' | 'success' | 'error'

interface CartState { items: CartItem[]; status: Status; mutating: boolean }

const initialState: CartState = { items: [], status: 'idle', mutating: false }

export const fetchCart = createAsyncThunk(
  'cart/fetch',
  async (_, { rejectWithValue }) => {
    try {
      const res = await cartApi.getCart()
      return res.data.data ?? []
    } catch {
      return rejectWithValue('network_error')
    }
  },
)

export const addToCart = createAsyncThunk(
  'cart/add',
  async (productId: number, { dispatch, rejectWithValue }) => {
    try {
      await cartApi.addToCart(productId)
      dispatch(fetchCart())
    } catch {
      return rejectWithValue('network_error')
    }
  },
)

export const increaseCart = createAsyncThunk(
  'cart/increase',
  async (productId: number, { dispatch, rejectWithValue }) => {
    try {
      await cartApi.increase(productId)
      dispatch(fetchCart())
    } catch {
      return rejectWithValue('network_error')
    }
  },
)

export const reduceCart = createAsyncThunk(
  'cart/reduce',
  async (productId: number, { dispatch, rejectWithValue }) => {
    try {
      await cartApi.reduce(productId)
      dispatch(fetchCart())
    } catch {
      return rejectWithValue('network_error')
    }
  },
)

export const removeFromCart = createAsyncThunk(
  'cart/remove',
  async (productId: number, { dispatch, rejectWithValue }) => {
    try {
      await cartApi.remove(productId)
      dispatch(fetchCart())
    } catch {
      return rejectWithValue('network_error')
    }
  },
)

export const clearCart = createAsyncThunk(
  'cart/clear',
  async (_, { rejectWithValue }) => {
    try {
      await cartApi.clear()
    } catch {
      return rejectWithValue('network_error')
    }
  },
)

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {},
  extraReducers: (b) => {
    b.addCase(fetchCart.pending, (s) => { s.status = 'loading' })
     .addCase(fetchCart.fulfilled, (s, a) => {
       s.status = 'success'
       s.items = a.payload as CartItem[]
     })
     .addCase(fetchCart.rejected, (s) => { s.status = 'error' })
     .addCase(addToCart.pending, (s) => { s.mutating = true })
     .addCase(addToCart.fulfilled, (s) => { s.mutating = false })
     .addCase(addToCart.rejected, (s) => { s.mutating = false })
     .addCase(clearCart.fulfilled, (s) => { s.items = [] })
  },
})

export default cartSlice.reducer

export const selectCartCount = (state: { cart: CartState }) =>
  state.cart.items.reduce((acc, i) => acc + i.quantity, 0)

export const selectCartTotal = (state: { cart: CartState }) =>
  state.cart.items.reduce((acc, i) => {
    const price = i.product.hasDiscount ? (i.product.discountPrice ?? i.product.price) : i.product.price
    return acc + price * i.quantity
  }, 0)
