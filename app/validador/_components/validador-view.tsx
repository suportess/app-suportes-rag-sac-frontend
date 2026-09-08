'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import {
  UploadCloud,
  FileText,
  X,
  Loader2,
  AlertTriangle,
  CheckCircle,
  ChevronDown,
  Plus,
} from 'lucide-react'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import type { DocumentResponse, PageResponse, ValidationReportResponse } from '@/lib/types'
import { ReportDisplay } from './report-display'

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const ACCEPTED_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]
const ACCEPTED_EXTENSIONS = ['.pdf', '.docx']

export function ValidadorView() {
  const [efFile, setEfFile] = useState<File | null>(null)
  const [documentosComplementares, setDocumentosComplementares] = useState<File[]>([])
  const [historyDocuments, setHistoryDocuments] = useState<DocumentResponse[]>([])
  const [historyLoading, setHistoryLoading] = useState(false)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [selectedHistoryDocumentId, setSelectedHistoryDocumentId] = useState<number | null>(null)
  const [dragging, setDragging] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [report, setReport] = useState<ValidationReportResponse | null>(null)
  const efInputRef = useRef<HTMLInputElement>(null)
  const complementaryInputRef = useRef<HTMLInputElement>(null)
  const historyDropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchHistory = async () => {
      setHistoryLoading(true)
      try {
        const response = await api.get<PageResponse<DocumentResponse>>(
          '/api/v1/documents/complementary-documents?page=0&size=200&sort=createdAt,desc'
        )
        setHistoryDocuments(response.content)
      } catch {
        setHistoryDocuments([])
      } finally {
        setHistoryLoading(false)
      }
    }

    fetchHistory()
  }, [])

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (!historyDropdownRef.current?.contains(event.target as Node)) {
        setHistoryOpen(false)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    return () => document.removeEventListener('mousedown', handlePointerDown)
  }, [])

  const isAccepted = (f: File) => {
    if (ACCEPTED_TYPES.includes(f.type)) return true
    const ext = f.name.substring(f.name.lastIndexOf('.')).toLowerCase()
    return ACCEPTED_EXTENSIONS.includes(ext)
  }

  const handleEfFile = useCallback((f: File) => {
    if (!isAccepted(f)) {
      toast.error('Formato inválido. Selecione um arquivo PDF ou DOCX.')
      return
    }
    setEfFile(f)
    setError(null)
    setReport(null)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragging(false)
      const dropped = e.dataTransfer.files[0]
      if (dropped) handleEfFile(dropped)
    },
    [handleEfFile]
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
  }, [])

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selected = e.target.files?.[0]
      if (selected) handleEfFile(selected)
    },
    [handleEfFile]
  )

  const clearEfFile = useCallback(() => {
    setEfFile(null)
    setReport(null)
    setError(null)
    if (efInputRef.current) efInputRef.current.value = ''
  }, [])

  const handleComplementaryInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selected = Array.from(e.target.files ?? [])
      if (selected.length === 0) return

      const validFiles: File[] = []
      for (const selectedFile of selected) {
        if (!isAccepted(selectedFile)) {
          toast.error(`Formato inválido para ${selectedFile.name}. Use PDF ou DOCX.`)
          continue
        }
        validFiles.push(selectedFile)
      }

      if (validFiles.length > 0) {
        setDocumentosComplementares((prev) => [...prev, ...validFiles])
      }

      if (complementaryInputRef.current) {
        complementaryInputRef.current.value = ''
      }
    },
    []
  )

  const removeComplementaryFile = useCallback((index: number) => {
    setDocumentosComplementares((prev) => prev.filter((_, i) => i !== index))
  }, [])

  const clearSelectedHistoryDocument = useCallback(() => {
    setSelectedHistoryDocumentId(null)
    setHistoryOpen(false)
  }, [])

  const selectedHistoryDocument = selectedHistoryDocumentId == null
    ? null
    : historyDocuments.find((doc) => doc.id === selectedHistoryDocumentId) ?? null

  const hasHistory = historyDocuments.length > 0

  const handleValidate = useCallback(async () => {
    if (!efFile) return

    const selectedIds = selectedHistoryDocument ? [selectedHistoryDocument.id] : undefined

    setLoading(true)
    setError(null)
    setReport(null)
    try {
      const result = await api.upload<ValidationReportResponse>(
        '/api/v1/documents/validate',
        efFile,
        {
          documentosComplementares,
          complementaryDocumentIds: selectedIds,
        }
      )
      setReport(result)
      toast.success('Validação concluída com sucesso!')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao validar o documento.'
      setError(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }, [documentosComplementares, efFile, selectedHistoryDocument])

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Validador de Especificações Funcionais</h1>
        <p className="page-subtitle">
          Envie sua especificação funcional para validação automática por IA
        </p>
      </div>

      {/* Upload Section */}
      <div className="card card-p" style={{ marginBottom: '1.5rem' }}>
        <input
          ref={efInputRef}
          type="file"
          accept=".pdf,.docx"
          onChange={handleInputChange}
          style={{ display: 'none' }}
        />
        <input
          ref={complementaryInputRef}
          type="file"
          accept=".pdf,.docx"
          multiple
          onChange={handleComplementaryInputChange}
          style={{ display: 'none' }}
        />

        <div
          style={{
            border: '1px solid color-mix(in srgb, var(--brand-light) 22%, var(--d2b-border))',
            borderRadius: '0.75rem',
            padding: '1rem',
            background: 'color-mix(in srgb, var(--bg-card) 82%, var(--brand-muted))',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <p style={{ margin: 0, color: 'var(--text-primary)', fontWeight: 700 }}>Especificação Funcional (EF)</p>
            <span className="badge badge-success">Obrigatório</span>
          </div>

          {!efFile ? (
            <div
              role="button"
              tabIndex={0}
              onClick={() => efInputRef.current?.click()}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') efInputRef.current?.click()
              }}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              style={{
                border: `1px solid ${dragging ? 'var(--brand-border-strong)' : 'var(--d2b-border)'}`,
                borderRadius: '0.65rem',
                padding: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                cursor: 'pointer',
                justifyContent: 'flex-start',
                backgroundColor: dragging ? 'var(--brand-muted)' : 'transparent',
                transition: 'all 0.2s ease',
              }}
            >
              <UploadCloud size={18} style={{ color: 'var(--brand)' }} />
              <p style={{ margin: 0, color: 'var(--text-primary)', fontWeight: 600 }}>
                Selecione um arquivo PDF ou DOCX
              </p>
            </div>
          ) : (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.85rem 0.95rem',
                border: '1px solid var(--d2b-border)',
                borderRadius: '0.65rem',
              }}
            >
              <FileText size={22} style={{ color: 'var(--brand)', flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p
                  style={{
                    margin: 0,
                    fontWeight: 500,
                    color: 'var(--text-primary)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {efFile.name}
                </p>
                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {formatFileSize(efFile.size)}
                </p>
              </div>
              <button
                className="btn btn-ghost btn-sm"
                onClick={clearEfFile}
                disabled={loading}
                aria-label="Remover arquivo"
              >
                <X size={18} />
              </button>
            </div>
          )}

          <div
            style={{
              marginTop: '1rem',
              border: '1px solid color-mix(in srgb, var(--brand-light) 22%, var(--d2b-border))',
              borderRadius: '0.6rem',
              padding: '0.85rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
              <p style={{ margin: 0, color: 'var(--text-primary)', fontWeight: 500 }}>
                Documentos complementares
              </p>
              <span className="badge badge-warning">Opcional</span>
            </div>

            <div style={{ marginTop: '0.65rem', display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
              <div ref={historyDropdownRef} style={{ flex: 1, position: 'relative' }}>
                <button
                  className="btn btn-secondary"
                  type="button"
                  onClick={() => {
                    if (hasHistory) {
                      setHistoryOpen((prev) => !prev)
                    }
                  }}
                  disabled={loading || historyLoading || !hasHistory}
                  aria-expanded={historyOpen}
                  aria-haspopup="listbox"
                  style={{
                    width: '100%',
                    justifyContent: 'space-between',
                    minHeight: '3.1rem',
                    paddingInline: '0.95rem',
                    borderRadius: historyOpen ? '0.7rem 0.7rem 0 0' : '0.7rem',
                  }}
                >
                  <span
                    style={{
                      color: selectedHistoryDocument ? 'var(--text-primary)' : 'var(--text-muted)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      textAlign: 'left',
                      flex: 1,
                    }}
                  >
                    {historyLoading
                      ? 'Carregando histórico...'
                      : selectedHistoryDocument
                        ? selectedHistoryDocument.originalFileName
                        : hasHistory
                          ? 'Selecione um documento complementar...'
                          : 'Nenhum documento complementar disponível'}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginLeft: '0.75rem' }}>
                    {selectedHistoryDocument && (
                      <span
                        role="button"
                        tabIndex={0}
                        onClick={(event) => {
                          event.stopPropagation()
                          clearSelectedHistoryDocument()
                        }}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault()
                            event.stopPropagation()
                            clearSelectedHistoryDocument()
                          }
                        }}
                        aria-label="Desmarcar documento do histórico"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '1.5rem',
                          height: '1.5rem',
                          borderRadius: '999px',
                          color: 'var(--text-muted)',
                        }}
                      >
                        <X size={14} />
                      </span>
                    )}
                    <ChevronDown
                      size={16}
                      style={{
                        transform: historyOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.2s ease',
                      }}
                    />
                  </span>
                </button>

                {historyOpen && hasHistory && (
                  <div
                    role="listbox"
                    style={{
                      position: 'absolute',
                      top: 'calc(100% - 1px)',
                      left: 0,
                      right: 0,
                      zIndex: 20,
                      border: '1px solid var(--d2b-border)',
                      borderTop: 'none',
                      borderRadius: '0 0 0.7rem 0.7rem',
                      background: 'var(--bg-card)',
                      boxShadow: '0 12px 24px rgba(0, 0, 0, 0.18)',
                      overflow: 'hidden',
                      maxHeight: '15rem',
                      overflowY: 'auto',
                    }}
                  >
                    {historyDocuments.map((doc, idx) => {
                      const isSelected = doc.id === selectedHistoryDocumentId
                      return (
                        <button
                          key={doc.id}
                          type="button"
                          onClick={() => {
                            setSelectedHistoryDocumentId(doc.id)
                            setHistoryOpen(false)
                          }}
                          className="btn btn-ghost"
                          style={{
                            width: '100%',
                            justifyContent: 'space-between',
                            borderRadius: 0,
                            padding: '0.8rem 0.95rem',
                            borderBottom: idx < historyDocuments.length - 1 ? '1px solid var(--d2b-border)' : 'none',
                            background: isSelected ? 'color-mix(in srgb, var(--brand-muted) 45%, var(--bg-card))' : 'var(--bg-card)',
                          }}
                        >
                          <span
                            style={{
                              color: 'var(--text-primary)',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              textAlign: 'left',
                              flex: 1,
                            }}
                          >
                            {doc.originalFileName}
                          </span>
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginLeft: '0.75rem' }}>
                            {formatFileSize(doc.fileSize)}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>

              <button
                className="btn btn-secondary"
                type="button"
                onClick={() => complementaryInputRef.current?.click()}
                disabled={loading}
              >
                <Plus size={16} />
                <span>Novo arquivo</span>
              </button>
            </div>

            <p style={{ margin: '0.55rem 0 0', color: 'var(--text-muted)', fontSize: '0.84rem' }}>
              Se houver histórico, selecione um documento já carregado no sistema. Ou use Novo arquivo para anexar do computador.
            </p>

            {documentosComplementares.length > 0 && (
              <div style={{ marginTop: '0.65rem', display: 'grid', gap: '0.45rem' }}>
                {documentosComplementares.map((compFile, index) => (
                  <div
                    key={`${compFile.name}-${index}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.55rem',
                      border: '1px solid var(--d2b-border)',
                      borderRadius: '0.45rem',
                      padding: '0.5rem 0.6rem',
                    }}
                  >
                    <FileText size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                    <span style={{ color: 'var(--text-primary)', flex: 1 }}>{compFile.name}</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                      {formatFileSize(compFile.size)}
                    </span>
                    <button
                      className="btn btn-ghost btn-sm"
                      type="button"
                      onClick={() => removeComplementaryFile(index)}
                      disabled={loading}
                      aria-label="Remover documento complementar"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
          <button
            className="btn"
            onClick={handleValidate}
            disabled={!efFile || loading}
            style={{ background: 'var(--brand-light)', color: '#fff', fontWeight: 700, padding: '0.65rem 1.25rem' }}
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span style={{ marginLeft: '0.5rem' }}>Validando...</span>
              </>
            ) : (
              'Validar Especificação'
            )}
          </button>
        </div>

        </div>
      </div>

      <div className="card-disclaimer">
        <p className="title-disclaimer">Aviso Importante!</p>
        <p className="text-disclaimer">
          Não utilizar documentos que contenham dados reais do cliente.
        </p>
      </div>

      {/* Loading state */}
      {loading && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '3rem',
            gap: '1rem',
          }}
        >
          <Loader2 size={40} className="animate-spin" style={{ color: 'var(--clr-brand)' }} />
          <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
            Analisando especificação... Isso pode levar até 60 segundos.
          </p>
          <div className="progress-bar" style={{ width: '100%', maxWidth: 400 }}>
            <div
              className="progress-fill"
              style={{
                width: '60%',
                animation: 'indeterminate 2s ease-in-out infinite',
              }}
            />
          </div>
        </div>
      )}

      {/* Error state */}
      {error && !loading && (
        <div className="alert alert-danger" style={{ marginBottom: '1.5rem' }}>
          <AlertTriangle size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* Report */}
      {report && !loading && (
        <div>
          <div className="divider" />
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <CheckCircle size={24} style={{ color: 'var(--clr-success)' }} />
            <h2 style={{ margin: 0, color: 'var(--text-primary)' }}>Relatório de Validação</h2>
          </div>
          <ReportDisplay report={report} />
        </div>
      )}
    </div>
  )
}
