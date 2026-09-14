import { CheckCircle, AlertTriangle, XCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import type { ChecklistItemResponse } from '@/lib/types'

function statusBadgeTone(status: ChecklistItemResponse['status']): 'success' | 'warning' | 'danger' {
  switch (status) {
    case 'OK':
      return 'success'
    case 'PARCIAL':
      return 'warning'
    case 'AUSENTE':
      return 'danger'
  }
}

function statusLabel(status: ChecklistItemResponse['status']): string {
  switch (status) {
    case 'OK':
      return 'OK'
    case 'PARCIAL':
      return 'Parcial'
    case 'AUSENTE':
      return 'Ausente'
  }
}

function StatusIcon({ status }: { status: ChecklistItemResponse['status'] }) {
  switch (status) {
    case 'OK':
      return <CheckCircle size={17} style={{ color: 'var(--success)', flexShrink: 0 }} />
    case 'PARCIAL':
      return <AlertTriangle size={17} style={{ color: 'var(--warning)', flexShrink: 0 }} />
    case 'AUSENTE':
      return <XCircle size={17} style={{ color: 'var(--danger)', flexShrink: 0 }} />
  }
}

type ChecklistItemCardProps = {
  label: string
  item: ChecklistItemResponse
}

export function ChecklistItemCard({ label, item }: ChecklistItemCardProps) {
  return (
    <div className="card card-p" style={!item.aplicavel ? { opacity: 0.55 } : undefined}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', marginBottom: '0.55rem', flexWrap: 'wrap' }}>
        <StatusIcon status={item.status} />
        <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', flex: 1 }}>{label}</h4>
        <Badge tone={statusBadgeTone(item.status)}>{statusLabel(item.status)}</Badge>
      </div>
      <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>{item.comentario}</p>
    </div>
  )
}
