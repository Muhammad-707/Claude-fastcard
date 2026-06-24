import { api } from './axios'
import type { Paginated, ApiEnvelope, Product, ProductFilters } from './types'

export const productsApi = {
  getProducts: (params: ProductFilters) =>
    api.get<Paginated<Product>>('/Product/get-products', { params }),

  getProductById: (id: number) =>
    api.get<ApiEnvelope<Product>>('/Product/get-product-by-id', { params: { id } }),
}
