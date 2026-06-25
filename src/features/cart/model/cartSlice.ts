import { createAsyncThunk, createSlice, current, type PayloadAction } from '@reduxjs/toolkit'
import { cartApi } from '@/shared/api/cart'
import type { CartItem, Product } from '@/shared/api/types'

type Status = 'idle' | 'loading' | 'success' | 'error'

interface CartState {
  items: CartItem[]
  status: Status
  /** IDs currently being removed — only remove/add need a pending lock */
  mutatingIds: number[]
  clearing: boolean
}

/* ── localStorage helpers ───────────────────────────────────────────── */
// Primary key (matches user-specified key)
const CART_KEY = 'fastcart_items'
// Legacy key — migrated on first read
const LEGACY_KEY = 'cart_cache'

function loadCache(): CartItem[] {
  try {
    // Try primary key first, fall back to legacy
    const raw = localStorage.getItem(CART_KEY) ?? localStorage.getItem(LEGACY_KEY)
    if (!raw) return []
    const items = JSON.parse(raw) as CartItem[]
    return items.filter((i) => i?.productId > 0)
  } catch { return [] }
}

function saveCache(items: CartItem[]) {
  try {
    const json = JSON.stringify(items)
    localStorage.setItem(CART_KEY, json)
    // Keep legacy key in sync so other tabs/components still work
    localStorage.setItem(LEGACY_KEY, json)
  } catch { /* noop */ }
}

function addId(ids: number[], id: number) {
  if (!ids.includes(id)) ids.push(id)
}

function removeId(ids: number[], id: number) {
  const i = ids.indexOf(id)
  if (i >= 0) ids.splice(i, 1)
}

/* ── Response normalizer ────────────────────────────────────────────────
   Handles two possible shapes the server may return:
   Shape A – { productId, product, quantity }
   Shape B – product object with embedded { id, productName, productInfoFromCart } */
function normalizeCartItems(raw: unknown): CartItem[] {
  if (!Array.isArray(raw)) return []
  return raw.flatMap((item: unknown) => {
    if (!item || typeof item !== 'object') return []
    const i = item as Record<string, unknown>

    // Shape A
    if (typeof i.productId === 'number' && i.product != null) {
      return [{
        productId: i.productId,
        product: i.product as Product,
        quantity: typeof i.quantity === 'number' ? i.quantity : 1,
      }]
    }

    // Shape B
    if (typeof i.id === 'number' && typeof i.productName === 'string') {
      const info = i.productInfoFromCart as Record<string, unknown> | null | undefined
      const qty =
        typeof info?.count    === 'number' ? info.count :
        typeof info?.quantity === 'number' ? info.quantity : 1
      return [{
        productId: i.id,
        product: i as unknown as Product,
        quantity: qty,
      }]
    }

    return []
  })
}

/* ── Initial state ──────────────────────────────────────────────────── */
const initialState: CartState = {
  items: loadCache(),
  status: 'idle',
  mutatingIds: [],
  clearing: false,
}

/* ── Thunks ─────────────────────────────────────────────────────────── */
export const fetchCart = createAsyncThunk(
  'cart/fetch',
  async (_, { rejectWithValue }) => {
    try {
      const res = await cartApi.getCart()
      return normalizeCartItems(res.data.data)
    } catch {
      return rejectWithValue('network_error')
    }
  },
)

/* Fire-and-forget — state is owned by addToCartLocal below.
   Still tracks mutatingIds so fetchCart.fulfilled won't overwrite during the add. */
export const addToCart = createAsyncThunk(
  'cart/add',
  async (productId: number) => {
    try { await cartApi.addToCart(productId) } catch { /* silent — localStorage is source of truth */ }
  },
)

/* Fire-and-forget — state is owned by the synchronous reducers below */
export const increaseCart = createAsyncThunk(
  'cart/increase',
  async (productId: number) => {
    try { await cartApi.increase(productId) } catch { /* silent — local state is source of truth */ }
  },
)

export const reduceCart = createAsyncThunk(
  'cart/reduce',
  async (productId: number) => {
    try { await cartApi.reduce(productId) } catch { /* silent — local state is source of truth */ }
  },
)

