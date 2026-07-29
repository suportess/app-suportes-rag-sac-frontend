export type DocumentUploadResponse = {
  id: number
  originalFileName: string
  contentType: string
  documentType: 'PDF' | 'DOCX' | 'TXT' | 'UNKNOWN'
  fileSize: number
  status: 'UPLOADED' | 'EXTRACTED' | 'VALIDATED' | 'FAILED'
  createdAt: string
}

export type DocumentResponse = {
  id: number
  originalFileName: string
  storedFileName: string
  contentType: string
  documentType: 'PDF' | 'DOCX' | 'TXT' | 'UNKNOWN'
  fileSize: number
  status: 'UPLOADED' | 'EXTRACTED' | 'VALIDATED' | 'FAILED'
  createdAt: string
  updatedAt: string
}

export type SectionStatus = {
  sectionName: string
  status: 'PRESENTE' | 'PARCIAL' | 'AUSENTE'
  detectedHeading?: string | null
}

export type ChecklistItemKey =
  | 'descricao_processo'
  | 'objetivo_escopo'
  | 'casos_uso'
  | 'fluxos_alternativos'
  | 'regras_negocio'
  | 'tratamento_excecoes'
  | 'inputs_outputs'
  | 'campos_estrutura_dados'
  | 'dependencias'
  | 'controle_acesso'
  | 'volume_frequencia'
  | 'logs_reprocessamento'
  | 'mensagens_validacoes'
  | 'condicoes_teste'
  | 'massa_dados'

export type ChecklistItemResponse = {
  chave: ChecklistItemKey
  item: string
  status: 'OK' | 'PARCIAL' | 'AUSENTE'
  comentario: string
  pontos: number
}

export type PontoCriticoResponse = {
  gap: string
  impacto: string
}

export type ValidationReportResponse = {
  reportId: number
  documentId: number
  qualidade: string
  resumoExecutivo: string
  principaisRiscos: string[]
  specificationSummary: string | null
  checklist: ChecklistItemResponse[]
  pontosCriticos: PontoCriticoResponse[]
  recomendacoes: string[]
  parecerFinal: string
  score: number
  classificacao: 'APROVADO' | 'ACEITAVEL' | 'REPROVADO'
  sectionAnalysis: SectionStatus[]
}

export type PageResponse<T> = {
  content: T[]
  totalElements: number
  totalPages: number
  number: number
  size: number
}

export type ApiError = {
  timestamp: string
  status: number
  error: string
  message: string
  path: string
}
