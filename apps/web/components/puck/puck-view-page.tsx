import type { DocumentViewServerProps } from 'payload'
import { notFound } from 'next/navigation'
import PuckView from './puck-view'

export default async function PuckViewPage(props: DocumentViewServerProps) {
  const doc = (props?.doc ?? {}) as { id?: string | number; title?: string; puckContent?: unknown }

  const docId = String(doc.id ?? '')

  // Guard: a Puck editor cannot operate without a saved document id. If the
  // doc is missing (e.g. deleted or a bad URL like /:id/puck with id=null),
  // render the standard not-found rather than a broken editor that would try
  // to save against "/cms-api/collection/?draft=true".
  if (!docId || docId === 'null' || docId === 'undefined') {
    notFound()
  }

  // segment[1] = collection slug, e.g. /admin/collections/pages/[id]/puck
  const slugFromRoute = props?.routeSegments?.[1]
  const collectionSlug = slugFromRoute || 'pages'
  const title = doc.title || 'Page'

  return (
    <PuckView
      docId={docId}
      collectionSlug={collectionSlug}
      title={title}
      initialData={(doc.puckContent ?? {}) as never}
    />
  )
}
