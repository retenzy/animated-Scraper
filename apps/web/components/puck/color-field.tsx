'use client'

import { useEffect, useRef, useState } from 'react'
import type { CustomFieldRender } from '@puckeditor/core'

const PRESETS: { label: string; value: string }[] = [
  { label: 'Default', value: '' },
  { label: 'White', value: 'white' },
  { label: 'Black', value: 'black' },
  { label: 'Muted', value: 'muted' },
  { label: 'Card', value: 'card' },
  { label: 'Secondary', value: 'secondary' },
  { label: 'Primary', value: 'primary' },
  { label: 'Accent', value: 'accent' },
  { label: 'Foreground', value: 'foreground' },
]

const SWATCH_COLORS: Record<string, string> = {
  white: '#ffffff',
  black: '#000000',
  muted: 'var(--muted)',
  card: 'var(--card)',
  secondary: 'var(--secondary)',
  primary: 'var(--primary)',
  accent: 'var(--accent)',
  foreground: 'var(--foreground)',
}

const isHex = (value?: string) => Boolean(value && /^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(value))

export const ColorFieldRenderer: CustomFieldRender<string | undefined> = ({ value, onChange }) => {
  // Local draft so dragging the native picker doesn't spam Puck on every pixel.
  const [draft, setDraft] = useState<string | undefined>(value ?? undefined)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    setDraft(value ?? undefined)
  }, [value])

  const commit = (next: string) => {
    if (timer.current) clearTimeout(timer.current)
    onChange(next)
  }

  // Debounced commit: updates local preview instantly, pushes to Puck after a pause.
  const commitDebounced = (next: string) => {
    setDraft(next)
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => {
      onChange(next)
      timer.current = null
    }, 180)
  }

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current)
  }, [])

  const active = draft ?? ''

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <label
          className="relative h-8 w-8 shrink-0 cursor-pointer rounded-md border border-gray-300"
          style={{
            background: isHex(active) ? active : SWATCH_COLORS[active] ?? 'transparent',
          }}
          title="Pick custom color"
        >
          <input
            type="color"
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
            value={isHex(active) ? (active as string) : '#000000'}
            onChange={(e) => commitDebounced(e.target.value)}
          />
        </label>
        <input
          type="text"
          placeholder="Token or #hex"
          className="w-full rounded-md border border-gray-300 px-2 py-1 text-sm"
          value={active}
          onChange={(e) => commitDebounced(e.target.value)}
        />
      </div>
      <div className="flex flex-wrap gap-1">
        {PRESETS.map((presetItem) => (
          <button
            key={presetItem.label}
            type="button"
            title={presetItem.label}
            onClick={() => commit(presetItem.value)}
            className={`h-6 w-6 rounded-full border ${
              active === presetItem.value ? 'ring-2 ring-blue-500 ring-offset-1' : ''
            }`}
            style={{
              background:
                SWATCH_COLORS[presetItem.value] ??
                'repeating-conic-gradient(#ccc 0% 25%, #fff 0% 50%) 50% / 8px 8px',
            }}
          />
        ))}
      </div>
    </div>
  )
}
