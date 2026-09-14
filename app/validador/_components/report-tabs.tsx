'use client'

import { useState } from 'react'

export type ReportTabDef = {
  id: string
  label: string
  content: React.ReactNode
}

type ReportTabsProps = {
  tabs: ReportTabDef[]
}

export function ReportTabs({ tabs }: ReportTabsProps) {
  const [activeId, setActiveId] = useState(tabs[0]?.id)
  const active = tabs.find((tab) => tab.id === activeId) ?? tabs[0]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div className="tab-group" role="tablist">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={tab.id === active?.id}
            className={tab.id === active?.id ? 'tab-item active' : 'tab-item'}
            onClick={() => setActiveId(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div role="tabpanel" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {active?.content}
      </div>
    </div>
  )
}
