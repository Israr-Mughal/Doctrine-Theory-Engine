import type { ReactNode } from 'react'

export type BadgeVariant = 'neutral' | 'success' | 'warning' | 'danger' | 'info'

const variantStyles: Record<BadgeVariant, string> = {
  neutral: 'bg-slate-100 text-slate-700 ring-slate-200',
  success: 'bg-emerald-50 text-emerald-800 ring-emerald-200',
  warning: 'bg-amber-50 text-amber-900 ring-amber-200',
  danger: 'bg-red-50 text-red-800 ring-red-200',
  info: 'bg-sky-50 text-sky-800 ring-sky-200',
}

interface StatusBadgeProps {
  children: ReactNode
  variant?: BadgeVariant
  size?: 'sm' | 'md' | 'lg'
}

export function StatusBadge({
  children,
  variant = 'neutral',
  size = 'sm',
}: StatusBadgeProps) {
  const sizeClass =
    size === 'lg'
      ? 'px-3 py-1 text-sm'
      : size === 'md'
        ? 'px-2.5 py-0.5 text-xs'
        : 'px-2 py-0.5 text-xs'

  return (
    <span
      className={`inline-flex max-w-full items-center rounded-full font-semibold ring-1 ring-inset ${sizeClass} ${variantStyles[variant]}`}
    >
      <span className="truncate">{children}</span>
    </span>
  )
}
