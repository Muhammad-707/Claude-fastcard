import { api } from './axios'
import type { ApiEnvelope, CartItem } from './types'

export const cartApi = {
  getCart: () => api.get<ApiEnvelope<CartItem[]>>('/Cart/get-products-from-cart'),
  addToCart: (id: number) =>
    api.post<ApiEnvelope<null>>('/Cart/add-product-to-cart', null, { params: { id } }),
  increase: (id: number) =>
    api.put<ApiEnvelope<null>>('/Cart/increase-product-in-cart', null, { params: { id } }),
  reduce: (id: number) =>
    api.put<ApiEnvelope<null>>('/Cart/reduce-product-in-cart', null, { params: { id } }),
  remove: (id: number) =>
    api.delete<ApiEnvelope<null>>('/Cart/delete-product-from-cart', { params: { id } }),
  clear: () => api.delete<ApiEnvelope<null>>('/Cart/clear-cart'),
}
