export interface LoginDto {
  userName: string
  password: string
}

export interface RegisterDto {
  userName: string
  phoneNumber?: string
  email: string
  password: string
  confirmPassword: string
}

export interface TokenPayload {
  sid: string
  name: string
  email: string
  sub: string
  'http://schemas.microsoft.com/ws/2008/06/identity/claims/role': string
  exp: number
  iss: string
  aud: string
}

export interface ApiResponse<T> {
  data: T
  errors: string[]
  statusCode: number
}
