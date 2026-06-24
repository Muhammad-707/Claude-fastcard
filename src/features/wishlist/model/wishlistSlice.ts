import { createSlice } from '@reduxjs/toolkit'

interface WishlistState { ids: number[] }

const STORAGE_KEY = 'wishlist'

function loadFromStorage(): number[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as number[]) : []
  } catch {
    return []
  }
}

function saveToStorage(ids: number[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids))
  } catch { /* noop */ }
}

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState: { ids: loadFromStorage() } as WishlistState,
  reducers: {
    toggle(state, action: { payload: number }) {
      const id = action.payload
      const idx = state.ids.indexOf(id)
      if (idx === -1) {
        state.ids.push(id)
      } else {
        state.ids.splice(idx, 1)
      }
      saveToStorage(state.ids)
    },
    remove(state, action: { payload: number }) {
      state.ids = state.ids.filter((id) => id !== action.payload)
      saveToStorage(state.ids)
    },
    clear(state) {
      state.ids = []
      saveToStorage([])
    },
  },
})

export const { toggle: toggleWishlist, remove: removeWishlist, clear: clearWishlist } =
  wishlistSlice.actions
export default wishlistSlice.reducer

export const selectWishlistIds = (s: { wishlist: WishlistState }) => s.wishlist.ids
export const selectIsWishlisted = (id: number) => (s: { wishlist: WishlistState }) =>
  s.wishlist.ids.includes(id)
