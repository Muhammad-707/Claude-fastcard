const BASE = import.meta.env.VITE_API_BASE_URL as string

export function getImageUrl(fileName: string | undefined): string {
  if (!fileName) return '/placeholder.png'
  if (fileName.startsWith('http')) return fileName
  return `${BASE}/images/${fileName}`
}
