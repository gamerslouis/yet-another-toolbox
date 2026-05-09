import type { Tool } from '@/types'

interface ToolIconProps {
  icon: Tool['icon']
  className?: string
  iconClassName?: string
}

export function ToolIcon({ icon, className, iconClassName }: ToolIconProps) {
  if (typeof icon === 'string') {
    return <span className={className}>{icon}</span>
  }
  const Icon = icon
  return (
    <span className={className}>
      <Icon className={iconClassName ?? 'size-4'} />
    </span>
  )
}
