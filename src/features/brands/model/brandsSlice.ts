import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { brandsApi } from '@/shared/api/brands'
import type { Brand } from '@/shared/api/types'

type Status = 'idle' | 'loading' | 'success' | 'error'

interface BrandsState { items: Brand[]; status: Status }

const initialState: BrandsState = { items: [], status: 'idle' }

export const fetchBrands = createAsyncThunk(
  'brands/fetch',
  async (_, { rejectWithValue }) => {
    try {
      const res = await brandsApi.getBrands({ pageSize: 100 })
      return res.data.data ?? []
    } catch {
      return rejectWithValue('network_error')
    }
  },
)

const brandsSlice = createSlice({
  name: 'brands',
  initialState,
  reducers: {},
  extraReducers: (b) => {
    b.addCase(fetchBrands.pending, (s) => { s.status = 'loading' })
     .addCase(fetchBrands.fulfilled, (s, a) => {
       s.status = 'success'
       s.items = a.payload as Brand[]
     })
     .addCase(fetchBrands.rejected, (s) => { s.status = 'error' })
  },
})

export default brandsSlice.reducer
