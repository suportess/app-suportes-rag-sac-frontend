'use client'

import { useSidebar } from './sidebar-context'
import { Menu, ShieldCheck } from 'lucide-react'

export function Topbar() {
  const { setOpen } = useSidebar()

  return (
    <header
      className="md:hidden sticky top-0 z-30 flex items-center gap-3 px-4 border-b flex-shrink-0"
      style={{
        height: '2.75rem',
        background: 'var(--d2b-topbar-bg)',
        borderColor: 'var(--d2b-border)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}
    >
      {/* So existe no mobile (onde a sidebar vira drawer) - em desktop nao ha conteudo de
          header ainda (reservado pra acoes futuras: perfil/config/ajuda/ambiente), entao o
          header inteiro fica oculto em vez de mostrar uma barra vazia com linha divisoria. */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setOpen(true)}
          className="p-2 rounded-lg transition-colors flex-shrink-0"
          style={{ color: 'var(--d2b-text-secondary)' }}
          aria-label="Abrir menu"
        >
          <Menu size={18} />
        </button>
        <ShieldCheck
          size={16}
          className="flex-shrink-0"
          style={{ color: 'var(--brand)' }}
        />
      </div>
    </header>
  )
}
