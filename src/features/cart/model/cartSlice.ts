import { createAsyncThunk, createSlice, current } from '@reduxjs/toolkit'
import { cartApi } from '@/shared/api/cart'
import type { CartItem, Product } from '@/shared/api/types'

type Status = 'idle' | 'loading' | 'success' | 'error'

interface CartState {
  items: CartItem[]
  status: Status
  mutating: boolean
}

/* ── localStorage cache ─────────────────────────────────────────────
   Cart items are written to localStorage immediately on every optimistic
   mutation so that the badge and cart page are always up-to-date without
   waiting for an API round-trip. */
const CART_KEY = 'cart_cache'

function loadCache(): CartItem[] {
  try {
    const raw = localStorage.getItem(CART_KEY)
    const items = raw ? (JSON.parse(raw) as CartItem[]) : []
    return items.filter((i) => i?.product != null)
  } catch {
    return []
  }
}

function saveCache(items: CartItem[]) {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(items))
  } catch { /* noop */ }
}

const initialState: CartState = {
  items: loadCache(),   // hydrate from cache → badge is correct immediately on load
  status: 'idle',
  mutating: false,
}

/* ── Thunks ─────────────────────────────────────────────────────────── */
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

// Accept the full Product object so we can do an optimistic localStorage
// write in the .pending handler — before any API call completes.
export const addToCart = createAsyncThunk(
  'cart/add',
  async (args: { productId: number; product: Product }, { dispatch, rejectWithValue }) => {
    try {
      await cartApi.addToCart(args.productId)
      dispatch(fetchCart())   // reconcile with server truth
    } catch {
      return rejectWithValue(args.productId)
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

/* ── Slice ──────────────────────────────────────────────────────────── */
const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {},
  extraReducers: (b) => {
    b
      /* fetchCart — server truth reconciliation */
      .addCase(fetchCart.pending, (s) => { s.status = 'loading' })
      .addCase(fetchCart.fulfilled, (s, a) => {
        s.status = 'success'
        const serverItems = ((a.payload as CartItem[]) ?? []).filter((i) => i?.product != null)
        // Guard: only overwrite local items when server returned data OR local is already empty.
        // Prevents a race where the Cart page's mount-fetch completes before the addToCart API
        // call does, causing a momentarily empty server response to wipe optimistic items.
        if (serverItems.length > 0 || s.items.length === 0) {
          s.items = serverItems
          saveCache(serverItems)
        }
      })
      .addCase(fetchCart.rejected, (s) => { s.status = 'error' })

      /* addToCart — OPTIMISTIC: write to state + localStorage immediately */
      .addCase(addToCart.pending, (s, a) => {
        s.mutating = true
        const { productId, product } = a.meta.arg
        const idx = s.items.findIndex((i) => i.productId === productId)
        if (idx >= 0) {
          s.items[idx].quantity += 1
        } else {
          s.items.push({ productId, product, quantity: 1 })
        }
        saveCache(current(s).items)
      })
      .addCase(addToCart.fulfilled, (s) => { s.mutating = false })
      .addCase(addToCart.rejected, (s, a) => {
        // Roll back the optimistic item we added
        s.mutating = false
        const productId = a.payload as number
        const idx = s.items.findIndex((i) => i.productId === productId)
        if (idx >= 0) {
          if (s.items[idx].quantity > 1) {
            s.items[idx].quantity -= 1
          } else {
            s.items.splice(idx, 1)
          }
        }
        saveCache(current(s).items)
      })

      /* increaseCart / reduceCart / removeFromCart — mutating ops */
      .addCase(increaseCart.pending, (s) => { s.mutating = true })
      .addCase(increaseCart.fulfilled, (s) => { s.mutating = false })
      .addCase(increaseCart.rejected, (s) => { s.mutating = false })
      .addCase(reduceCart.pending, (s) => { s.mutating = true })
      .addCase(reduceCart.fulfilled, (s) => { s.mutating = false })
      .addCase(reduceCart.rejected, (s) => { s.mutating = false })
      .addCase(removeFromCart.pending, (s) => { s.mutating = true })
      .addCase(removeFromCart.fulfilled, (s) => { s.mutating = false })
      .addCase(removeFromCart.rejected, (s) => { s.mutating = false })

      /* clearCart — wipe local state + cache immediately */
      .addCase(clearCart.fulfilled, (s) => { s.items = []; saveCache([]) })
  },
})

export default cartSlice.reducer

/* ── Selectors ─────────────────────────────────────────────────────── */
export const selectCartCount = (state: { cart: CartState }) =>
  state.cart.items.reduce((acc, i) => acc + (i?.quantity ?? 0), 0)

export const selectCartTotal = (state: { cart: CartState }) =>
  state.cart.items.reduce((acc, i) => {
    if (!i?.product) return acc
    const price = i.product.hasDiscount
      ? (i.product.discountPrice ?? i.product.price)
      : i.product.price
    return acc + price * i.quantity
  }, 0)
