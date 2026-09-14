import type { ReactNode } from 'react'

type SectionCardProps = {
  icon: ReactNode
  title: string
  badge?: ReactNode
  trailing?: ReactNode
  children: ReactNode
}

export function SectionCard({ icon, title, badge, trailing, children }: SectionCardProps) {
  return (
    <div className="card card-p">
      <div className="section-card-head">
        <span style={{ color: 'var(--brand)', display: 'flex', flexShrink: 0 }}>{icon}</span>
        <h3>{title}</h3>
        {badge}
        {trailing && <span style={{ marginLeft: 'auto' }}>{trailing}</span>}
      </div>
      {children}
    </div>
  )
}
