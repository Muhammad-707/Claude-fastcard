import type { ReactNode } from 'react'

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
      {icon && (
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#F5F5F5] text-[#8D8D8D]">
          {icon}
        </div>
      )}
      <div>
        <p className="text-base font-medium text-foreground">{title}</p>
        {description && <p className="mt-1 text-sm text-[#8D8D8D]">{description}</p>}
      </div>
      {action}
    </div>
  )
}
