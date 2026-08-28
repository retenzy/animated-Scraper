import { getPayload } from 'payload'
import config from '@payload-config'

interface RichTextNode {
  type: string
  version: number
  format: string
  indent: number
  direction: string
  textFormat: number
  textStyle: string
  tag?: string
  [k: string]: unknown
  children: { type: string; version: number; [k: string]: unknown }[]
}

function textNode(text: string) {
  return {
    type: 'text' as const,
    version: 1,
    detail: 0,
    format: 0,
    mode: 'normal',
    style: '',
    text,
  }
}

function paragraph(text: string): RichTextNode {
  return {
    type: 'paragraph',
    version: 1,
    format: '',
    indent: 0,
    direction: 'ltr',
    textFormat: 0,
    textStyle: '',
    children: [textNode(text)],
  }
}

function heading(tag: 'h2' | 'h3', text: string): RichTextNode {
  return {
    type: 'heading',
    version: 1,
    format: '',
    indent: 0,
    direction: 'ltr',
    textFormat: 0,
    textStyle: '',
    tag,
    children: [textNode(text)],
  }
}

function rootContent(children: RichTextNode[]) {
  return {
    root: {
      type: 'root' as const,
      version: 1,
      format: '' as const,
      indent: 0,
      direction: 'ltr' as const,
      children,
    },
  }
}

const LOGO_URL =
  'https://retenzy.b-cdn.net/wp-content/uploads/2026/07/retenzt-logo-scaled-e1785243763292.png'