export const removeFromCart = createAsyncThunk(
  'cart/remove',
  async (productId: number, { rejectWithValue }) => {
    try {
      await cartApi.remove(productId)
      return productId
    } catch {
      return rejectWithValue(productId)
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
  reducers: {
    /* ─── SYNCHRONOUS — source of truth for all quantity changes ─── */

    /** Adds product to cart or increments quantity if already present.
     *  Writes to localStorage immediately — no network wait. */
    addToCartLocal(s, a: PayloadAction<{ productId: number; product: Product }>) {
      const { productId, product } = a.payload
      const idx = s.items.findIndex((i) => i.productId === productId)
      if (idx >= 0) {
        s.items[idx].quantity += 1
      } else {
        s.items.push({ productId, product, quantity: 1 })
      }
      saveCache(current(s).items)
    },

    /** Instantly increments quantity + saves to localStorage. No network wait. */
    increaseQtyLocal(s, a: PayloadAction<number>) {
      const idx = s.items.findIndex((i) => i.productId === a.payload)
      if (idx >= 0) {
        s.items[idx].quantity += 1
        saveCache(current(s).items)
      }
    },

    /** Instantly decrements quantity + saves to localStorage. No network wait.
     *  Caller is responsible for not dispatching this when qty === 1 (show confirm instead). */
    decreaseQtyLocal(s, a: PayloadAction<number>) {
      const idx = s.items.findIndex((i) => i.productId === a.payload)
      if (idx >= 0 && s.items[idx].quantity > 1) {
        s.items[idx].quantity -= 1
        saveCache(current(s).items)
      }
    },
  },
  extraReducers: (b) => {
    b
      /* ─── fetchCart ────────────────────────────────────────────────── */
      .addCase(fetchCart.pending, (s) => { s.status = 'loading' })
      .addCase(fetchCart.fulfilled, (s, a) => {
        s.status = 'success'
        const serverItems = a.payload
        // Only overwrite local if there are no in-flight mutations AND
        // the server actually returned items (don't wipe a loaded local cart)
        if (s.mutatingIds.length > 0) return
        if (serverItems.length > 0 || s.items.length === 0) {
          s.items = serverItems
          saveCache(serverItems)
        }
      })
      .addCase(fetchCart.rejected, (s) => { s.status = 'error' })

      /* ─── addToCart ─── fire-and-forget; mutatingIds guards fetchCart overwrite */
      .addCase(addToCart.pending, (s, a) => {
        addId(s.mutatingIds, a.meta.arg)
      })
      .addCase(addToCart.fulfilled, (s, a) => {
        removeId(s.mutatingIds, a.meta.arg)
      })
      .addCase(addToCart.rejected, (s, a) => {
        removeId(s.mutatingIds, a.meta.arg)
        // No rollback — addToCartLocal already saved to localStorage
      })

      /* ─── increaseCart / reduceCart ─── fire-and-forget, no state touch */
      // (state is already updated synchronously via increaseQtyLocal / decreaseQtyLocal)

      /* ─── removeFromCart ─── optimistic remove ──────────────────────── */
      .addCase(removeFromCart.pending, (s, a) => {
        addId(s.mutatingIds, a.meta.arg)
        const idx = s.items.findIndex((i) => i.productId === a.meta.arg)
        if (idx >= 0) {
          s.items.splice(idx, 1)
          saveCache(current(s).items)
        }
      })
      .addCase(removeFromCart.fulfilled, (s, a) => {
        removeId(s.mutatingIds, a.payload as number)
      })
      .addCase(removeFromCart.rejected, (s, a) => {
        removeId(s.mutatingIds, a.payload as number)
      })

      /* ─── clearCart ────────────────────────────────────────────────── */
      .addCase(clearCart.pending, (s) => { s.clearing = true })
      .addCase(clearCart.fulfilled, (s) => {
        s.clearing = false
        s.items = []
        saveCache([])
      })
      .addCase(clearCart.rejected, (s) => { s.clearing = false })
  },
})

export const { addToCartLocal, increaseQtyLocal, decreaseQtyLocal } = cartSlice.actions
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
