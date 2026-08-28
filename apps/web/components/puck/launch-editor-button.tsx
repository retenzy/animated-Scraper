'use client'

import { useDocumentInfo } from '@payloadcms/ui'
import { ExternalLink } from 'lucide-react'

export default function LaunchEditorButton() {
  const { id, collectionSlug } = useDocumentInfo()

  if (!id || !collectionSlug) return null

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '12px 14px',
        border: '1px solid var(--theme-elevation-200)',
        borderRadius: 6,
        background: 'var(--theme-elevation-50)',
      }}
    >
      <span style={{ fontSize: 13, color: 'var(--theme-elevation-700)' }}>
        Build this visually. It opens in a new tab.
      </span>
      <a
        href={`/admin/collections/${collectionSlug}/${id}/puck`}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          marginLeft: 'auto',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: '8px 14px',
          borderRadius: 6,
          background: 'var(--theme-elevation-1000)',
          color: 'var(--theme-elevation-0)',
          fontWeight: 600,
          fontSize: 13,
          textDecoration: 'none',
          whiteSpace: 'nowrap',
        }}
      >
        <ExternalLink size={14} />
        Open Visual Editor
      </a>
    </div>
  )
}
