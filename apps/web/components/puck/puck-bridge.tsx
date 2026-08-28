'use client'

import { useEffect } from 'react'
import { usePuck, type Data } from '@puckeditor/core'

export type PuckApi = {
  dispatch: (action: { type: 'setData'; data: Partial<Data> }) => void
  getData: () => Partial<Data>
}

export default function PuckBridge({ onApi }: { onApi: (api: PuckApi) => void }) {
  const puck = usePuck() as unknown as {
    dispatch: (action: unknown) => void
    appState: { data: Partial<Data> }
  }

  useEffect(() => {
    console.log('[AI][bridge] PuckBridge mounted. usePuck available:', Boolean(puck && puck.dispatch))
    const data = puck.appState?.data
    console.log('[AI][bridge] live data root.zones keys', Object.keys((data as any)?.root?.zones ?? {}))
    onApi({
      dispatch: puck.dispatch as PuckApi['dispatch'],
      getData: () => puck.appState?.data ?? {},
    })
    console.log('[AI][bridge] captured PuckApi (dispatch)')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return null
}