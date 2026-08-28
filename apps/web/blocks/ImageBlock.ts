import type { Block } from 'payload'

export const ImageBlock: Block = {
  slug: 'image',
  labels: {
    singular: 'Image',
    plural: 'Image Blocks',
  },
  fields: [
    {
      name: 'imageUrl',
      type: 'text',
      label: 'Image URL',
      required: true,
    },
    { name: 'alt', type: 'text', label: 'Alt Text' },
    { name: 'caption', type: 'text' },
  ],
}
