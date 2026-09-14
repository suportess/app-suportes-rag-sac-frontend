import type { PontoCriticoResponse } from '@/lib/types'

export function CriticalPointCard({ ponto }: { ponto: PontoCriticoResponse }) {
  return (
    <div className="card card-p" style={{ borderLeft: '3px solid var(--danger)' }}>
      <h4 style={{ margin: '0 0 0.6rem 0', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>{ponto.gap}</h4>
      <div style={{ padding: '0.75rem 1rem', borderRadius: '0.625rem', backgroundColor: 'var(--bg-elevated)' }}>
        <p
          style={{
            margin: '0 0 0.3rem',
            fontSize: '0.7rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: 'var(--danger)',
          }}
        >
          Impacto
        </p>
        <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{ponto.impacto}</p>
      </div>
    </div>
  )
}
