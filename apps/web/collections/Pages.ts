import type { CollectionConfig } from 'payload'
import { blocks } from '../blocks'

export const Pages: CollectionConfig = {
  slug: 'pages',
  labels: {
    singular: 'Page',
    plural: 'Pages',
  },
  admin: {
    group: 'Content',
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', '_status', 'updatedAt'],
    components: {
      views: {
        edit: {
          puck: {
            Component: '@/components/puck/puck-view-page',
            path: '/puck',
          },
        },
      },
    },
  },
  access: {
    read: ({ req: { user } }) => {
      if (user) return true
      return {
        _status: {
          equals: 'published',
        },
      }
    },
  },
  versions: {
    drafts: true,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        description: 'URL path — e.g. "about" resolves to /about.',
      },
    },
    {
      name: 'layoutMode',
      type: 'select',
      defaultValue: 'blocks',
      admin: {
        position: 'sidebar',
        description: 'Choose how this page is built: form blocks or the visual Puck editor.',
      },
      options: [
        { label: 'Blocks (form)', value: 'blocks' },
        { label: 'Visual editor (Puck)', value: 'puck' },
      ],
    },
    {
      name: 'openVisualEditor',
      type: 'ui',
      label: 'Visual Editor',
      admin: {
        position: 'sidebar',
        components: {
          Field: '@/components/puck/launch-editor-button',
        },
      },
    },
    {
      name: 'meta',
      type: 'group',
      label: 'SEO',
      fields: [
        { name: 'title', type: 'text', label: 'Meta Title' },
        { name: 'description', type: 'textarea', label: 'Meta Description' },
        { name: 'ogImage', type: 'text', label: 'Open Graph Image URL' },
      ],
    },
    {
      name: 'layout',
      type: 'blocks',
      label: 'Page Builder',
      blocks,
      admin: {
        condition: (data) => data?.layoutMode !== 'puck',
      },
    },
    {
      name: 'puckContent',
      type: 'json',
      admin: {
        condition: (data) => data?.layoutMode === 'puck',
        hidden: true,
      },
    },
  ],
}
