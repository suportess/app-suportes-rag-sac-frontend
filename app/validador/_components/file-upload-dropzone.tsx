import { UploadCloud } from 'lucide-react'

type FileUploadDropzoneProps = {
  label: string
  helper: string
  dragging: boolean
  onClick: () => void
  onDrop: (e: React.DragEvent) => void
  onDragOver: (e: React.DragEvent) => void
  onDragLeave: (e: React.DragEvent) => void
}

export function FileUploadDropzone({
  label,
  helper,
  dragging,
  onClick,
  onDrop,
  onDragOver,
  onDragLeave,
}: FileUploadDropzoneProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onClick()
      }}
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      className={dragging ? 'dropzone dragging' : 'dropzone'}
    >
      <UploadCloud size={24} />
      <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>{label}</span>
      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{helper}</span>
    </div>
  )
}
