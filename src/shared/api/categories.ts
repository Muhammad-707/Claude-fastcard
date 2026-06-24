import { api } from './axios'
import type { ApiEnvelope, Category } from './types'

export const categoriesApi = {
  getCategories: () => api.get<ApiEnvelope<Category[]>>('/Category/get-categories'),
}
