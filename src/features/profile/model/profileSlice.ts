import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { profileApi } from '@/shared/api/profile'
import type { UserProfile } from '@/shared/api/types'

type Status = 'idle' | 'loading' | 'success' | 'error'

interface ProfileState { data: UserProfile | null; status: Status; updateStatus: Status }

const initialState: ProfileState = { data: null, status: 'idle', updateStatus: 'idle' }

export const fetchProfile = createAsyncThunk(
  'profile/fetch',
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await profileApi.getById(id)
      return res.data.data
    } catch {
      return rejectWithValue('network_error')
    }
  },
)

export const updateProfile = createAsyncThunk(
  'profile/update',
  async (form: FormData, { rejectWithValue }) => {
    try {
      await profileApi.update(form)
    } catch (err) {
      const e = err as { response?: { data?: unknown } }
      console.error('Profile update error:', e.response?.data ?? err)
      return rejectWithValue('network_error')
    }
  },
)

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    resetUpdateStatus(state) {
      state.updateStatus = 'idle'
    },
  },
  extraReducers: (b) => {
    b.addCase(fetchProfile.pending, (s) => { s.status = 'loading' })
     .addCase(fetchProfile.fulfilled, (s, a) => {
       s.status = 'success'
       s.data = a.payload as UserProfile
     })
     .addCase(fetchProfile.rejected, (s) => { s.status = 'error' })
     .addCase(updateProfile.pending, (s) => { s.updateStatus = 'loading' })
     .addCase(updateProfile.fulfilled, (s) => { s.updateStatus = 'success' })
     .addCase(updateProfile.rejected, (s) => { s.updateStatus = 'error' })
  },
})

export const { resetUpdateStatus } = profileSlice.actions
export default profileSlice.reducer
