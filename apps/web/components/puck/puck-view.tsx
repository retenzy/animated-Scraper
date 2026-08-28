'use client'

import '@/app/(frontend)/globals.css'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Puck, type Data } from '@puckeditor/core'
import '@puckeditor/core/puck.css'
import './puck-editor.css'
import { puckConfig } from './puck.config'
import { toPuckData, type GenerateSectionResponse } from '@/lib/ai'
import PuckBridge, { type PuckApi } from './puck-bridge'

type SaveState = 'idle' | 'saving' | 'saved' | 'error'

export default function PuckView({
  docId,
  collectionSlug = 'pages',
  title,
  initialData,
}: {
  docId: string
  collectionSlug?: string
  title: string
  initialData: Partial<Data>
}) {
  const router = useRouter()
  const [data, setData] = useState<Partial<Data>>(initialData)
  const [saveState, setSaveState] = useState<SaveState>('idle')
  const [message, setMessage] = useState('')
  const [aiOpen, setAiOpen] = useState(false)
  const [aiPrompt, setAiPrompt] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const dataRef = useRef(data)
  dataRef.current = data
  const puckApiRef = useRef<PuckApi | null>(null)
  const setPuckApi = (api: PuckApi) => {
    puckApiRef.current = api
  }

  const generateSection = async () => {
    const instruction = aiPrompt.trim()
    if (!instruction) return
    console.log('[AI] generateSection start', { instruction })
    setAiLoading(true)
    setMessage('')
    try {
      console.log('[AI] calling /api/generate')
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ instruction, pageTitle: title }),
      })
      const json = (await res.json()) as GenerateSectionResponse
      console.log('[AI] api response', { ok: res.ok, status: res.status, json })
      if (!res.ok || !json.blocks) {
        console.warn('[AI] api failed', json)
        setSaveState('error')
        setMessage(json.error ?? 'AI generation failed.')
        return
      }
      console.log('[AI] puckApiRef.current present?', Boolean(puckApiRef.current))
      const base = puckApiRef.current?.getData() ?? dataRef.current
      console.log('[AI] base data root.zones keys', Object.keys((base as any)?.root?.zones ?? {}))
      const next = toPuckData(base, json.blocks ?? [])
      console.log('[AI] merged data root.zones.content',
        (next as any)?.root?.zones?.content?.map((n: any) => ({ type: n.type, id: n.props?.id })))
      if (puckApiRef.current) {
        console.log('[AI] dispatching setData')
        puckApiRef.current.dispatch({ type: 'setData', data: next })
        console.log('[AI] dispatched setData')
      } else {
        console.warn('[AI] puckApiRef is null — PuckBridge did not mount; falling back to setData state only')
      }
      setData(next)
      setAiPrompt('')
      setAiOpen(false)
      setSaveState('saved')
      setMessage('Section added — review it, then Save draft to keep changes.')
    } catch (err) {
      console.error('[AI] generateSection threw', err)
      setSaveState('error')
      setMessage('Could not reach the server.')
    } finally {
      setAiLoading(false)
      console.log('[AI] generateSection done')
    }
  }

  const backUrl = `/admin/collections/${collectionSlug}/${docId}`

  const save = async (publish: boolean) => {
    setSaveState('saving')
    setMessage('')
    try {
      const res = await fetch(`/cms-api/${collectionSlug}/${docId}?draft=true`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          puckContent: data,
          layoutMode: 'puck',
          _status: publish ? 'published' : 'draft',
        }),
      })

      if (!res.ok) {
        setSaveState('error')
        setMessage('Save failed — check the server and try again.')
        return
      }

      setSaveState('saved')
      setMessage(publish ? 'Published.' : 'Draft saved.')
      router.refresh()
      setTimeout(() => {
        setSaveState('idle')
        setMessage('')
      }, 2500)
    } catch {
      setSaveState('error')
      setMessage('Could not reach the server.')
    }
  }

  return (
    <div className="puck-editor puck-editor-fullscreen">
      <div className="puck-editor-stage">
        <div className="puck-ai-wrap" data-open={aiOpen || undefined}>
          <div className="puck-ai-heading">AI · Generate section</div>
          <button
            type="button"
            className="puck-editor-btn puck-editor-btn-ai puck-ai-launch"
            onClick={() => setAiOpen((v) => !v)}
          >
            {aiOpen ? 'Close' : '✨ Generate section'}
          </button>
          {aiOpen && (
            <div className="puck-ai-popover">
              <label className="puck-ai-label" htmlFor="ai-prompt">
                Describe the section to generate
              </label>
              <textarea
                id="ai-prompt"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="e.g. A two-column pricing section with a list of features and a button"
                className="puck-ai-input"
                rows={3}
              />
              <div className="puck-ai-footer">
                <button
                  type="button"
                  className="puck-editor-btn"
                  onClick={() => setAiOpen(false)}
                  disabled={aiLoading}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="puck-editor-btn puck-editor-btn-ai"
                  onClick={generateSection}
                  disabled={aiLoading || !aiPrompt.trim()}
                >
                  {aiLoading ? 'Generating…' : 'Generate'}
                </button>
              </div>
            </div>
          )}
        </div>
        <Puck
          config={puckConfig as never}
          data={data}
          iframe={{ enabled: false }}
          onChange={(next) => setData(next)}
          onPublish={(next) => {
            setData(next)
            save(true)
          }}
          headerTitle={title}
          overrides={{
            headerActions: ({ children }) => (
              <div className="puck-editor-actions">
                <PuckBridge onApi={setPuckApi} />
                <button
                  type="button"
                  className="puck-editor-btn puck-editor-btn-save"
                  disabled={saveState === 'saving'}
                  onClick={() => save(false)}
                >
                  {saveState === 'saving' ? 'Saving…' : 'Save draft'}
                </button>
                {children}
                <a className="puck-editor-btn" href={backUrl}>
                  Exit
                </a>
              </div>
            ),
          }}
        />
        {message && <div className="puck-editor-status">{message}</div>}
      </div>
    </div>
  )
}