const landingData = {
  seo: {
    title: 'Retenzy - Extract Amazon Reviews in Seconds',
    description:
      'High-speed local scraping of Amazon reviews powered by Chrome extension. Manage credits, export CSV data, and sync with your dashboard.',
    keywords: 'amazon reviews, review scraper, amazon scraper, csv export, chrome extension',
    ogImage: '/icon.png',
  },
  navbar: {
    logoUrl: LOGO_URL,
    navLinks: [
      { label: 'Features', href: '#features' },
      { label: 'How it works', href: '#how-it-works' },
      { label: 'Pricing', href: '#pricing' },
    ],
    loginLabel: 'Log in',
    ctaLabel: 'Get started',
  },
  hero: {
    badge: 'Trusted by 5,000+ sellers',
    title: 'Extract Amazon reviews',
    highlightedText: 'in seconds',
    subtitle:
      'High-speed local scraping powered by a Chrome extension. Secure credentials, credit-based billing, and instant CSV exports.',
    primaryCtaLabel: 'Get started',
    secondaryCtaLabel: 'Install extension',
    stats: [
      { value: '1M+', label: 'Reviews extracted' },
      { value: '50ms', label: 'Per product avg' },
      { value: '99.8%', label: 'Success rate' },
    ],
  },
  features: {
    heading: 'Everything you need',
    subheading:
      'Build your Amazon research workflow with powerful features designed for sellers and researchers',
    items: [
      {
        icon: 'zap',
        title: 'Lightning fast',
        description:
          'Extract thousands of reviews in minutes with optimized local processing',
      },
      {
        icon: 'lock',
        title: 'Local & secure',
        description: 'All data stays on your computer. No cloud uploads, complete privacy',
      },
      {
        icon: 'download',
        title: 'Export as CSV',
        description:
          'Download research-ready datasets instantly for analysis and reporting',
      },
      {
        icon: 'chart',
        title: 'Credit system',
        description:
          'Simple 1 coin = 1 product pricing. Purchase credits as you grow',
      },
      {
        icon: 'sync',
        title: 'Auto-sync',
        description:
          'Seamless sync between extension and dashboard. Update from anywhere',
      },
      {
        icon: 'globe',
        title: 'Secure storage',
        description:
          'Cloud-backed authentication and account management for peace of mind',
      },
    ],
  },
  statistics: {
    heading: 'Retenzy by the numbers',
    subheading: 'Real results from real sellers and researchers',
    stats: [
      { value: '5,000+', label: 'Active sellers' },
      { value: '1M+', label: 'Reviews extracted' },
      { value: '99.8%', label: 'Success rate' },
    ],
  },
  howItWorks: {
    heading: 'Simple workflow',
    subheading: 'Get started in minutes. No setup headaches or complex configurations.',
    steps: [
      {
        number: '01',
        title: 'Login & connect',
        description:
          'Sign up with email or Google. Install the Chrome extension and connect it to your account.',
      },
      {
        number: '02',
        title: 'Purchase credits',
        description:
          'Buy coins via Stripe. Credits roll over each month—use them whenever you need.',
      },
      {
        number: '03',
        title: 'Start extracting',
        description:
          'Open Amazon product pages or paste ASINs in the extension popup. Watch reviews load in real-time.',
      },
      {
        number: '04',
        title: 'Export & analyze',
        description:
          'Download reviews as CSV instantly. Keep all data local for competitive research and insights.',
      },
    ],
    benefitsTitle: 'Why teams love Retenzy',
    benefits: [
      'Save hours on manual review collection',
      'Keep data completely local and fast',
      'One-click sync across all devices',
      'Track usage and credits from dashboard',
      'Process live Amazon domains instantly',
      'Scale from 1 to 1000+ extractions',
    ],
  },
  testimonials: {
    heading: 'Loved by sellers worldwide',
    subheading: 'Here is what our users say about extracting reviews with Retenzy',
    items: [
      {
        quote:
          'Retenzy cut our review collection time from hours to minutes. The CSV export is a game changer for our competitor research.',
        name: 'Marcus T.',
        role: 'Amazon FBA Seller',
      },
      {
        quote:
          'Everything stays local, which was the deciding factor for us. Fast, private, and incredibly easy to use.',
        name: 'Sofia R.',
        role: 'E-commerce Researcher',
      },
      {
        quote:
          'The credit system is simple and fair. We scaled from a few products to 1,000+ extractions without any friction.',
        name: 'Daniel K.',
        role: 'Growth Marketer',
      },
    ],
  },
  faq: {
    heading: 'Frequently asked questions',
    subheading: 'Everything you need to know before getting started',
    items: [
      {
        question: 'Do I need to install anything?',
        answer:
          'Yes. Retenzy works through a Chrome extension that runs the scraping locally on your computer. Install it from the Chrome Web Store and connect it to your account in one click.',
      },
      {
        question: 'Where does my data go?',
        answer:
          'Your data stays on your computer. Scraping is performed locally by the extension and nothing is uploaded to the cloud unless you choose to sync it with your dashboard.',
      },
      {
        question: 'How does the credit system work?',
        answer:
          'One coin equals one product extraction. Purchase credit packs via Stripe and they roll over each month, so you only pay for what you actually use.',
      },
      {
        question: 'Can I export the reviews?',
        answer:
          'Yes. Every extraction can be exported as a CSV file instantly, ready for analysis, reporting, or feeding into your own tools.',
      },
    ],
  },
  cta: {
    heading: 'Ready to extract reviews in seconds?',
    subtitle:
      'Join 5,000+ sellers and researchers who trust Retenzy for fast, private Amazon review data.',
    buttonLabel: 'Get started',
  },
  footer: {
    brandName: 'Retenzy',
    tagline:
      'Extract Amazon reviews fast. Local scraping, credit-based control, and secure sync.',
    links: [
      { label: 'Features', href: '#features' },
      { label: 'How it works', href: '#how-it-works' },
      { label: 'Pricing', href: '#pricing' },
    ],
    copyright: 'Retenzy. Built with Next.js, shadcn/ui, and Chrome extension APIs.',
  },
}

