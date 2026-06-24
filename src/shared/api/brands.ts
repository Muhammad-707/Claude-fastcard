import api from './axios'
import type { Paginated, Brand } from './types'

export const brandsApi = {
  getBrands: (params?: { pageNumber?: number; pageSize?: number }) =>
    api.get<Paginated<Brand>>('/Brand/get-brands', { params }),
}
