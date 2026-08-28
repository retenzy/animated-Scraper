import type { Block } from 'payload'

export const HowItWorksBlock: Block = {
  slug: 'how-it-works',
  labels: {
    singular: 'How It Works',
    plural: 'How It Works Blocks',
  },
  fields: [
    { name: 'heading', type: 'text' },
    { name: 'subheading', type: 'textarea' },
    {
      name: 'steps',
      type: 'array',
      label: 'Steps',
      fields: [
        { name: 'number', type: 'text', required: true },
        { name: 'title', type: 'text', required: true },
        { name: 'description', type: 'textarea', required: true },
      ],
    },
    { name: 'benefitsTitle', type: 'text' },
    { name: 'benefits', type: 'text', hasMany: true, label: 'Benefits' },
  ],
}
