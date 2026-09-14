export type DocumentRole = 'EF' | 'COMPLEMENTARY'

export type DocumentUploadResponse = {
  id: number
  originalFileName: string
  contentType: string
  documentType: 'PDF' | 'DOCX' | 'TXT' | 'UNKNOWN'
  fileSize: number
  status: 'UPLOADED' | 'EXTRACTED' | 'VALIDATED' | 'FAILED'
  projectCode?: string | null
  documentRole?: DocumentRole
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
  projectCode?: string | null
  documentRole?: DocumentRole
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
  peso: number
  pontosConquistados: number
  aplicavel: boolean
}

export type PontoCriticoResponse = {
  gap: string
  impacto: string
}

export type ScopeClassification = 'IN_SCOPE' | 'OUT_SCOPE'

export type ScopeComparisonItemResponse = {
  item: string
  classificacao: ScopeClassification
  trechoEf: string | null
  trechoComplementar: string | null
  justificativa: string | null
}

export type ScopeAnalyzerSummaryResponse = {
  classificacaoGeral: ScopeClassification
  resumoExecutivo: string
  principaisRiscos: string[]
  confiancaNivel: string
  confiancaJustificativa: string
  recomendacoes: string[]
  parecerFinal: string
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
  aderenciaEscopo: ScopeComparisonItemResponse[]
  analiseScopeAnalyzer: ScopeAnalyzerSummaryResponse | null
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
