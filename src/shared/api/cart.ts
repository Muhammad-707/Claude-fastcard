import api from './axios'
import type { ApiEnvelope, CartItem } from './types'

export const cartApi = {
  getCart: () =>
    api.get<ApiEnvelope<CartItem[]>>('/Cart/get-products-from-cart'),

  // All mutating endpoints take a single query param `id` with no request body.
  // Passing no body avoids Axios sending Content-Type: application/json on a
  // bodyless POST/PUT, which would make ASP.NET Core return 400.
  addToCart: (id: number) =>
    api.post<ApiEnvelope<null>>('/Cart/add-product-to-cart', undefined, { params: { id } }),

  increase: (id: number) =>
    api.put<ApiEnvelope<null>>('/Cart/increase-product-in-cart', undefined, { params: { id } }),

  reduce: (id: number) =>
    api.put<ApiEnvelope<null>>('/Cart/reduce-product-in-cart', undefined, { params: { id } }),

  remove: (id: number) =>
    api.delete<ApiEnvelope<null>>('/Cart/delete-product-from-cart', { params: { id } }),

  clear: () =>
    api.delete<ApiEnvelope<null>>('/Cart/clear-cart'),
}
