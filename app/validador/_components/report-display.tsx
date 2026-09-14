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
  Scale,
  ShieldCheck,
  Inbox,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import type {
  ValidationReportResponse,
  ChecklistItemResponse,
  ChecklistItemKey,
  SectionStatus,
  ScopeComparisonItemResponse,
  ScopeClassification,
  ScopeAnalyzerSummaryResponse,
} from '@/lib/types'
import { SectionCard } from './section-card'
import { MetricCard } from './metric-card'
import { ReportTabs, type ReportTabDef } from './report-tabs'
import { ChecklistItemCard } from './checklist-item'
import { CriticalPointCard } from './critical-point-card'

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
  if (score >= 61) return 'var(--success)'
  if (score >= 40) return 'var(--warning)'
  return 'var(--danger)'
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

function classificacaoTone(classificacao: ValidationReportResponse['classificacao']): 'success' | 'warning' | 'danger' {
  switch (classificacao) {
    case 'APROVADO':
      return 'success'
    case 'ACEITAVEL':
      return 'warning'
    case 'REPROVADO':
      return 'danger'
  }
}

function ClassificacaoIcon({ classificacao }: { classificacao: ValidationReportResponse['classificacao'] }) {
  switch (classificacao) {
    case 'APROVADO':
      return <CheckCircle size={18} />
    case 'ACEITAVEL':
      return <AlertTriangle size={18} />
    case 'REPROVADO':
      return <XCircle size={18} />
  }
}

function qualidadeTone(qualidade: string): 'success' | 'warning' | 'danger' | 'muted' {
  const normalized = qualidade.trim().toLowerCase()
  if (normalized === 'alta') return 'success'
  if (normalized === 'média' || normalized === 'media') return 'warning'
  if (normalized === 'baixa') return 'danger'
  return 'muted'
}

function sectionStatusTone(status: SectionStatus['status']): 'success' | 'warning' | 'danger' {
  switch (status) {
    case 'PRESENTE':
      return 'success'
    case 'PARCIAL':
      return 'warning'
    case 'AUSENTE':
      return 'danger'
  }
}

function SectionStatusIcon({ status }: { status: SectionStatus['status'] }) {
  switch (status) {
    case 'PRESENTE':
      return <CheckCircle size={15} style={{ color: 'var(--success)', flexShrink: 0 }} />
    case 'PARCIAL':
      return <AlertTriangle size={15} style={{ color: 'var(--warning)', flexShrink: 0 }} />
    case 'AUSENTE':
      return <XCircle size={15} style={{ color: 'var(--danger)', flexShrink: 0 }} />
  }
}

function scopeClassificacaoTone(classificacao: ScopeClassification): 'success' | 'warning' {
  return classificacao === 'IN_SCOPE' ? 'success' : 'warning'
}

function scopeClassificacaoLabel(classificacao: ScopeClassification): string {
  return classificacao === 'IN_SCOPE' ? 'Dentro do escopo' : 'Fora do escopo'
}

function ScopeClassificacaoIcon({ classificacao }: { classificacao: ScopeClassification }) {
  return classificacao === 'IN_SCOPE' ? (
    <CheckCircle size={17} style={{ color: 'var(--success)', flexShrink: 0 }} />
  ) : (
    <AlertTriangle size={17} style={{ color: 'var(--warning)', flexShrink: 0 }} />
  )
}

function confiancaTone(nivel: string): 'success' | 'warning' | 'danger' | 'muted' {
  const normalized = nivel.trim().toLowerCase()
  if (normalized === 'alta') return 'success'
  if (normalized === 'média' || normalized === 'media') return 'warning'
  if (normalized === 'baixa') return 'danger'
  return 'muted'
}

