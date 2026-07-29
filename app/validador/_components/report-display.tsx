'use client'

import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  BookOpen,
  FileText,
  ListChecks,
  ClipboardCheck,
  AlertOctagon,
  Lightbulb,
  Gauge,
  Calculator,
} from 'lucide-react'
import type {
  ValidationReportResponse,
  ChecklistItemResponse,
  ChecklistItemKey,
  SectionStatus,
} from '@/lib/types'

// Nomes fixos e corretamente acentuados dos itens do checklist — não depende de como a IA
// escreveu o campo "item" na resposta (a IA pode variar grafia/acentuação entre execuções).
// A quantidade de itens que realmente aparece varia por EF (alguns são condicionais por tipo
// de desenvolvimento — ver ScoreCalculator/PromptBuilderService no backend); "consistência"
// não é mais um item pontuado, virou regra transversal aplicada a todos os outros no prompt.
const CHECKLIST_LABELS: Record<ChecklistItemKey, string> = {
  descricao_processo: 'Descrição do processo',
  objetivo_escopo: 'Objetivo e escopo',
  casos_uso: 'Casos de uso principais',
  fluxos_alternativos: 'Fluxos alternativos',
  regras_negocio: 'Regras de negócio',
  tratamento_excecoes: 'Tratamento de exceções',
  inputs_outputs: 'Inputs e outputs',
  campos_estrutura_dados: 'Campos e estrutura de dados',
  dependencias: 'Dependências',
  controle_acesso: 'Controle de acesso / autorizações',
  volume_frequencia: 'Volume de dados e frequência de execução',
  logs_reprocessamento: 'Logs, rastreabilidade e reprocessamento',
  mensagens_validacoes: 'Mensagens e validações',
  condicoes_teste: 'Condições de teste',
  massa_dados: 'Massa de dados',
}

const CHECKLIST_ORDER = Object.keys(CHECKLIST_LABELS) as ChecklistItemKey[]

function sortedChecklist(checklist: ChecklistItemResponse[]): ChecklistItemResponse[] {
  return [...checklist].sort(
    (a, b) => CHECKLIST_ORDER.indexOf(a.chave) - CHECKLIST_ORDER.indexOf(b.chave)
  )
}

function scoreColor(score: number): string {
  if (score >= 61) return 'var(--clr-success)'
  if (score >= 40) return 'var(--clr-warning)'
  return 'var(--clr-danger)'
}

function classificacaoLabel(classificacao: ValidationReportResponse['classificacao']): string {
  switch (classificacao) {
    case 'APROVADO':
      return 'Aprovado'
    case 'ACEITAVEL':
      return 'Aprovado com Ressalvas'
    case 'REPROVADO':
      return 'Reprovado'
  }
}

function classificacaoBadgeClass(classificacao: ValidationReportResponse['classificacao']): string {
  switch (classificacao) {
    case 'APROVADO':
      return 'badge-success'
    case 'ACEITAVEL':
      return 'badge-warning'
    case 'REPROVADO':
      return 'badge-danger'
  }
}

function ClassificacaoIcon({ classificacao }: { classificacao: ValidationReportResponse['classificacao'] }) {
  switch (classificacao) {
    case 'APROVADO':
      return <CheckCircle size={20} />
    case 'ACEITAVEL':
      return <AlertTriangle size={20} />
    case 'REPROVADO':
      return <XCircle size={20} />
  }
}

function qualidadeBadgeClass(qualidade: string): string {
  const normalized = qualidade.trim().toLowerCase()
  if (normalized === 'alta') return 'badge-success'
  if (normalized === 'média' || normalized === 'media') return 'badge-warning'
  if (normalized === 'baixa') return 'badge-danger'
  return 'badge-secondary'
}

function checklistStatusBadgeClass(status: ChecklistItemResponse['status']): string {
  switch (status) {
    case 'OK':
      return 'badge-success'
    case 'PARCIAL':
      return 'badge-warning'
    case 'AUSENTE':
      return 'badge-danger'
  }
}

function checklistStatusLabel(status: ChecklistItemResponse['status']): string {
  switch (status) {
    case 'OK':
      return 'OK'
    case 'PARCIAL':
      return 'Parcial'
    case 'AUSENTE':
      return 'Ausente'
  }
}

function ChecklistStatusIcon({ status }: { status: ChecklistItemResponse['status'] }) {
  switch (status) {
    case 'OK':
      return <CheckCircle size={16} style={{ color: 'var(--clr-success)', flexShrink: 0 }} />
    case 'PARCIAL':
      return <AlertTriangle size={16} style={{ color: 'var(--clr-warning)', flexShrink: 0 }} />
    case 'AUSENTE':
      return <XCircle size={16} style={{ color: 'var(--clr-danger)', flexShrink: 0 }} />
  }
}

