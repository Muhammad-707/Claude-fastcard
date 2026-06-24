import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { categoriesApi } from '@/shared/api/categories'
import type { Category } from '@/shared/api/types'

type Status = 'idle' | 'loading' | 'success' | 'error'

interface CategoriesState { items: Category[]; status: Status }

const initialState: CategoriesState = { items: [], status: 'idle' }

export const fetchCategories = createAsyncThunk(
  'categories/fetch',
  async (_, { rejectWithValue }) => {
    try {
      const res = await categoriesApi.getCategories()
      return res.data.data ?? []
    } catch {
      return rejectWithValue('network_error')
    }
  },
)

const categoriesSlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {},
  extraReducers: (b) => {
    b.addCase(fetchCategories.pending, (s) => { s.status = 'loading' })
     .addCase(fetchCategories.fulfilled, (s, a) => {
       s.status = 'success'
       s.items = a.payload as Category[]
     })
     .addCase(fetchCategories.rejected, (s) => { s.status = 'error' })
  },
})

export default categoriesSlice.reducer
