import { WifiOff } from 'lucide-react'

interface NetworkErrorProps {
  onRetry?: () => void
  message?: string
}

export function NetworkError({ onRetry, message = 'Failed to load. Check your connection.' }: NetworkErrorProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#FFF3F3]">
        <WifiOff className="h-7 w-7 text-primary" />
      </div>
      <div>
        <p className="text-base font-medium text-foreground">Network Error</p>
        <p className="mt-1 text-sm text-[#8D8D8D]">{message}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="rounded-[4px] bg-primary px-6 py-2.5 text-sm font-medium text-white hover:opacity-90"
        >
          Try again
        </button>
      )}
    </div>
  )
}