function sectionStatusBadgeClass(status: SectionStatus['status']): string {
  switch (status) {
    case 'PRESENTE':
      return 'badge-success'
    case 'PARCIAL':
      return 'badge-warning'
    case 'AUSENTE':
      return 'badge-danger'
  }
}

function SectionStatusIcon({ status }: { status: SectionStatus['status'] }) {
  switch (status) {
    case 'PRESENTE':
      return <CheckCircle size={16} style={{ color: 'var(--clr-success)', flexShrink: 0 }} />
    case 'PARCIAL':
      return <AlertTriangle size={16} style={{ color: 'var(--clr-warning)', flexShrink: 0 }} />
    case 'AUSENTE':
      return <XCircle size={16} style={{ color: 'var(--clr-danger)', flexShrink: 0 }} />
  }
}

function conquistadoColor(pontosConquistados: number, peso: number): string {
  if (pontosConquistados >= peso) return 'var(--clr-success)'
  if (pontosConquistados === 0) return 'var(--clr-danger)'
  return 'var(--clr-warning)'
}

// Sem decimal quando for numero inteiro (ex: "5"), com 1 casa quando for fracao (ex: "1.5").
function formatNumero(valor: number): string {
  return Number.isInteger(valor) ? String(valor) : valor.toFixed(1)
}

