import { FileText, X } from 'lucide-react'

type FileRowProps = {
  name: string
  size: string
  trailing?: React.ReactNode
  onRemove?: () => void
  removeDisabled?: boolean
  removeLabel?: string
}

export function FileRow({ name, size, trailing, onRemove, removeDisabled, removeLabel = 'Remover arquivo' }: FileRowProps) {
  return (
    <div className="file-row">
      <FileText size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
      <span className="file-row-name">{name}</span>
      <span className="file-row-size">{size}</span>
      {trailing}
      {onRemove && (
        <button
          className="btn btn-ghost btn-sm"
          type="button"
          onClick={onRemove}
          disabled={removeDisabled}
          aria-label={removeLabel}
        >
          <X size={14} />
        </button>
      )}
    </div>
  )
}
