import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { productsApi } from '@/shared/api/products'
import type { Product, ProductFilters } from '@/shared/api/types'

type Status = 'idle' | 'loading' | 'success' | 'error'

interface ProductsState {
  list: Product[]
  current: Product | null
  filters: ProductFilters
  pagination: { pageNumber: number; pageSize: number; totalPage: number; totalRecord: number }
  listStatus: Status
  currentStatus: Status
}

const initialState: ProductsState = {
  list: [],
  current: null,
  filters: { pageNumber: 1, pageSize: 12 },
  pagination: { pageNumber: 1, pageSize: 12, totalPage: 1, totalRecord: 0 },
  listStatus: 'idle',
  currentStatus: 'idle',
}

export const fetchProducts = createAsyncThunk(
  'products/fetchAll',
  async (params: ProductFilters, { rejectWithValue }) => {
    try {
      const res = await productsApi.getProducts(params)
      if (res.status === 204) return { data: [], totalPage: 1, totalRecord: 0, pageNumber: 1, pageSize: 12 }
      return res.data
    } catch {
      return rejectWithValue('network_error')
    }
  },
)

export const fetchProductById = createAsyncThunk(
  'products/fetchById',
  async (id: number, { rejectWithValue }) => {
    try {
      const res = await productsApi.getProductById(id)
      if (!res.data.data) return rejectWithValue('not_found')
      return res.data.data
    } catch {
      return rejectWithValue('network_error')
    }
  },
)

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setFilters(state, action: { payload: Partial<ProductFilters> }) {
      state.filters = { ...state.filters, ...action.payload, pageNumber: 1 }
    },
    setPage(state, action: { payload: number }) {
      state.filters.pageNumber = action.payload
    },
    clearCurrent(state) {
      state.current = null
      state.currentStatus = 'idle'
    },
  },
  extraReducers: (b) => {
    b.addCase(fetchProducts.pending, (s) => { s.listStatus = 'loading' })
     .addCase(fetchProducts.fulfilled, (s, a) => {
       s.listStatus = 'success'
       const raw = a.payload as {
         data: unknown
         pageNumber?: number
         pageSize?: number
         totalPage?: number
         totalRecord?: number
       }
       // Guard: API might return Paginated<T> directly or wrapped in an envelope.
       // In both cases we ensure list is always a Product[].
       const dataField = raw.data
       if (Array.isArray(dataField)) {
         s.list = dataField as Product[]
       } else if (dataField !== null && typeof dataField === 'object') {
         const inner = dataField as { data?: unknown; pageNumber?: number; pageSize?: number; totalPage?: number; totalRecord?: number }
         s.list = Array.isArray(inner.data) ? (inner.data as Product[]) : []
         s.pagination = {
           pageNumber: inner.pageNumber ?? raw.pageNumber ?? 1,
           pageSize: inner.pageSize ?? raw.pageSize ?? 12,
           totalPage: inner.totalPage ?? raw.totalPage ?? 1,
           totalRecord: inner.totalRecord ?? raw.totalRecord ?? 0,
         }
         return
       } else {
         s.list = []
       }
       s.pagination = {
         pageNumber: raw.pageNumber ?? 1,
         pageSize: raw.pageSize ?? 12,
         totalPage: raw.totalPage ?? 1,
         totalRecord: raw.totalRecord ?? 0,
       }
     })
     .addCase(fetchProducts.rejected, (s) => { s.listStatus = 'error' })
     .addCase(fetchProductById.pending, (s) => { s.currentStatus = 'loading' })
     .addCase(fetchProductById.fulfilled, (s, a) => {
       s.currentStatus = 'success'
       s.current = a.payload as Product
     })
     .addCase(fetchProductById.rejected, (s) => { s.currentStatus = 'error' })
  },
})

export const { setFilters, setPage, clearCurrent } = productsSlice.actions
export default productsSlice.reducer
