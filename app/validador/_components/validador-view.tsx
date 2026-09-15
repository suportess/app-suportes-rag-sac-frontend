'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import {
  FileText,
  Loader2,
  AlertTriangle,
  CheckCircle,
  ChevronDown,
  Plus,
  Check,
  RefreshCw,
  X,
  Lock,
  FileCheck2,
  ArrowRight,
  Search,
} from 'lucide-react'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import { Badge } from '@/components/ui/badge'
import { LoadingState } from '@/components/ui/loading-state'
import type { DocumentResponse, PageResponse, ValidationReportResponse } from '@/lib/types'
import { ReportDisplay } from './report-display'
import { SectionCard } from './section-card'
import { FileUploadDropzone } from './file-upload-dropzone'
import { FileRow } from './file-row'

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

// Documento complementar (proposta tecnica) aceita tambem apresentacoes - EF continua so PDF/DOCX
const ACCEPTED_TYPES_COMPLEMENTARY = [
  ...ACCEPTED_TYPES,
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.ms-powerpoint',
]
const ACCEPTED_EXTENSIONS_COMPLEMENTARY = [...ACCEPTED_EXTENSIONS, '.ppt', '.pptx']

type ComplementaryUploadStatus = 'pendente' | 'enviando' | 'enviado' | 'erro'

type ComplementaryUploadItem = {
  id: string
  file: File
  status: ComplementaryUploadStatus
  documentId?: number
  errorMessage?: string
}

