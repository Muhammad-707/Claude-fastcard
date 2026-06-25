import { createSlice, current } from '@reduxjs/toolkit'
import type { Product } from '@/shared/api/types'

interface WishlistState {
  ids: number[]
  products: Product[]
}

const STORAGE_KEY = 'wishlist'

function loadFromStorage(): WishlistState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ids: [], products: [] }
    const parsed = JSON.parse(raw) as WishlistState | number[]
    // Migrate legacy format (plain number array)
    if (Array.isArray(parsed)) return { ids: parsed, products: [] }
    return { ids: parsed.ids ?? [], products: parsed.products ?? [] }
  } catch {
    return { ids: [], products: [] }
  }
}

function persist(ids: number[], products: Product[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ids, products }))
  } catch { /* noop */ }
}

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState: loadFromStorage(),
  reducers: {
    toggle(state, action: { payload: Product }) {
      const product = action.payload
      const idx = state.ids.indexOf(product.id)
      if (idx === -1) {
        state.ids.push(product.id)
        state.products.push(product)
      } else {
        state.ids.splice(idx, 1)
        state.products = state.products.filter((p) => p.id !== product.id)
      }
      const snap = current(state)
      persist(snap.ids, snap.products)
    },

    remove(state, action: { payload: number }) {
      state.ids = state.ids.filter((id) => id !== action.payload)
      state.products = state.products.filter((p) => p.id !== action.payload)
      const snap = current(state)
      persist(snap.ids, snap.products)
    },

    // Fills product objects for any IDs that don't yet have stored data.
    // Used to migrate legacy localStorage (ids-only) after a products fetch.
    syncProducts(state, action: { payload: Product[] }) {
      const incoming = action.payload
      let dirty = false
      for (const id of state.ids) {
        if (!state.products.find((p) => p.id === id)) {
          const found = incoming.find((p) => p.id === id)
          if (found) { state.products.push(found); dirty = true }
        }
      }
      if (dirty) {
        const snap = current(state)
        persist(snap.ids, snap.products)
      }
    },

    clear(state) {
      state.ids = []
      state.products = []
      persist([], [])
    },
  },
})

export const {
  toggle: toggleWishlist,
  remove: removeWishlist,
  syncProducts: syncWishlistProducts,
  clear: clearWishlist,
} = wishlistSlice.actions
export default wishlistSlice.reducer

export const selectWishlistIds = (s: { wishlist: WishlistState }) => s.wishlist.ids
export const selectWishlistProducts = (s: { wishlist: WishlistState }) => s.wishlist.products
export const selectWishlistCount = (s: { wishlist: WishlistState }) => s.wishlist.ids.length
export const selectIsWishlisted = (id: number) => (s: { wishlist: WishlistState }) =>
  s.wishlist.ids.includes(id)