function conquistadoColor(pontosConquistados: number, peso: number): string {
  if (pontosConquistados >= peso) return 'var(--success)'
  if (pontosConquistados === 0) return 'var(--danger)'
  return 'var(--warning)'
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
    <SectionCard icon={<Calculator size={19} />} title="Demonstrativo do Cálculo de Score">
      <p style={{ margin: '0 0 0.85rem 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
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
                  <Badge tone={item.status === 'OK' ? 'success' : item.status === 'PARCIAL' ? 'warning' : 'danger'}>
                    {item.status === 'OK' ? 'OK' : item.status === 'PARCIAL' ? 'Parcial' : 'Ausente'}
                  </Badge>
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
    </SectionCard>
  )
}

function ScopeEvidenceCompare({ trechoEf, trechoComplementar }: { trechoEf: string | null; trechoComplementar: string | null }) {
  if (!trechoEf && !trechoComplementar) return null
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '0.65rem',
      }}
    >
      {trechoEf && (
        <div style={{ background: 'var(--bg-elevated)', borderRadius: '0.55rem', padding: '0.75rem 0.9rem', borderLeft: '3px solid var(--purple)' }}>
          <p style={{ margin: '0 0 0.35rem', fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>
            Trecho na EF
          </p>
          <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{trechoEf}</p>
        </div>
      )}
      {trechoComplementar && (
        <div style={{ background: 'var(--bg-elevated)', borderRadius: '0.55rem', padding: '0.75rem 0.9rem', borderLeft: '3px solid var(--brand)' }}>
          <p style={{ margin: '0 0 0.35rem', fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>
            Trecho no documento complementar
          </p>
          <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{trechoComplementar}</p>
        </div>
      )}
    </div>
  )
}

function ScopeSummaryCard({ summary }: { summary: ScopeAnalyzerSummaryResponse }) {
  const borderColor = summary.classificacaoGeral === 'IN_SCOPE' ? 'var(--success)' : 'var(--warning)'

  return (
    <div className="card" style={{ borderLeft: `3px solid ${borderColor}`, overflow: 'hidden' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          padding: '1rem 1.25rem',
          background: 'var(--bg-elevated)',
          borderBottom: '1px solid var(--d2b-border-soft)',
          flexWrap: 'wrap',
        }}
      >
        <ScopeClassificacaoIcon classificacao={summary.classificacaoGeral} />
        <h4 style={{ margin: 0, color: 'var(--text-primary)', flex: 1, minWidth: '180px', fontSize: '0.9rem', fontWeight: 600 }}>
          Análise de Aderência ao Escopo
        </h4>
        <Badge tone={scopeClassificacaoTone(summary.classificacaoGeral)}>
          {scopeClassificacaoLabel(summary.classificacaoGeral)}
        </Badge>
      </div>

      <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
        <p style={{ margin: 0, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          {summary.resumoExecutivo}
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '1rem',
          }}
        >
          {summary.principaisRiscos.length > 0 && (
            <div style={{ background: 'var(--bg-elevated)', borderRadius: '0.6rem', padding: '0.85rem 1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.55rem' }}>
                <AlertTriangle size={14} style={{ color: 'var(--warning)' }} />
                <span style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-muted)' }}>
                  Principais riscos
                </span>
              </div>
              <ul style={{ margin: 0, paddingLeft: '1.1rem' }}>
                {summary.principaisRiscos.map((risco, i) => (
                  <li key={i} style={{ color: 'var(--text-secondary)', marginBottom: '0.3rem', lineHeight: 1.5, fontSize: '0.8rem' }}>
                    {risco}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div style={{ background: 'var(--bg-elevated)', borderRadius: '0.6rem', padding: '0.85rem 1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.55rem' }}>
              <ShieldCheck size={14} style={{ color: 'var(--brand)' }} />
              <span style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-muted)' }}>
                Nível de confiança
              </span>
            </div>
            <div style={{ marginBottom: '0.5rem' }}>
              <Badge tone={confiancaTone(summary.confiancaNivel)}>{summary.confiancaNivel}</Badge>
            </div>
            <p style={{ margin: 0, color: 'var(--text-secondary)', lineHeight: 1.5, fontSize: '0.8rem' }}>
              {summary.confiancaJustificativa}
            </p>
          </div>
        </div>
      </div>

      {summary.recomendacoes.length > 0 && (
        <div style={{ borderTop: '1px solid var(--d2b-border-soft)', padding: '1rem 1.25rem', background: 'var(--bg-elevated)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
            <Lightbulb size={14} style={{ color: 'var(--brand)' }} />
            <span style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-muted)' }}>
              {summary.recomendacoes.length > 1 ? 'Recomendações' : 'Recomendação'}
            </span>
          </div>
          <ul style={{ margin: 0, paddingLeft: '1.1rem' }}>
            {summary.recomendacoes.map((rec, i) => (
              <li key={i} style={{ color: 'var(--text-secondary)', marginBottom: '0.3rem', lineHeight: 1.55, fontSize: '0.8rem' }}>
                {rec}
              </li>
            ))}
          </ul>
        </div>
      )}

      {summary.parecerFinal && (
        <div style={{ borderTop: '1px solid var(--d2b-border-soft)', padding: '1rem 1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
            <FileText size={14} style={{ color: 'var(--brand)' }} />
            <span style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-muted)' }}>
              Parecer final
            </span>
          </div>
          <p style={{ margin: 0, color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '0.8rem' }}>
            {summary.parecerFinal}
          </p>
        </div>
      )}
    </div>
  )
}

function ScopeAdherenceEmptyState() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.6rem',
        padding: '3rem 1.5rem',
        textAlign: 'center',
        border: '1px dashed var(--d2b-border)',
        borderRadius: '0.75rem',
      }}
    >
      <Inbox size={28} style={{ color: 'var(--text-muted)' }} />
      <p style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>
        Aderência ao escopo não analisada
      </p>
      <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--text-muted)', maxWidth: '340px' }}>
        Nenhum documento complementar foi informado nesta validação.
      </p>
    </div>
  )
}

function VisaoGeralTab({ report }: { report: ValidationReportResponse }) {
  return (
    <>
      {report.sectionAnalysis && report.sectionAnalysis.length > 0 && (
        <SectionCard
          icon={<ListChecks size={19} />}
          title="Cobertura de Seções EF"
          trailing={
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              {report.sectionAnalysis.filter((s) => s.status === 'PRESENTE').length}/
              {report.sectionAnalysis.length} presentes
            </span>
          }
        >
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
                  padding: '0.55rem 0.8rem',
                  borderRadius: '0.55rem',
                  backgroundColor: 'var(--bg-elevated)',
                }}
              >
                <SectionStatusIcon status={section.status} />
                <span style={{ flex: 1, fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                  {section.sectionName}
                </span>
                <Badge tone={sectionStatusTone(section.status)}>{section.status}</Badge>
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      <SectionCard icon={<FileText size={19} />} title="Análise Geral">
        <p style={{ margin: '0 0 0.75rem 0', color: 'var(--text-secondary)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
          {report.resumoExecutivo}
        </p>
        {report.principaisRiscos.length > 0 && (
          <>
            <strong style={{ color: 'var(--text-primary)', fontSize: '0.85rem' }}>Principais riscos:</strong>
            <ul style={{ margin: '0.5rem 0 0 0', paddingLeft: '1.5rem' }}>
              {report.principaisRiscos.map((risco, i) => (
                <li key={i} style={{ marginBottom: '0.35rem', color: 'var(--text-secondary)' }}>
                  {risco}
                </li>
              ))}
            </ul>
          </>
        )}
      </SectionCard>

      {report.specificationSummary && (
        <SectionCard icon={<BookOpen size={19} />} title="Resumo da Especificação">
          <p style={{ margin: 0, color: 'var(--text-secondary)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
            {report.specificationSummary}
          </p>
        </SectionCard>
      )}
    </>
  )
}

function ChecklistTab({ checklist, score }: { checklist: ChecklistItemResponse[]; score: number }) {
  const okCount = checklist.filter((item) => item.aplicavel && item.status === 'OK').length
  const aplicaveisCount = checklist.filter((i) => i.aplicavel).length

  return (
    <>
      <ScoreBreakdown checklist={checklist} score={score} />
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <ClipboardCheck size={19} style={{ color: 'var(--brand)' }} />
          <h3 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            Itens do Checklist
          </h3>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginLeft: 'auto' }}>
            {okCount}/{aplicaveisCount} OK
          </span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {checklist.map((item) => (
            <ChecklistItemCard key={item.chave} label={CHECKLIST_LABELS[item.chave]} item={item} />
          ))}
        </div>
      </div>
    </>
  )
}

function EscopoTab({
  aderenciaEscopo,
  summary,
}: {
  aderenciaEscopo: ScopeComparisonItemResponse[]
  summary: ScopeAnalyzerSummaryResponse | null
}) {
  if (aderenciaEscopo.length === 0) {
    return <ScopeAdherenceEmptyState />
  }

  const inScopeCount = aderenciaEscopo.filter((item) => item.classificacao === 'IN_SCOPE').length

  return (
    <>
      {summary && <ScopeSummaryCard summary={summary} />}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Scale size={19} style={{ color: 'var(--brand)' }} />
        <h3 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)' }}>
          Itens Analisados
        </h3>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginLeft: 'auto' }}>
          {inScopeCount}/{aderenciaEscopo.length} dentro do escopo
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {aderenciaEscopo.map((item, i) => (
          <div key={i} className="card card-p">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
              <ScopeClassificacaoIcon classificacao={item.classificacao} />
              <h4 style={{ margin: 0, color: 'var(--text-primary)', flex: 1, fontSize: '0.9rem', fontWeight: 600 }}>{item.item}</h4>
              <Badge tone={scopeClassificacaoTone(item.classificacao)}>
                {scopeClassificacaoLabel(item.classificacao)}
              </Badge>
            </div>
            {item.justificativa && (
              <p style={{ margin: '0 0 0.75rem 0', color: 'var(--text-secondary)', lineHeight: 1.5, fontSize: '0.85rem' }}>
                {item.justificativa}
              </p>
            )}
            <ScopeEvidenceCompare trechoEf={item.trechoEf} trechoComplementar={item.trechoComplementar} />
          </div>
        ))}
      </div>
    </>
  )
}

function CriticosTab({ pontosCriticos }: { pontosCriticos: ValidationReportResponse['pontosCriticos'] }) {
  if (pontosCriticos.length === 0) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.6rem',
          padding: '3rem 1.5rem',
          textAlign: 'center',
          border: '1px dashed var(--d2b-border)',
          borderRadius: '0.75rem',
        }}
      >
        <CheckCircle size={28} style={{ color: 'var(--success)' }} />
        <p style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>
          Nenhum ponto crítico identificado
        </p>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {pontosCriticos.map((ponto, i) => (
        <CriticalPointCard key={i} ponto={ponto} />
      ))}
    </div>
  )
}

