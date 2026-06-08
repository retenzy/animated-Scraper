'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

declare global {
  interface Window {
    chrome?: {
      runtime: {
        id: string
        sendMessage: (id: string, msg: unknown, cb: (response: unknown) => void) => void
        lastError?: { message: string }
      }
    }
  }
}

export default function ExtensionPanel() {
  const { data: session } = useSession()
  const [extensionId, setExtensionId] = useState('')
  const [extensionStatus, setExtensionStatus] = useState('not_found')
  const [syncedStatus, setSyncedStatus] = useState<string | null>(null)
  const [autoFound, setAutoFound] = useState(false)

  // Listen for content script auto-announce
  useEffect(() => {
    const handler = (event: MessageEvent) => {
      if (event.data?.source === 'retenzy-extension' && event.data.extensionId) {
        const id = event.data.extensionId
        setExtensionId(id)
        setAutoFound(true)
        localStorage.setItem('extension_id', id)
      }
    }
    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [])

  useEffect(() => {
    const saved = localStorage.getItem('extension_id')
    if (saved && !extensionId) {
      setExtensionId(saved)
    } else if (!extensionId && !autoFound) {
      fetchRegisteredId()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session])

  const fetchRegisteredId = async () => {
    const userId = (session?.user as Record<string, unknown>)?.id
    if (!userId) return
    try {
      const res = await fetch(`/api/extensions/register?userId=${userId}`)
      const data = await res.json()
      if (data.extensionId && !extensionId) {
        setExtensionId(data.extensionId)
        localStorage.setItem('extension_id', data.extensionId)
      }
    } catch {}
  }

  useEffect(() => {
    if (extensionId) {
      pingExtension(extensionId)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [extensionId])

  const pingExtension = (id: string) => {
    const cr = typeof window !== 'undefined' ? window.chrome : undefined
    if (!cr?.runtime) {
      setExtensionStatus('not_found')
      return
    }
    setExtensionStatus('checking')
    try {
      cr.runtime.sendMessage(id, { action: 'PING' }, (response: any) => {
        if (cr.runtime.lastError) {
          setExtensionStatus('not_found')
        } else if (response?.success) {
          setExtensionStatus('connected')
          if (session?.user) syncToExtension(id)
        } else {
          setExtensionStatus('not_found')
        }
      })
    } catch {
      setExtensionStatus('not_found')
    }
  }

  const syncToExtension = (id?: string) => {
    const cr = typeof window !== 'undefined' ? window.chrome : undefined
    const extId = id || extensionId
    const user = session?.user
    if (!cr?.runtime || !extId || !user) return
    setSyncedStatus('syncing')
    try {
      cr.runtime.sendMessage(
        extId,
        {
          action: 'SYNC_USER',
          userId: (user as Record<string, unknown>).id,
          username: user.email,
          coins: (user as Record<string, unknown>).coins,
        },
        (response: any) => {
          if (cr.runtime.lastError) {
            setSyncedStatus('error')
          } else if (response?.success) {
            setSyncedStatus('success')
            setTimeout(() => setSyncedStatus(null), 3000)
          } else {
            setSyncedStatus('error')
          }
        },
      )
    } catch {
      setSyncedStatus('error')
    }
  }

  const saveAndTest = (id: string) => {
    const clean = id.trim()
    setExtensionId(clean)
    localStorage.setItem('extension_id', clean)
  }

  const statusColors: Record<string, string> = {
    connected: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25',
    checking: 'bg-amber-500/10 text-amber-400 border-amber-500/25',
    not_found: 'bg-red-500/10 text-red-400 border-red-500/25',
  }

  const statusDots: Record<string, string> = {
    connected: 'bg-emerald-400 shadow-[0_0_8px_#10b981]',
    checking: 'bg-amber-400 animate-pulse',
    not_found: 'bg-red-400',
  }

  return (
    <div className="p-8 rounded-xl border border-border bg-card/50 backdrop-blur-sm">
      <h3 className="text-xl font-bold text-foreground mb-3">Extension Control Panel</h3>
      <p className="text-sm text-muted-foreground mb-6">
        Synchronize your session and credits with the Chrome extension. The extension auto-announces its ID when you load this page.
      </p>

      <div className="flex items-center gap-3 mb-6 p-3 rounded-lg bg-background/50 border border-border/50">
        <span className="text-xs font-semibold text-muted-foreground">Status:</span>
        <div className={`flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full border ${statusColors[extensionStatus] || ''}`}>
          <span className={`w-2 h-2 rounded-full ${statusDots[extensionStatus] || ''}`} />
          {extensionStatus === 'connected' && 'Extension Connected'}
          {extensionStatus === 'checking' && 'Pinging Extension...'}
          {extensionStatus === 'not_found' && 'Not Found'}
        </div>
      </div>

      <div className="space-y-2 mb-6">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Chrome Extension ID</label>
        <div className="flex items-center gap-2">
          <input
            type="text"
            className="flex-1 bg-background border border-border rounded-lg px-4 py-3 text-sm text-foreground focus:outline-none focus:border-ring focus:ring-1 focus:ring-ring/50"
            placeholder={autoFound ? 'Auto-detected!' : 'Enter manually or reload page'}
            value={extensionId}
            onChange={(e) => saveAndTest(e.target.value)}
          />
          {autoFound && (
            <span className="text-xs font-semibold text-emerald-400 shrink-0">Detected</span>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          {autoFound
            ? 'Extension ID was automatically detected from the installed extension.'
            : 'Install the extension and reload this page for auto-detection.'}
        </p>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => syncToExtension()}
          disabled={extensionStatus !== 'connected' || !session?.user}
          className="flex-1 py-3 px-4 rounded-lg font-semibold text-sm border border-primary/40 bg-gradient-to-br from-indigo-950/50 to-purple-950/50 text-purple-300 hover:from-indigo-900/50 hover:to-purple-900/50 hover:text-white hover:border-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {syncedStatus === 'syncing' && 'Syncing...'}
          {syncedStatus === 'success' && ' Synced Successfully!'}
          {syncedStatus === 'error' && ' Sync Failed'}
          {!syncedStatus && 'Sync User to Extension'}
        </button>
        <button
          onClick={() => fetchRegisteredId()}
          disabled={!session?.user}
          className="py-3 px-4 rounded-lg text-sm font-medium border border-border bg-background text-foreground hover:bg-muted transition disabled:opacity-50"
          title="Re-scan for extension"
        >
          Scan
        </button>
      </div>
      {!session?.user && (
        <p className="text-xs text-red-400 text-center mt-3">Please log in to sync credits.</p>
      )}
    </div>
  )
}
