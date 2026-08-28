import type { GlobalConfig } from 'payload'

export const LandingPage: GlobalConfig = {
  slug: 'landing-page',
  label: 'Landing Page',
  access: {
    read: () => true,
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'SEO',
          name: 'seo',
          fields: [
            { name: 'title', type: 'text', label: 'Meta Title' },
            { name: 'description', type: 'textarea', label: 'Meta Description' },
            { name: 'keywords', type: 'text', label: 'Meta Keywords' },
            { name: 'ogImage', type: 'text', label: 'Open Graph Image URL' },
          ],
        },
        {
          label: 'Navbar',
          name: 'navbar',
          fields: [
            { name: 'logoUrl', type: 'text', label: 'Logo Image URL' },
            { name: 'logoText', type: 'text', label: 'Logo Text (optional)' },
            {
              name: 'navLinks',
              type: 'array',
              label: 'Navigation Links',
              fields: [
                { name: 'label', type: 'text', required: true },
                { name: 'href', type: 'text', required: true },
              ],
            },
            { name: 'loginLabel', type: 'text', defaultValue: 'Log in' },
            { name: 'ctaLabel', type: 'text', defaultValue: 'Get started' },
          ],
        },
        {
          label: 'Hero',
          name: 'hero',
          fields: [
            { name: 'badge', type: 'text' },
            { name: 'title', type: 'text' },
            { name: 'highlightedText', type: 'text', label: 'Highlighted Text (accent color)' },
            { name: 'subtitle', type: 'textarea' },
            { name: 'primaryCtaLabel', type: 'text', defaultValue: 'Get started' },
            { name: 'secondaryCtaLabel', type: 'text', defaultValue: 'Install extension' },
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
        },
        {
          label: 'Features',
          name: 'features',
          fields: [
            { name: 'heading', type: 'text' },
            { name: 'subheading', type: 'textarea' },
            {
              name: 'items',
              type: 'array',
              label: 'Features',
              fields: [
                {
                  name: 'icon',
                  type: 'text',
                  admin: {
                    description: 'Icon key: zap, lock, download, chart, sync, globe',
                  },
                },
                { name: 'title', type: 'text', required: true },
                { name: 'description', type: 'textarea', required: true },
              ],
            },
          ],
        },
        {
          label: 'Statistics',
          name: 'statistics',
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
        },
        {
          label: 'How It Works',
          name: 'howItWorks',
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
        },
        {
          label: 'Testimonials',
          name: 'testimonials',
          fields: [
            { name: 'heading', type: 'text' },
            { name: 'subheading', type: 'textarea' },
            {
              name: 'items',
              type: 'array',
              label: 'Testimonials',
              fields: [
                { name: 'quote', type: 'textarea', required: true },
                { name: 'name', type: 'text', required: true },
                { name: 'role', type: 'text' },
              ],
            },
          ],
        },
        {
          label: 'FAQ',
          name: 'faq',
          fields: [
            { name: 'heading', type: 'text' },
            { name: 'subheading', type: 'textarea' },
            {
              name: 'items',
              type: 'array',
              label: 'Questions',
              fields: [
                { name: 'question', type: 'text', required: true },
                { name: 'answer', type: 'textarea', required: true },
              ],
            },
          ],
        },
        {
          label: 'CTA',
          name: 'cta',
          fields: [
            { name: 'heading', type: 'text' },
            { name: 'subtitle', type: 'textarea' },
            { name: 'buttonLabel', type: 'text', defaultValue: 'Get started' },
          ],
        },
        {
          label: 'Footer',
          name: 'footer',
          fields: [
            { name: 'brandName', type: 'text' },
            { name: 'tagline', type: 'textarea' },
            {
              name: 'links',
              type: 'array',
              label: 'Links',
              fields: [
                { name: 'label', type: 'text', required: true },
                { name: 'href', type: 'text', required: true },
              ],
            },
            { name: 'copyright', type: 'text' },
          ],
        },
      ],
    },
  ],
}
