import type { Block } from 'payload'

export const SpacerBlock: Block = {
  slug: 'spacer',
  labels: {
    singular: 'Spacer',
    plural: 'Spacer Blocks',
  },
  fields: [
    {
      name: 'height',
      type: 'number',
      label: 'Height (px)',
      defaultValue: 80,
      admin: {
        description: 'Vertical space added before the next block.',
      },
    },
  ],
}
