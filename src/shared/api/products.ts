import api from './axios'
import type { Paginated, ApiEnvelope, Product, ProductFilters } from './types'

export const productsApi = {
  getProducts: (filters: ProductFilters) => {
    const params: Record<string, unknown> = {}
    if (filters.userId)       params['UserId']        = filters.userId
    if (filters.productName)  params['ProductName']   = filters.productName
    if (filters.minPrice != null) params['MinPrice']  = filters.minPrice
    if (filters.maxPrice != null) params['MaxPrice']  = filters.maxPrice
    if (filters.brandId)      params['BrandId']       = filters.brandId
    if (filters.colorId)      params['ColorId']       = filters.colorId
    if (filters.categoryId)   params['CategoryId']    = filters.categoryId
    if (filters.subcategoryId) params['SubcategoryId'] = filters.subcategoryId
    if (filters.pageNumber)   params['PageNumber']    = filters.pageNumber
    if (filters.pageSize)     params['PageSize']      = filters.pageSize
    return api.get<Paginated<Product>>('/Product/get-products', { params })
  },

  getProductById: (id: number) =>
    api.get<ApiEnvelope<Product>>('/Product/get-product-by-id', { params: { id } }),
}
