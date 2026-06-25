import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { jwtDecode } from 'jwt-decode'
import api from '@/shared/api/axios'
import { TOKEN_KEY } from '@/shared/config/env'
import type { LoginDto, RegisterDto, TokenPayload, ApiResponse } from '@/shared/types/auth'

interface AuthState {
  token: string | null
  user: TokenPayload | null
  loginLoading: boolean
  loginError: string | null
  registerLoading: boolean
  registerError: string | null
}

function loadTokenFromStorage(): { token: string | null; user: TokenPayload | null } {
  const token = localStorage.getItem(TOKEN_KEY)
  if (!token) return { token: null, user: null }
  try {
    const user = jwtDecode<TokenPayload>(token)
    return { token, user }
  } catch {
    return { token: null, user: null }
  }
}

const { token: savedToken, user: savedUser } = loadTokenFromStorage()

const initialState: AuthState = {
  token: savedToken,
  user: savedUser,
  loginLoading: false,
  loginError: null,
  registerLoading: false,
  registerError: null,
}

export const loginThunk = createAsyncThunk(
  'auth/login',
  async (credentials: LoginDto, { rejectWithValue }) => {
    try {
      const response = await api.post<ApiResponse<string>>('/Account/login', credentials)
      const token = response.data.data
      localStorage.setItem(TOKEN_KEY, token)
      const user = jwtDecode<TokenPayload>(token)
      return { token, user }
    } catch (error: unknown) {
      const axiosError = error as {
        response?: { status?: number; data?: ApiResponse<null> }
      }
      const apiErrors = axiosError.response?.data?.errors
      if (apiErrors && apiErrors.length > 0) {
        return rejectWithValue(apiErrors[0])
      }
      const status = axiosError.response?.status
      if (status === 401 || status === 400) {
        return rejectWithValue('invalid_credentials')
      }
      return rejectWithValue('server_error')
    }
  }
)

export const registerThunk = createAsyncThunk(
  'auth/register',
  async (data: RegisterDto, { rejectWithValue }) => {
    const serverPayload = {
      userName: data.userName,
      email: data.email,
      phoneNumber: data.phoneNumber,
      password: data.password,
    }
    console.log('[Register] Payload →', JSON.stringify(serverPayload))
    try {
      const response = await api.post<ApiResponse<null>>('/Account/register', serverPayload)
      console.log('[Register] Success', response.status)
      return true
    } catch (error: unknown) {
      const axiosError = error as {
        response?: { status?: number; data?: ApiResponse<null> }
      }
      console.error('[Register] Error', axiosError.response?.status, JSON.stringify(axiosError.response?.data))
      const apiErrors = axiosError.response?.data?.errors
      if (apiErrors && apiErrors.length > 0) {
        const msg = apiErrors[0]
        if (msg.toLowerCase().includes('duplicate') || msg.toLowerCase().includes('already')) {
          return rejectWithValue('user_exists')
        }
        return rejectWithValue('server_error')
      }
      return rejectWithValue('server_error')
    }
  }
)

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.token = null
      state.user = null
      state.loginError = null
      localStorage.removeItem(TOKEN_KEY)
    },
    clearLoginError(state) {
      state.loginError = null
    },
    clearRegisterError(state) {
      state.registerError = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginThunk.pending, (state) => {
        state.loginLoading = true
        state.loginError = null
      })
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.loginLoading = false
        state.token = action.payload.token
        state.user = action.payload.user
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.loginLoading = false
        state.loginError = action.payload as string
      })
      .addCase(registerThunk.pending, (state) => {
        state.registerLoading = true
        state.registerError = null
      })
      .addCase(registerThunk.fulfilled, (state) => {
        state.registerLoading = false
      })
      .addCase(registerThunk.rejected, (state, action) => {
        state.registerLoading = false
        state.registerError = action.payload as string
      })
  },
})

export const { logout, clearLoginError, clearRegisterError } = authSlice.actions
export default authSlice.reducer

export const selectIsAuth = (s: { auth: AuthState }) => !!s.auth.token
export const selectIsAdmin = (s: { auth: AuthState }) =>
  s.auth.user?.['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] === 'Admin'
export const selectUserId = (s: { auth: AuthState }) => s.auth.user?.sid ?? null