const samplePosts = [
  {
    title: 'How to Export Amazon Reviews to CSV',
    slug: 'export-amazon-reviews-to-csv',
    excerpt:
      'Learn how to export thousands of Amazon reviews to CSV in minutes using the Retenzy Chrome extension.',
    author: 'Retenzy Team',
    tags: ['tutorial', 'csv'],
    content: rootContent([
      heading('h2', 'Extracting reviews is now a one-click job'),
      paragraph(
        'Manually copying Amazon reviews into spreadsheets is painful and error-prone. With Retenzy, you can pull every review for a product straight into a clean CSV file in seconds.',
      ),
      heading('h2', 'Step by step'),
      paragraph(
        'Install the Chrome extension, log in, and open any Amazon product page. Click the Retenzy icon and press Start extraction. The reviews load in real time while staying local to your machine.',
      ),
      paragraph(
        'Once the extraction finishes, hit Export CSV and a research-ready dataset downloads instantly. No cloud uploads, no format cleanup required.',
      ),
    ]),
  },
  {
    title: '5 Ways Sellers Use Review Data for Product Research',
    slug: 'review-data-product-research',
    excerpt:
      'Discover how successful Amazon sellers turn review data into smarter product decisions.',
    author: 'Retenzy Team',
    tags: ['strategy', 'research'],
    content: rootContent([
      heading('h2', 'Review data is a goldmine'),
      paragraph(
        'Customer reviews reveal what buyers love, what they complain about, and where your competitors drop the ball. Here are five ways sellers use that data.',
      ),
      heading('h3', '1. Feature gap analysis'),
      paragraph(
        'Group review keywords to find the features customers keep asking for. Ship them before your competitors do.',
      ),
      heading('h3', '2. Sentiment tracking over time'),
      paragraph(
        'Export monthly snapshots of reviews to track sentiment as products and listings evolve.',
      ),
      heading('h3', '3. Competitor teardown'),
      paragraph(
        'Extract reviews for competing ASINs and build a battle card of strengths and weaknesses.',
      ),
    ]),
  },
]

const samplePages = [
  {
    title: 'About Retenzy',
    slug: 'about',
    meta: {
      title: 'About Retenzy',
      description:
        'Learn how Retenzy helps sellers and researchers extract Amazon reviews quickly, privately, and affordably.',
    },
    layout: [
      {
        blockType: 'hero',
        badge: 'About us',
        title: 'Built to make',
        highlightedText: 'review research effortless',
        subtitle:
          'Retenzy started with a simple idea: Amazon review extraction should be fast, private, and affordable for everyone.',
        primaryCtaLabel: 'Get started',
        stats: [
          { value: '5,000+', label: 'Active sellers' },
          { value: '1M+', label: 'Reviews extracted' },
          { value: '24/7', label: 'Support' },
        ],
      },
      {
        blockType: 'rich-text',
        content: rootContent([
          heading('h2', 'Our mission'),
          paragraph(
            'We believe product research should not require expensive tools or risky cloud scrapers. Retenzy runs extraction locally in your browser, keeps your data on your machine, and makes the whole workflow feel effortless.',
          ),
          heading('h2', 'What we value'),
          paragraph(
            'Privacy first. Data that never leaves your computer. Simple, predictable pricing with credits that roll over. And a product that gets out of your way so you can focus on selling.',
          ),
        ]),
      },
      {
        blockType: 'statistics',
        heading: 'The Retenzy difference',
        subheading: 'Fast, private, and built for scale',
        stats: [
          { value: '50ms', label: 'Per product avg' },
          { value: '99.8%', label: 'Success rate' },
          { value: '1000+', label: 'Extractions scale' },
        ],
      },
      {
        blockType: 'cta',
        heading: 'Start extracting today',
        subtitle:
          'Join thousands of sellers and researchers who trust Retenzy for fast, private Amazon review data.',
        buttonLabel: 'Get started',
      },
    ],
  },
]