function ScoreBreakdown({ checklist, score }: { checklist: ChecklistItemResponse[]; score: number }) {
  const aplicaveis = checklist.filter((i) => i.aplicavel)
  const possivel = aplicaveis.reduce((soma, item) => soma + item.peso, 0)
  const conquistado = aplicaveis.reduce((soma, item) => soma + item.pontosConquistados, 0)

  return (
    <div className="card card-p">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
        <Calculator size={20} style={{ color: 'var(--clr-brand)' }} />
        <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-primary)' }}>
          Demonstrativo do Cálculo de Score
        </h3>
      </div>
      <p style={{ margin: '0 0 0.75rem 0', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
        Cada critério tem um peso (definido pelo negócio). OK garante o peso cheio, Parcial garante metade,
        Ausente não garante nada. O score é a soma conquistada dividida pela soma possível.
        Critérios marcados como N/A não se aplicam ao tipo de desenvolvimento detectado e não entram no cálculo.
      </p>
      <div className="data-table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Item</th>
              <th style={{ textAlign: 'right' }}>Peso</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Pontos</th>
            </tr>
          </thead>
          <tbody>
            {checklist.map((item) => (
              <tr key={item.chave} style={!item.aplicavel ? { opacity: 0.5 } : undefined}>
                <td style={{ color: 'var(--text-primary)' }}>{CHECKLIST_LABELS[item.chave]}</td>
                <td style={{ textAlign: 'right', color: 'var(--text-secondary)' }}>{item.peso}</td>
                <td>
                  <span className={checklistStatusBadgeClass(item.status)}>
                    {checklistStatusLabel(item.status)}
                  </span>
                </td>
                <td
                  style={{
                    textAlign: 'right',
                    fontWeight: 600,
                    color: conquistadoColor(item.pontosConquistados, item.peso),
                  }}
                >
                  {formatNumero(item.pontosConquistados)} / {item.peso}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="table-footer" style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>
            Total: {formatNumero(conquistado)} / {formatNumero(possivel)} pontos
          </span>
          <span style={{ fontWeight: 700, color: scoreColor(score) }}>Score: {score}/100</span>
        </div>
      </div>
    </div>
  )
}

type ReportDisplayProps = {
  report: ValidationReportResponse
}

export function ReportDisplay({ report }: ReportDisplayProps) {
  const checklist = sortedChecklist(report.checklist)
  const okCount = checklist.filter((item) => item.aplicavel && item.status === 'OK').length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* KPI Row — Score automático (seção 5) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
        }}
      >
        <div className="kpi-card">
          <div className="kpi-icon" style={{ color: scoreColor(report.score) }}>
            <Gauge size={24} />
          </div>
          <div className="kpi-value" style={{ color: scoreColor(report.score) }}>
            {report.score}/100
          </div>
          <div className="kpi-label">Score</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon">
            <ClassificacaoIcon classificacao={report.classificacao} />
          </div>
          <div className="kpi-value">
            <span className={classificacaoBadgeClass(report.classificacao)}>
              {classificacaoLabel(report.classificacao)}
            </span>
          </div>
          <div className="kpi-label">Classificação</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon">
            <span className={qualidadeBadgeClass(report.qualidade)}>{report.qualidade}</span>
          </div>
          <div className="kpi-value">{okCount}/{checklist.length}</div>
          <div className="kpi-label">Itens OK no checklist</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon" style={{ color: 'var(--clr-danger)' }}>
            <AlertOctagon size={24} />
          </div>
          <div className="kpi-value">{report.pontosCriticos.length}</div>
          <div className="kpi-label">Pontos Críticos</div>
        </div>
      </div>

      <ScoreBreakdown checklist={checklist} score={report.score} />

      {/* Section Coverage (analise determinística de 12 seções, independente do checklist da IA) */}
      {report.sectionAnalysis && report.sectionAnalysis.length > 0 && (
        <div className="card card-p">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <ListChecks size={20} style={{ color: 'var(--clr-brand)' }} />
            <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-primary)' }}>
              Cobertura de Seções EF
            </h3>
            <span style={{ marginLeft: 'auto', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              {report.sectionAnalysis.filter((s) => s.status === 'PRESENTE').length}/
              {report.sectionAnalysis.length} presentes
            </span>
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
              gap: '0.5rem',
            }}
          >
            {report.sectionAnalysis.map((section, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  padding: '0.5rem 0.75rem',
                  borderRadius: '0.375rem',
                  backgroundColor: 'var(--bg-muted)',
                }}
              >
                <SectionStatusIcon status={section.status} />
                <span style={{ flex: 1, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                  {section.sectionName}
                </span>
                <span className={sectionStatusBadgeClass(section.status)} style={{ fontSize: '0.7rem' }}>
                  {section.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 1. Análise Geral */}
      <div className="card card-p">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
          <FileText size={20} style={{ color: 'var(--clr-brand)' }} />
          <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-primary)' }}>
            Análise Geral
          </h3>
        </div>
        <p style={{ margin: '0 0 0.75rem 0', color: 'var(--text-secondary)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
          {report.resumoExecutivo}
        </p>
        {report.principaisRiscos.length > 0 && (
          <>
            <strong style={{ color: 'var(--text-primary)', fontSize: '0.875rem' }}>Principais riscos:</strong>
            <ul style={{ margin: '0.5rem 0 0 0', paddingLeft: '1.5rem' }}>
              {report.principaisRiscos.map((risco, i) => (
                <li key={i} style={{ marginBottom: '0.35rem', color: 'var(--text-secondary)' }}>
                  {risco}
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      {/* Specification Summary */}
      {report.specificationSummary && (
        <div className="card card-p">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <BookOpen size={20} style={{ color: 'var(--clr-brand)' }} />
            <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-primary)' }}>
              Resumo da Especificação
            </h3>
          </div>
          <p style={{ margin: 0, color: 'var(--text-secondary)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
            {report.specificationSummary}
          </p>
        </div>
      )}

      {/* 2. Checklist de Validação */}
      {checklist.length > 0 && (
        <div>
          <h3 style={{ color: 'var(--text-primary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ClipboardCheck size={20} style={{ color: 'var(--clr-brand)' }} />
            Checklist de Validação ({okCount}/{checklist.filter((i) => i.aplicavel).length} OK)
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {checklist.map((item) => (
              <div key={item.chave} className="card card-p" style={!item.aplicavel ? { opacity: 0.5 } : undefined}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                  <ChecklistStatusIcon status={item.status} />
                  <h4 style={{ margin: 0, color: 'var(--text-primary)', flex: 1 }}>{CHECKLIST_LABELS[item.chave]}</h4>
                  <span className={checklistStatusBadgeClass(item.status)}>
                    {checklistStatusLabel(item.status)}
                  </span>
                </div>
                <p style={{ margin: 0, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {item.comentario}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Pontos Críticos */}
      {report.pontosCriticos.length > 0 && (
        <div>
          <h3 style={{ color: 'var(--text-primary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertOctagon size={20} style={{ color: 'var(--clr-danger)' }} />
            Pontos Críticos ({report.pontosCriticos.length})
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {report.pontosCriticos.map((ponto, i) => (
              <div key={i} className="card card-p">
                <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-primary)' }}>{ponto.gap}</h4>
                <div
                  style={{
                    padding: '0.75rem 1rem',
                    borderRadius: '0.5rem',
                    backgroundColor: 'var(--bg-muted)',
                    borderLeft: '3px solid var(--clr-danger)',
                  }}
                >
                  <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    <strong style={{ color: 'var(--text-primary)' }}>Impacto:</strong> {ponto.impacto}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Recomendações */}
      {report.recomendacoes.length > 0 && (
        <div className="card card-p">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <Lightbulb size={20} style={{ color: 'var(--clr-brand)' }} />
            <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-primary)' }}>
              Recomendações
            </h3>
          </div>
          <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
            {report.recomendacoes.map((rec, i) => (
              <li key={i} style={{ marginBottom: '0.35rem', color: 'var(--text-secondary)' }}>
                {rec}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 6. Parecer Final */}
      {report.parecerFinal && (
        <div className="card card-p">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <FileText size={20} style={{ color: 'var(--clr-brand)' }} />
            <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-primary)' }}>
              Parecer Final
            </h3>
          </div>
          <p style={{ margin: 0, color: 'var(--text-secondary)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
            {report.parecerFinal}
          </p>
        </div>
      )}
    </div>
  )
}
