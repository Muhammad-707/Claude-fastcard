import api from './axios'
import type { Paginated, Color } from './types'

export const colorsApi = {
  getColors: (params?: { pageNumber?: number; pageSize?: number }) =>
    api.get<Paginated<Color>>('/Color/get-colors', { params }),
}