function RecomendacoesTab({ recomendacoes, parecerFinal }: { recomendacoes: string[]; parecerFinal: string }) {
  return (
    <>
      {recomendacoes.length > 0 && (
        <SectionCard icon={<Lightbulb size={19} />} title="Recomendações">
          <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
            {recomendacoes.map((rec, i) => (
              <li key={i} style={{ marginBottom: '0.35rem', color: 'var(--text-secondary)' }}>
                {rec}
              </li>
            ))}
          </ul>
        </SectionCard>
      )}

      {parecerFinal && (
        <SectionCard icon={<FileText size={19} />} title="Parecer Final">
          <p style={{ margin: 0, color: 'var(--text-secondary)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
            {parecerFinal}
          </p>
        </SectionCard>
      )}
    </>
  )
}

type ReportDisplayProps = {
  report: ValidationReportResponse
}

export function ReportDisplay({ report }: ReportDisplayProps) {
  const checklist = sortedChecklist(report.checklist)
  const okCount = checklist.filter((item) => item.aplicavel && item.status === 'OK').length

  const tabs: ReportTabDef[] = [
    { id: 'geral', label: 'Visão geral', content: <VisaoGeralTab report={report} /> },
    { id: 'checklist', label: 'Checklist', content: <ChecklistTab checklist={checklist} score={report.score} /> },
    {
      id: 'escopo',
      label: 'Aderência ao escopo',
      content: <EscopoTab aderenciaEscopo={report.aderenciaEscopo} summary={report.analiseScopeAnalyzer} />,
    },
    { id: 'criticos', label: 'Pontos críticos', content: <CriticosTab pontosCriticos={report.pontosCriticos} /> },
    {
      id: 'recos',
      label: 'Recomendações',
      content: <RecomendacoesTab recomendacoes={report.recomendacoes} parecerFinal={report.parecerFinal} />,
    },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
        }}
      >
        <MetricCard
          icon={<Gauge size={22} />}
          iconColor={scoreColor(report.score)}
          value={`${report.score}/100`}
          valueColor={scoreColor(report.score)}
          label="Score"
        />
        <MetricCard
          icon={<ClassificacaoIcon classificacao={report.classificacao} />}
          iconColor="var(--brand)"
          value={<Badge tone={classificacaoTone(report.classificacao)}>{classificacaoLabel(report.classificacao)}</Badge>}
          label="Classificação"
        />
        <MetricCard
          icon={<span style={{ fontSize: '0.7rem' }}><Badge tone={qualidadeTone(report.qualidade)}>{report.qualidade}</Badge></span>}
          iconColor="var(--brand)"
          value={`${okCount}/${checklist.length}`}
          label="Itens OK no checklist"
        />
        <MetricCard
          icon={<AlertOctagon size={22} />}
          iconColor="var(--danger)"
          value={report.pontosCriticos.length}
          label="Pontos críticos"
        />
      </div>

      <ReportTabs tabs={tabs} />
    </div>
  )
}
