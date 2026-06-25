const BASE = import.meta.env.VITE_API_BASE_URL as string

// Reliable product placeholder from Unsplash (electronics/product neutral)
const PLACEHOLDER = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=60'

export function getImageUrl(fileName: string | undefined | null): string {
  if (!fileName) return PLACEHOLDER
  if (fileName.startsWith('http')) return fileName
  return `${BASE}/images/${fileName}`
}

export { PLACEHOLDER as IMAGE_PLACEHOLDER }
