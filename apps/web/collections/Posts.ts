import type { CollectionConfig } from 'payload'

export const Posts: CollectionConfig = {
  slug: 'posts',
  labels: {
    singular: 'Blog Post',
    plural: 'Blog Posts',
  },
  admin: {
    group: 'Content',
    useAsTitle: 'title',
    defaultColumns: ['title', '_status', 'publishedDate'],
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
        position: 'sidebar',
      },
    },
    {
      name: 'excerpt',
      type: 'textarea',
      admin: {
        description: 'Short summary shown on the blog listing page and in SEO.',
      },
    },
    {
      name: 'coverImage',
      type: 'text',
      admin: {
        description: 'Absolute URL of the cover image.',
      },
    },
    {
      name: 'layoutMode',
      type: 'select',
      defaultValue: 'blocks',
      admin: {
        position: 'sidebar',
        description: 'Choose how this post is built: form blocks or the visual Puck editor.',
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
      name: 'content',
      type: 'richText',
      required: true,
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
    {
      name: 'author',
      type: 'text',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'publishedDate',
      type: 'date',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'tags',
      type: 'text',
      hasMany: true,
    },
  ],
}
