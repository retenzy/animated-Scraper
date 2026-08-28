import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    group: 'Configuration',
    useAsTitle: 'email',
    defaultColumns: ['name', 'email', 'createdAt', 'updatedAt'],
  },
  auth: true,
  fields: [
    {
      name: 'name',
      type: 'text',
    },
    {
      name: '_passwordAutoOpen',
      type: 'ui',
      admin: {
        components: {
          Field: '@/components/admin/password-auto-open#PasswordAutoOpen',
        },
      },
    },
  ],
}
