import type { Block } from 'payload'

export const StatisticsBlock: Block = {
  slug: 'statistics',
  labels: {
    singular: 'Statistics',
    plural: 'Statistics Blocks',
  },
  fields: [
    { name: 'heading', type: 'text' },
    { name: 'subheading', type: 'textarea' },
    {
      name: 'stats',
      type: 'array',
      label: 'Statistics',
      fields: [
        { name: 'value', type: 'text', required: true },
        { name: 'label', type: 'text', required: true },
      ],
    },
  ],
}
