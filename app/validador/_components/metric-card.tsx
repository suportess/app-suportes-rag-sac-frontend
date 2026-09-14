import type { ReactNode } from 'react'

type MetricCardProps = {
  icon: ReactNode
  iconColor: string
  value: ReactNode
  valueColor?: string
  label: string
}

export function MetricCard({ icon, iconColor, value, valueColor, label }: MetricCardProps) {
  return (
    <div className="kpi-card">
      <div className="kpi-icon" style={{ color: iconColor }}>
        {icon}
      </div>
      <div className="kpi-value" style={valueColor ? { color: valueColor } : undefined}>
        {value}
      </div>
      <div className="kpi-label">{label}</div>
    </div>
  )
}
