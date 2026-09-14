export type BadgeTone = 'brand' | 'success' | 'warning' | 'danger' | 'purple' | 'info' | 'muted'

const TONE_CLASS: Record<BadgeTone, string> = {
  brand: 'badge-brand',
  success: 'badge-success',
  warning: 'badge-warning',
  danger: 'badge-danger',
  purple: 'badge-purple',
  info: 'badge-info',
  muted: 'badge-muted',
}

type BadgeProps = {
  tone: BadgeTone
  children: React.ReactNode
  className?: string
}

export function Badge({ tone, children, className }: BadgeProps) {
  const classes = className ? `badge ${TONE_CLASS[tone]} ${className}` : `badge ${TONE_CLASS[tone]}`
  return <span className={classes}>{children}</span>
}