const puckNodes = [
  {
    type: 'Section',
    props: { background: 'none', padding: 'lg', maxWidth: 'narrow' },
    zones: {
      children: [
        {
          type: 'Heading',
          props: { text: 'Built for sellers who move fast', level: '2', align: 'center' },
        },
        {
          type: 'Subheading',
          props: { text: 'Everything you need to extract, analyze, and act on Amazon review data' },
        },
        {
          type: 'Spacer',
          props: { height: 32 },
        },
        {
          type: 'Columns',
          props: { gap: 'lg', valign: 'top' },
          zones: {
            left: [
              {
                type: 'Card',
                props: {
                  icon: 'zap',
                  title: 'Lightning fast',
                  text: 'Extract thousands of reviews in minutes with optimized local processing.',
                  linkLabel: 'Learn more',
                  linkHref: '#',
                },
              },
            ],
            right: [
              {
                type: 'Card',
                props: {
                  icon: 'lock',
                  title: 'Local & secure',
                  text: 'All data stays on your computer. No cloud uploads, complete privacy.',
                  linkLabel: 'Learn more',
                  linkHref: '#',
                },
              },
            ],
          },
        },
      ],
    },
  },
  {
    type: 'Section',
    props: { background: 'muted', padding: 'lg', maxWidth: 'wide' },
    zones: {
      children: [
        {
          type: 'Heading',
          props: { text: 'How it works', level: '2', align: 'center' },
        },
        {
          type: 'Subheading',
          props: { text: 'Four simple steps from install to insight' },
        },
        {
          type: 'Spacer',
          props: { height: 32 },
        },
        {
          type: 'Grid',
          props: { columns: '3', gap: 'md' },
          zones: {
            items: [
              {
                type: 'CardMedia',
                props: {
                  title: 'Install & connect',
                  text: 'Add the Chrome extension and sign in with your account.',
                  mediaSide: 'top',
                },
              },
              {
                type: 'CardMedia',
                props: {
                  title: 'Purchase credits',
                  text: 'Buy coins via Stripe. Credits roll over each month.',
                  mediaSide: 'top',
                },
              },
              {
                type: 'CardMedia',
                props: {
                  title: 'Extract reviews',
                  text: 'Open any Amazon product page and click Start.',
                  mediaSide: 'top',
                },
              },
            ],
          },
        },
      ],
    },
  },
  {
    type: 'Section',
    props: { background: 'primary', padding: 'lg', maxWidth: 'narrow' },
    zones: {
      children: [
        {
          type: 'Heading',
          props: { text: 'Ready to extract reviews in seconds?', level: '2', align: 'center' },
        },
        {
          type: 'Spacer',
          props: { height: 16 },
        },
        {
          type: 'Paragraph',
          props: { text: 'Join 5,000+ sellers and researchers who trust Retenzy for fast, private Amazon review data.' },
        },
        {
          type: 'Spacer',
          props: { height: 24 },
        },
        {
          type: 'Button',
          props: { label: 'Get started', href: '/sign-up', variant: 'primary', size: 'lg' },
        },
      ],
    },
  },
]

const samplePuckPages = [
  {
    title: 'Features Overview',
    slug: 'features-overview',
    meta: {
      title: 'Features Overview',
      description:
        'A tour of everything Retenzy can do — built with the visual Puck editor.',
    },
    layoutMode: 'puck',
    puckContent: {
      root: {
        props: {},
        zones: {
          content: puckNodes,
        },
      },
      content: puckNodes,
    },
  },
]

const payload = await getPayload({ config })

const landing = await payload.findGlobal({ slug: 'landing-page' })

if (!landing?.hero?.title && !landing?.seo?.title) {
  await payload.updateGlobal({
    slug: 'landing-page',
    data: landingData,
  })
  console.log('✓ Seeded landing page content')
} else {
  console.log('• Landing page already has content, skipping')
}

const existingPosts = await payload.find({
  collection: 'posts',
  limit: 1,
  pagination: false,
})

if (existingPosts.docs.length === 0) {
  for (const post of samplePosts) {
    await payload.create({
      collection: 'posts',
      data: {
        ...post,
        publishedDate: new Date().toISOString(),
        _status: 'published',
      },
    })
    console.log(`✓ Seeded blog post: ${post.title}`)
  }
} else {
  console.log('• Blog posts already exist, skipping')
}

for (const page of [...samplePages, ...samplePuckPages]) {
  const existing = await payload.find({
    collection: 'pages',
    where: { slug: { equals: page.slug } },
    limit: 1,
    pagination: false,
  })
  if (existing.docs.length > 0) {
    console.log(`• Page already exists, skipping: ${page.title}`)
    continue
  }
  await payload.create({
    collection: 'pages',
    data: {
      ...page,
      _status: 'published',
    },
  })
  console.log(`✓ Seeded page: ${page.title}`)
}

console.log('Seed complete.')
