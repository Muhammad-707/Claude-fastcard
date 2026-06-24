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
      if (res.status === 204) return { data: [] as Product[], pageNumber: 1, pageSize: 12, totalPage: 1, totalRecord: 0 }
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

function extractList(raw: unknown): { list: Product[]; pagination: ProductsState['pagination'] } {
  if (!raw || typeof raw !== 'object') return { list: [], pagination: { pageNumber: 1, pageSize: 12, totalPage: 1, totalRecord: 0 } }

  const r = raw as Record<string, unknown>

  // Direct paginated: { data: Product[], pageNumber, pageSize, totalPage, totalRecord }
  if (Array.isArray(r['data'])) {
    return {
      list: r['data'] as Product[],
      pagination: {
        pageNumber: Number(r['pageNumber'] ?? 1),
        pageSize: Number(r['pageSize'] ?? 12),
        totalPage: Number(r['totalPage'] ?? 1),
        totalRecord: Number(r['totalRecord'] ?? 0),
      },
    }
  }

  // Envelope-wrapped: { data: { data: Product[], pageNumber, ... } }
  if (r['data'] && typeof r['data'] === 'object' && !Array.isArray(r['data'])) {
    const inner = r['data'] as Record<string, unknown>
    if (Array.isArray(inner['data'])) {
      return {
        list: inner['data'] as Product[],
        pagination: {
          pageNumber: Number(inner['pageNumber'] ?? r['pageNumber'] ?? 1),
          pageSize: Number(inner['pageSize'] ?? r['pageSize'] ?? 12),
          totalPage: Number(inner['totalPage'] ?? r['totalPage'] ?? 1),
          totalRecord: Number(inner['totalRecord'] ?? r['totalRecord'] ?? 0),
        },
      }
    }
  }

  return { list: [], pagination: { pageNumber: 1, pageSize: 12, totalPage: 1, totalRecord: 0 } }
}

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
    resetFilters(state) {
      state.filters = { pageNumber: 1, pageSize: 12 }
    },
  },
  extraReducers: (b) => {
    b.addCase(fetchProducts.pending, (s) => { s.listStatus = 'loading' })
     .addCase(fetchProducts.fulfilled, (s, a) => {
       s.listStatus = 'success'
       const { list, pagination } = extractList(a.payload)
       s.list = list
       s.pagination = pagination
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

export const { setFilters, setPage, clearCurrent, resetFilters } = productsSlice.actions
export default productsSlice.reducer