function createUploadItem(file: File): ComplementaryUploadItem {
  const id = typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${file.name}-${file.size}-${Date.now()}-${Math.random()}`
  return { id, file, status: 'pendente' }
}

function complementaryStatusTone(status: ComplementaryUploadStatus): 'info' | 'purple' | 'success' | 'danger' {
  switch (status) {
    case 'pendente':
      return 'info'
    case 'enviando':
      return 'purple'
    case 'enviado':
      return 'success'
    case 'erro':
      return 'danger'
  }
}

function complementaryStatusLabel(status: ComplementaryUploadStatus): string {
  switch (status) {
    case 'pendente':
      return 'Pendente'
    case 'enviando':
      return 'Enviando...'
    case 'enviado':
      return 'Enviado'
    case 'erro':
      return 'Erro'
  }
}

export function ValidadorView() {
  const [efFile, setEfFile] = useState<File | null>(null)
  const [newComplementaryUploads, setNewComplementaryUploads] = useState<ComplementaryUploadItem[]>([])
  const [historyDocuments, setHistoryDocuments] = useState<DocumentResponse[]>([])
  const [historyTotalElements, setHistoryTotalElements] = useState(0)
  const [historyLoading, setHistoryLoading] = useState(false)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [historySearchQuery, setHistorySearchQuery] = useState('')
  const [selectedHistoryDocumentIds, setSelectedHistoryDocumentIds] = useState<number[]>([])
  const [dragging, setDragging] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [report, setReport] = useState<ValidationReportResponse | null>(null)
  const efInputRef = useRef<HTMLInputElement>(null)
  const complementaryInputRef = useRef<HTMLInputElement>(null)
  const historyDropdownRef = useRef<HTMLDivElement>(null)
  const historySearchInputRef = useRef<HTMLInputElement>(null)

  const HISTORY_PAGE_SIZE = 20

  // Busca no servidor em vez de carregar tudo de uma vez (nao escala se o historico passar de
  // algumas dezenas de documentos) - debounce de 300ms pra nao disparar 1 requisicao por tecla.
  useEffect(() => {
    const timer = setTimeout(async () => {
      setHistoryLoading(true)
      try {
        const params = new URLSearchParams({
          page: '0',
          size: String(HISTORY_PAGE_SIZE),
          sort: 'createdAt,desc',
        })
        if (historySearchQuery.trim()) {
          params.set('search', historySearchQuery.trim())
        }
        const response = await api.get<PageResponse<DocumentResponse>>(
          `/api/v1/documents/complementary-documents?${params.toString()}`
        )
        setHistoryDocuments(response.content)
        setHistoryTotalElements(response.totalElements)
      } catch {
        setHistoryDocuments([])
        setHistoryTotalElements(0)
      } finally {
        setHistoryLoading(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [historySearchQuery])

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

  const isAcceptedComplementary = (f: File) => {
    if (ACCEPTED_TYPES_COMPLEMENTARY.includes(f.type)) return true
    const ext = f.name.substring(f.name.lastIndexOf('.')).toLowerCase()
    return ACCEPTED_EXTENSIONS_COMPLEMENTARY.includes(ext)
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

  const uploadOneComplementary = useCallback(async (item: ComplementaryUploadItem) => {
    setNewComplementaryUploads((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, status: 'enviando', errorMessage: undefined } : i))
    )
    try {
      const result = await api.uploadComplementary(item.file)
      setNewComplementaryUploads((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, status: 'enviado', documentId: result.id } : i))
      )
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao enviar documento.'
      setNewComplementaryUploads((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, status: 'erro', errorMessage: msg } : i))
      )
      toast.error(`"${item.file.name}": ${msg}`)
    }
  }, [])

  const handleComplementaryInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selected = Array.from(e.target.files ?? [])
      if (selected.length === 0) return

      // Decisao de produto (2026-09-15): 1 EF aceita no maximo 1 documento complementar, seja do
      // historico ou novo upload - os dois compartilham a mesma "vaga".
      if (selectedHistoryDocumentIds.length + newComplementaryUploads.length >= 1) {
        toast.error('Só é permitido 1 documento complementar. Remova o já selecionado antes de adicionar outro.')
        if (complementaryInputRef.current) {
          complementaryInputRef.current.value = ''
        }
        return
      }

      // Checagem otimista client-side (evita round-trip quando o nome ja esta visivel na tela) -
      // so cobre o que esta carregado agora (historico e paginado/buscado, nao é mais a lista
      // inteira). A garantia de verdade é no backend (DocumentService.uploadComplementary), que
      // sempre tem o dado completo.
      const existingNames = new Set([
        ...historyDocuments.map((doc) => doc.originalFileName),
        ...newComplementaryUploads.map((item) => item.file.name),
      ])

      const validItems: ComplementaryUploadItem[] = []
      for (const selectedFile of selected) {
        if (!isAcceptedComplementary(selectedFile)) {
          toast.error(`Formato inválido para ${selectedFile.name}. Use PDF, DOCX ou PPT/PPTX.`)
          continue
        }
        if (existingNames.has(selectedFile.name)) {
          toast.error(
            `Já existe um documento complementar chamado "${selectedFile.name}". Renomeie o arquivo ou selecione o já existente no histórico.`
          )
          continue
        }
        existingNames.add(selectedFile.name)
        validItems.push(createUploadItem(selectedFile))
      }

      if (validItems.length > 0) {
        setNewComplementaryUploads((prev) => [...prev, ...validItems])
        validItems.forEach((item) => uploadOneComplementary(item))
      }

      if (complementaryInputRef.current) {
        complementaryInputRef.current.value = ''
      }
    },
    [historyDocuments, newComplementaryUploads, selectedHistoryDocumentIds, uploadOneComplementary]
  )

  const removeComplementaryUpload = useCallback((id: string) => {
    setNewComplementaryUploads((prev) => prev.filter((i) => i.id !== id))
  }, [])

  const retryComplementaryUpload = useCallback(
    (id: string) => {
      const item = newComplementaryUploads.find((i) => i.id === id)
      if (!item) return
      uploadOneComplementary(item)
    },
    [newComplementaryUploads, uploadOneComplementary]
  )

  const toggleHistoryDocument = useCallback(
    (id: number) => {
      setSelectedHistoryDocumentIds((prev) => {
        if (prev.includes(id)) {
          return []
        }
        // Mesma "vaga" compartilhada com upload de arquivo novo - ver handleComplementaryInputChange.
        if (newComplementaryUploads.length > 0) {
          toast.error('Só é permitido 1 documento complementar. Remova o já selecionado antes de escolher outro do histórico.')
          return prev
        }
        return [id]
      })
    },
    [newComplementaryUploads]
  )

  const openHistoryDropdown = useCallback(() => {
    setHistoryOpen(true)
    setTimeout(() => historySearchInputRef.current?.focus(), 0)
  }, [])

  const hasMoreHistoryResults = historyTotalElements > historyDocuments.length
  const complementaryUploadsBusy = newComplementaryUploads.some(
    (i) => i.status === 'pendente' || i.status === 'enviando'
  )

  const handleValidate = useCallback(async () => {
    if (!efFile) return

    const complementaryDocumentIds = [
      ...selectedHistoryDocumentIds,
      ...newComplementaryUploads
        .filter((i) => i.status === 'enviado' && i.documentId != null)
        .map((i) => i.documentId as number),
    ]

    setLoading(true)
    setError(null)
    setReport(null)
    try {
      const result = await api.upload<ValidationReportResponse>(
        '/api/v1/documents/validate',
        efFile,
        {
          complementaryDocumentIds: complementaryDocumentIds.length > 0 ? complementaryDocumentIds : undefined,
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
  }, [efFile, newComplementaryUploads, selectedHistoryDocumentIds])

  return (
    <div className="page">
      <div>
        <div className="page-header">
          <div>
            <h1 className="page-title">Validar Especificação Funcional</h1>
            <p className="page-subtitle">
              Envie uma EF para validar sua qualidade e, opcionalmente, um documento complementar para
              analisar aderência ao escopo.
            </p>
          </div>
        </div>
        <div className="privacy-note" style={{ marginTop: '0.65rem' }}>
          <Lock size={14} />
          Privacidade: utilize apenas documentos sem dados reais de cliente.
        </div>
      </div>

      {/* Upload Section */}
      <div className="card card-p" style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
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
          accept=".pdf,.docx,.ppt,.pptx"
          onChange={handleComplementaryInputChange}
          style={{ display: 'none' }}
        />

        <SectionCard
          icon={<FileCheck2 size={18} />}
          title="Especificação Funcional"
          badge={<Badge tone="brand">Obrigatório</Badge>}
        >
          {!efFile ? (
            <FileUploadDropzone
              label="Arraste o arquivo aqui ou selecione do computador"
              helper="PDF ou DOCX"
              dragging={dragging}
              onClick={() => efInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            />
          ) : (
            <FileRow
              name={efFile.name}
              size={formatFileSize(efFile.size)}
              onRemove={clearEfFile}
              removeDisabled={loading}
            />
          )}
        </SectionCard>

        <SectionCard
          icon={<FileText size={18} />}
          title="Documento complementar"
          badge={<Badge tone="muted">Opcional</Badge>}
        >
          <p className="helper-text" style={{ margin: '0 0 0.65rem' }}>
            Selecione 1 documento da lista ou anexe um novo.
          </p>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
            <div ref={historyDropdownRef} style={{ flex: 1, position: 'relative' }}>
              <button
                className="btn btn-secondary"
                type="button"
                onClick={() => {
                  if (historyOpen) {
                    setHistoryOpen(false)
                  } else {
                    openHistoryDropdown()
                  }
                }}
                disabled={loading}
                aria-expanded={historyOpen}
                aria-haspopup="listbox"
                style={{
                  width: '100%',
                  justifyContent: 'space-between',
                  minHeight: '2.9rem',
                  paddingInline: '0.95rem',
                  borderRadius: historyOpen ? '0.625rem 0.625rem 0 0' : '0.625rem',
                }}
              >
                <span
                  style={{
                    color: selectedHistoryDocumentIds.length > 0 ? 'var(--text-primary)' : 'var(--text-muted)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    textAlign: 'left',
                    flex: 1,
                  }}
                >
                  {selectedHistoryDocumentIds.length > 0
                    ? '1 documento selecionado'
                    : 'Selecione um documento existente...'}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginLeft: '0.75rem' }}>
                  {selectedHistoryDocumentIds.length > 0 && (
                    <span
                      role="button"
                      tabIndex={0}
                      onClick={(event) => {
                        event.stopPropagation()
                        setSelectedHistoryDocumentIds([])
                      }}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault()
                          event.stopPropagation()
                          setSelectedHistoryDocumentIds([])
                        }
                      }}
                      aria-label="Desmarcar documentos do histórico"
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

              {historyOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: 'calc(100% - 1px)',
                    left: 0,
                    right: 0,
                    zIndex: 20,
                    border: '1px solid var(--d2b-border)',
                    borderTop: 'none',
                    borderRadius: '0 0 0.625rem 0.625rem',
                    background: 'var(--bg-card)',
                    boxShadow: '0 12px 24px rgba(0, 0, 0, 0.18)',
                    overflow: 'hidden',
                  }}
                >
                  <div style={{ padding: '0.5rem', borderBottom: '1px solid var(--d2b-border-soft)' }}>
                    <div className="input-field" style={{ gap: '0.5rem' }}>
                      <Search size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                      <input
                        ref={historySearchInputRef}
                        type="text"
                        value={historySearchQuery}
                        onChange={(e) => setHistorySearchQuery(e.target.value)}
                        placeholder="Buscar por nome do arquivo..."
                        style={{
                          flex: 1,
                          border: 'none',
                          outline: 'none',
                          background: 'transparent',
                          color: 'var(--text-primary)',
                          fontSize: '0.84rem',
                        }}
                      />
                      {historyLoading && <Loader2 size={14} className="animate-spin" style={{ color: 'var(--text-muted)', flexShrink: 0 }} />}
                    </div>
                  </div>

                  <div role="listbox" style={{ maxHeight: '13rem', overflowY: 'auto' }}>
                    {!historyLoading && historyDocuments.length === 0 && (
                      <p style={{ margin: 0, padding: '1rem 0.95rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                        {historySearchQuery.trim()
                          ? `Nenhum documento encontrado para "${historySearchQuery.trim()}".`
                          : 'Nenhum documento complementar no histórico ainda.'}
                      </p>
                    )}

                    {historyDocuments.map((doc, idx) => {
                      const isSelected = selectedHistoryDocumentIds.includes(doc.id)
                      return (
                        <button
                          key={doc.id}
                          type="button"
                          role="option"
                          aria-selected={isSelected}
                          onClick={() => toggleHistoryDocument(doc.id)}
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
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flex: 1, minWidth: 0 }}>
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '1.1rem',
                                height: '1.1rem',
                                flexShrink: 0,
                                borderRadius: '0.3rem',
                                border: `1px solid ${isSelected ? 'var(--brand)' : 'var(--d2b-border)'}`,
                                background: isSelected ? 'var(--brand)' : 'transparent',
                                color: '#fff',
                              }}
                            >
                              {isSelected && <Check size={12} />}
                            </span>
                            <span
                              style={{
                                color: 'var(--text-primary)',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                textAlign: 'left',
                              }}
                            >
                              {doc.originalFileName}
                            </span>
                          </span>
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginLeft: '0.75rem' }}>
                            {formatFileSize(doc.fileSize)}
                          </span>
                        </button>
                      )
                    })}
                  </div>

                  {hasMoreHistoryResults && (
                    <p
                      style={{
                        margin: 0,
                        padding: '0.5rem 0.95rem',
                        fontSize: '0.72rem',
                        color: 'var(--text-muted)',
                        borderTop: '1px solid var(--d2b-border-soft)',
                        background: 'var(--bg-elevated)',
                      }}
                    >
                      Mostrando os {historyDocuments.length} mais recentes de {historyTotalElements} — refine a busca para encontrar outros.
                    </p>
                  )}
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

          {newComplementaryUploads.length > 0 && (
            <div style={{ marginTop: '0.9rem' }}>
              <p style={{ margin: '0 0 0.5rem', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>
                Documento selecionado
              </p>
              <div style={{ display: 'grid', gap: '0.45rem' }}>
                {newComplementaryUploads.map((item) => (
                  <FileRow
                    key={item.id}
                    name={item.file.name}
                    size={formatFileSize(item.file.size)}
                    removeDisabled={loading || item.status === 'enviando'}
                    onRemove={() => removeComplementaryUpload(item.id)}
                    trailing={
                      <>
                        {item.status === 'enviando' ? (
                          <Loader2 size={14} className="animate-spin" style={{ color: 'var(--brand)' }} />
                        ) : (
                          <Badge tone={complementaryStatusTone(item.status)}>
                            {complementaryStatusLabel(item.status)}
                          </Badge>
                        )}
                        {item.status === 'erro' && (
                          <button
                            className="btn btn-ghost btn-sm"
                            type="button"
                            onClick={() => retryComplementaryUpload(item.id)}
                            aria-label="Tentar enviar novamente"
                          >
                            <RefreshCw size={14} />
                          </button>
                        )}
                      </>
                    }
                  />
                ))}
              </div>
            </div>
          )}
        </SectionCard>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            className="btn btn-primary"
            onClick={handleValidate}
            disabled={!efFile || loading || complementaryUploadsBusy}
            style={{ height: '42px', paddingInline: '1.15rem' }}
          >
            {loading ? (
              <>
                <Loader2 size={17} className="animate-spin" />
                Validando...
              </>
            ) : (
              <>
                Validar especificação
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <LoadingState
          message="Analisando especificação..."
          helperText="Isso pode levar alguns minutos, principalmente com documento complementar anexado."
          compact
        />
      )}

      {/* Error state */}
      {error && !loading && (
        <div className="alert alert-danger">
          <AlertTriangle size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* Report */}
      {report && !loading && (
        <div>
          <div className="divider" />
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <CheckCircle size={24} style={{ color: 'var(--success)' }} />
            <h2 style={{ margin: 0, color: 'var(--text-primary)' }}>Relatório de Validação</h2>
          </div>
          <ReportDisplay report={report} />
        </div>
      )}
    </div>
  )
}
