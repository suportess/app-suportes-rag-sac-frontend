import { Loader2 } from 'lucide-react'

type LoadingStateProps = {
  message: string
  helperText?: string
  compact?: boolean
}

export function LoadingState({ message, helperText, compact }: LoadingStateProps) {
  if (compact) {
    return (
      <div className="card card-p" style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
        <Loader2 size={20} className="animate-spin" style={{ color: 'var(--brand)', flexShrink: 0 }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ margin: 0, fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-primary)' }}>{message}</p>
          {helperText && (
            <p style={{ margin: '0.15rem 0 0', fontSize: '0.78rem', color: 'var(--text-muted)' }}>{helperText}</p>
          )}
        </div>
        <div className="progress-bar" style={{ width: '140px', flexShrink: 0 }}>
          <div className="progress-fill" style={{ width: '40%', animation: 'indeterminate 2s ease-in-out infinite' }} />
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '3rem', gap: '1rem' }}>
      <Loader2 size={40} className="animate-spin" style={{ color: 'var(--brand)' }} />
      <p style={{ color: 'var(--text-secondary)', margin: 0, textAlign: 'center' }}>{message}</p>
      {helperText && <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.8125rem', textAlign: 'center' }}>{helperText}</p>}
    </div>
  )
}
