export interface ApiEnvelope<T> {
  data: T | null
  errors: string[]
  statusCode: number
}

export interface Paginated<T> {
  pageNumber: number
  pageSize: number
  totalPage: number
  totalRecord: number
  data: T[]
  errors: string[]
  statusCode: number
}

export interface Brand { id: number; brandName: string }
export interface Color { id: number; colorName: string }
export interface SubCategory { id: number; subCategoryName: string }
export interface Category {
  id: number
  categoryName: string
  categoryImage: string
  subCategories: SubCategory[]
}
export interface ProductImage { id: number; images: string; imageName?: string }
export interface Product {
  id: number
  productName: string
  description?: string
  price: number
  hasDiscount: boolean
  discountPrice?: number
  quantity: number
  code?: string
  weight?: string
  size?: string
  brandId?: number
  brandName?: string
  colorId?: number
  colorName?: string
  color?: string
  subCategoryId?: number
  categoryId?: number
  categoryName?: string
  image?: string
  images?: ProductImage[]
  productInMyCart?: boolean
  productInfoFromCart?: unknown
}
export interface CartItem {
  productId: number
  product: Product
  quantity: number
}
export interface AuthUser {
  id: string
  userName: string
  email: string
  role: 'User' | 'Admin'
}
export interface UserProfile {
  id: string
  firstName: string
  lastName: string
  email: string
  phoneNumber: string
  dob: string
  image?: string
}

export interface UpdateProfileDto {
  firstName: string
  lastName: string
  email: string
  phoneNumber?: string
  dob?: string
}

export interface LoginDto { userName: string; password: string }
export interface RegisterDto {
  userName: string
  phoneNumber: string
  email: string
  password: string
  confirmPassword: string
}

// Matches Swagger: ProductName, MinPrice, MaxPrice, BrandId, ColorId, CategoryId, SubcategoryId, PageNumber, PageSize
export interface ProductFilters {
  userId?: string
  productName?: string
  minPrice?: number
  maxPrice?: number
  brandId?: number
  colorId?: number
  categoryId?: number
  subcategoryId?: number
  pageNumber?: number
  pageSize?: number
}
