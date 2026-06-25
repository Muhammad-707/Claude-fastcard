import api from './axios'
import type { ApiEnvelope, UserProfile } from './types'

export const profileApi = {
  getById: (id: string) =>
    api.get<ApiEnvelope<UserProfile>>('/UserProfile/get-user-profile-by-id', { params: { id } }),

  // PUT endpoint only accepts multipart/form-data with PascalCase keys.
  update: (form: FormData) =>
    api.put<ApiEnvelope<null>>('/UserProfile/update-user-profile', form),
}
