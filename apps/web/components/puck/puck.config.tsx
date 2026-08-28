import type { Config, CustomField } from '@puckeditor/core'
import type { ReactNode } from 'react'
import Image from 'next/image'
import Hero from '@/components/hero'
import Features from '@/components/features'
import Faq from '@/components/faq'
import Cta from '@/components/cta'
import BlockSection from '@/components/blocks/section'
import BlockContainer from '@/components/blocks/container'
import BlockColumns from '@/components/blocks/columns'
import BlockGrid, { Row as BlockRow } from '@/components/blocks/grid'
import BlockCard from '@/components/blocks/card'
import BlockCardMedia from '@/components/blocks/card-media'
import BlockHeading from '@/components/blocks/heading'
import BlockSubheading from '@/components/blocks/subheading'
import BlockParagraph from '@/components/blocks/paragraph'
import BlockList from '@/components/blocks/list'
import BlockToc from '@/components/blocks/toc'
import BlockLink from '@/components/blocks/link'
import BlockButton, { borderRadiusMap } from '@/components/blocks/button'
import BlockImage from '@/components/blocks/image'
import BlockDivider from '@/components/blocks/divider'
import BlockSpacer from '@/components/blocks/spacer'
import BlockHtml from '@/components/blocks/html'
import { ColorFieldRenderer } from '@/components/puck/color-field'

export type PuckPageProps = {
  Hero: {
    content?: {
      badge?: string
      title?: string
      highlightedText?: string
      subtitle?: string
    }
    callToAction?: {
      primaryCtaLabel?: string
      secondaryCtaLabel?: string
    }
    stats?: { value: string; label: string }[]
  }
  Features: {
    content?: {
      heading?: string
      subheading?: string
    }
    items?: { icon?: string; title: string; description: string }[]
  }
  Faq: {
    content?: {
      heading?: string
      subheading?: string
    }
    items?: { question: string; answer: string }[]
  }
  Cta: {
    content?: {
      heading?: string
      subtitle?: string
    }
    buttonLabel?: string
    anchorId?: string
  }
  Section: {
    children?: () => ReactNode
    background?: string
    padding?: 'none' | 'sm' | 'md' | 'lg'
    maxWidth?: 'full' | 'wide' | 'container' | 'narrow'
    id?: string
    textColor?: string
    customCss?: string
  }
  Container: {
    children?: () => ReactNode
    maxWidth?: 'full' | 'wide' | 'container' | 'narrow'
    padding?: 'none' | 'sm' | 'md' | 'lg'
    anchorId?: string
    customCss?: string
  }
  Columns: {
    left?: () => ReactNode
    right?: () => ReactNode
    gap?: 'sm' | 'md' | 'lg'
    valign?: 'top' | 'center' | 'bottom'
  }
  Grid: {
    children?: () => ReactNode
    responsive?: string
    rowGap?: string
    gap?: 'sm' | 'md' | 'lg'
    anchorId?: string
    customCss?: string
  }
  Row: {
    columns?: { width?: string; items?: () => ReactNode }[]
    responsive?: string
    colGap?: string
    align?: string
    justify?: string
  }
  Card: {
    items?: () => ReactNode
    icon?: string
    title?: string
    text?: string
    linkLabel?: string
    linkHref?: string
    backgroundColor?: string
    textColor?: string
    anchorId?: string
  }
  CardMedia: {
    media?: () => ReactNode
    title?: string
    text?: string
    linkLabel?: string
    linkHref?: string
    mediaSide?: 'top' | 'left'
  }
  Heading: {
    text?: string
    level?: '2' | '3' | '4'
    align?: 'left' | 'center' | 'right'
    anchorId?: string
  } & Partial<Record<StylePropNames, string>>
  Subheading: {
    text?: string
    align?: 'left' | 'center' | 'right'
    anchorId?: string
  } & Partial<Record<StylePropNames, string>>
  Paragraph: {
    text?: string
    align?: 'left' | 'center' | 'right'
    anchorId?: string
  } & Partial<Record<StylePropNames, string>>
  List: {
    items?: { text?: string; href?: string }[]
    ordered?: 'yes' | 'no'
    align?: 'left' | 'center' | 'right'
    anchorId?: string
  } & Partial<Record<StylePropNames, string>>
  Link: {
    label?: string
    href?: string
    align?: 'left' | 'center' | 'right'
  }
  TableOfContents: {
    title?: string
    items?: { text?: string; anchor?: string }[]
  }
  Button: {
    label?: string
    href?: string
    variant?: 'primary' | 'outline' | 'ghost' | 'link'
    size?: 'default' | 'sm' | 'lg'
    align?: 'left' | 'center' | 'right'
    borderRadius?: string
    anchorId?: string
  } & Partial<Record<StylePropNames, string>>
  Image: {
    imageUrl?: string
    alt?: string
    caption?: string
    anchorId?: string
    ratio?: 'video' | 'square' | 'portrait' | 'wide'
    align?: 'left' | 'center' | 'right'
    rounded?: 'yes' | 'no'
    customCss?: string
  }
  Divider: {
    width?: 'full' | 'medium' | 'small'
    customCss?: string
  }
  Spacer: {
    height?: number
    customCss?: string
  }
  Html: {
    html?: string
    backgroundColor?: string
    textColor?: string
    padding?: 'none' | 'sm' | 'md' | 'lg'
    margin?: 'none' | 'sm' | 'md' | 'lg'
  }
}

const text = (label: string) => ({ type: 'text' as const, label })
const textarea = (label: string) => ({ type: 'textarea' as const, label })
const number = (label: string) => ({ type: 'number' as const, label })

const select = <T extends string>(label: string, options: [string, T][]) => ({
  type: 'select' as const,
  label,
  options: options.map(([value, label2]) => ({ value: label2, label: value })),
})

const objectGroup = (label: string, objectFields: Record<string, unknown>) => ({
  type: 'object' as const,
  label,
  objectFields,
})

const slot = (allow?: string[]) => ({ type: 'slot' as const, allow })

const gapSelect = (label: string) =>
  select(label, [
    ['None', 'none'],
    ['Small', 'sm'],
    ['Medium', 'md'],
    ['Large', 'lg'],
  ])

const anchorIdField = () => text('Anchor ID (for #deep-links)')

// Blocks allowed inside generic content containers (Grid columns, Columns sides, etc.)
const contentBlocks = [
  'Heading',
  'Subheading',
  'Paragraph',
  'List',
  'Link',
  'Button',
  'Cta',
  'Card',
  'CardMedia',
  'Html',
  'Image',
  'TableOfContents',
  'Divider',
  'Spacer',
] as const

const contentSlot = () => slot([...contentBlocks])

const colorField = (label: string): CustomField<string | undefined> => ({
  type: 'custom' as const,
  label,
  render: ColorFieldRenderer,
})

const styleFields = {
  backgroundColor: colorField('Background color'),
  textColor: colorField('Text color'),
  customCss: {
    type: 'textarea' as const,
    label: 'Custom CSS (scoped to this block)',
  },
  fontSize: select('Font size', [
    ['Default', 'inherit'],
    ['Small', 'sm'],
    ['Base', 'base'],
    ['Large', 'lg'],
    ['XL', 'xl'],
    ['2XL', '2xl'],
    ['3XL', '3xl'],
    ['4XL', '4xl'],
  ]),
  fontWeight: select('Font weight', [
    ['Default', 'inherit'],
    ['Normal', 'normal'],
    ['Medium', 'medium'],
    ['Semibold', 'semibold'],
    ['Bold', 'bold'],
  ]),
  padding: select('Padding', [
    ['None', 'none'],
    ['Small', 'sm'],
    ['Medium', 'md'],
    ['Large', 'lg'],
  ]),
  margin: select('Margin', [
    ['None', 'none'],
    ['Small', 'sm'],
    ['Medium', 'md'],
    ['Large', 'lg'],
  ]),
}

type StylePropNames = keyof typeof styleFields

export const puckConfig: Config<PuckPageProps> = {
  categories: {
    sections: {
      title: 'Sections',
      components: ['Hero', 'Features', 'Faq', 'Cta'],
    },
    layout: {
      title: 'Layout',
      components: ['Section', 'Container', 'Columns', 'Grid', 'Row', 'Card', 'CardMedia', 'Html'],
    },
    content: {
      title: 'Content',
      components: ['Heading', 'Subheading', 'Paragraph', 'List', 'TableOfContents', 'Link', 'Button', 'Image', 'Divider', 'Spacer'],
    },
  },
  components: {
    Hero: {
      fields: {
        content: objectGroup('Content', {
          badge: text('Badge'),
          title: text('Title'),
          highlightedText: text('Highlighted text'),
          subtitle: textarea('Subtitle'),
        }),
        callToAction: objectGroup('Buttons', {
          primaryCtaLabel: text('Primary button'),
          secondaryCtaLabel: text('Secondary button'),
        }),
        stats: {
          type: 'array',
          label: 'Stats',
          arrayFields: {
            value: text('Value'),
            label: text('Label'),
          },
        },
      },
      defaultProps: {
        content: {
          badge: 'Trusted by 5,000+ sellers',
          title: 'Extract Amazon reviews',
          highlightedText: 'in seconds',
          subtitle:
            'High-speed local scraping powered by a Chrome extension. Secure credentials, credit-based billing, and instant CSV exports.',
        },
        callToAction: {
          primaryCtaLabel: 'Get started',
          secondaryCtaLabel: 'Install extension',
        },
      },
      render: (props) => {
        const content = props.content ?? {}
        const cta = props.callToAction ?? {}
        return (
          <Hero
            hero={{
              badge: content.badge,
              title: content.title,
              highlightedText: content.highlightedText,
              subtitle: content.subtitle,
              primaryCtaLabel: cta.primaryCtaLabel,
              secondaryCtaLabel: cta.secondaryCtaLabel,
              stats: props.stats,
            }}
          />
        )
      },
    },
    Features: {
      fields: {
        content: objectGroup('Content', {
          heading: text('Heading'),
          subheading: textarea('Subheading'),
        }),
        items: {
          type: 'array',
          label: 'Features',
          arrayFields: {
            icon: text('Icon'),
            title: text('Title'),
            description: textarea('Description'),
          },
        },
      },
      defaultProps: {
        content: {
          heading: 'Everything you need',
          subheading: 'Build your Amazon research workflow with powerful features',
        },
      },
      render: (props) => {
        const content = props.content ?? {}
        return <Features features={{ heading: content.heading, subheading: content.subheading, items: props.items }} />
      },
    },
    Faq: {
      fields: {
        content: objectGroup('Content', {
          heading: text('Heading'),
          subheading: textarea('Subheading'),
        }),
        items: {
          type: 'array',
          label: 'Questions',
          arrayFields: {
            question: text('Question'),
            answer: textarea('Answer'),
          },
        },
      },
      defaultProps: {
        content: {
          heading: 'Frequently asked questions',
        },
      },
      render: (props) => {
        const content = props.content ?? {}
        return <Faq faq={{ heading: content.heading, subheading: content.subheading, items: props.items }} />
      },
    },
    Cta: {
      fields: {
        content: objectGroup('Content', {
          heading: text('Heading'),
          subtitle: textarea('Subtitle'),
        }),
        buttonLabel: text('Button label'),
        anchorId: anchorIdField(),
      },
      defaultProps: {
        content: {
          heading: 'Ready to extract reviews in seconds?',
          subtitle: 'Join thousands of sellers who trust Retenzy.',
        },
        buttonLabel: 'Get started',
      },
      render: (props) => {
        const content = props.content ?? {}
        return (
          <div id={props.anchorId || undefined}>
            <Cta cta={{ heading: content.heading, subtitle: content.subtitle, buttonLabel: props.buttonLabel }} />
          </div>
        )
      },
    },
    Section: {
      fields: {
        children: slot(),
        background: colorField('Background'),
        padding: select('Padding', [
          ['None', 'none'],
          ['Small', 'sm'],
          ['Medium', 'md'],
          ['Large', 'lg'],
        ]),
        maxWidth: select('Max width', [
          ['Full', 'full'],
          ['Wide', 'wide'],
          ['Container', 'container'],
          ['Narrow', 'narrow'],
        ]),
        id: text('Anchor id'),
        textColor: styleFields.textColor,
        customCss: styleFields.customCss,
      },
      defaultProps: {
        background: 'none',
        padding: 'lg',
        maxWidth: 'container',
      },
      render: ({ children, background, padding, maxWidth, id, textColor, customCss }) => (
        <BlockSection background={background} padding={padding} maxWidth={maxWidth} id={id} textColor={textColor} puckId={id} customCss={customCss}>
          {children}
        </BlockSection>
      ),
    },
    Container: {
      fields: {
        children: slot(),
        maxWidth: select('Max width', [
          ['Full', 'full'],
          ['Wide', 'wide'],
          ['Container', 'container'],
          ['Narrow', 'narrow'],
        ]),
        padding: select('Padding', [
          ['None', 'none'],
          ['Small', 'sm'],
          ['Medium', 'md'],
          ['Large', 'lg'],
        ]),
        anchorId: anchorIdField(),
        customCss: styleFields.customCss,
      },
      defaultProps: {
        maxWidth: 'container',
        padding: 'md',
      },
      render: ({ id, children, maxWidth, padding, anchorId, customCss }) => (
        <BlockContainer maxWidth={maxWidth} padding={padding} anchorId={anchorId} puckId={id} customCss={customCss}>
          {children}
        </BlockContainer>
      ),
    },
    Columns: {
      fields: {
        left: contentSlot(),
        right: contentSlot(),
        gap: select('Gap', [
          ['Small', 'sm'],
          ['Medium', 'md'],
          ['Large', 'lg'],
        ]),
        valign: select('Vertical align', [
          ['Top', 'top'],
          ['Center', 'center'],
          ['Bottom', 'bottom'],
        ]),
      },
      defaultProps: {
        gap: 'md',
        valign: 'top',
      },
      render: ({ left, right, gap, valign }) => (
        <BlockColumns left={left} right={right} gap={gap} valign={valign} />
      ),
    },
    Grid: {
      fields: {
        children: slot(['Row']),
        responsive: select('Responsive', [
          ['Stack on mobile, side-by-side on desktop', 'yes'],
          ['Always side-by-side', 'no'],
        ]),
        rowGap: gapSelect('Row gap'),
        anchorId: anchorIdField(),
        customCss: styleFields.customCss,
      },
      defaultProps: {
        responsive: 'yes',
        rowGap: 'md',
      },
      render: ({ id, children, rowGap, anchorId, customCss }) => (
        <BlockGrid rowGap={(rowGap ?? 'md') as 'none' | 'sm' | 'md' | 'lg'} anchorId={anchorId} puckId={id} customCss={customCss}>
          {children}
        </BlockGrid>
      ),
    },
    Row: {
      fields: {
        columns: {
          type: 'array',
          label: 'Columns',
          getItemSummary: (column, index) => `Column ${(index ?? 0) + 1}`,
          defaultItemProps: { width: 'equal' },
          arrayFields: {
            width: select('Width', [
              ['Equal', 'equal'],
              ['25%', 'quarter'],
              ['33%', 'third'],
              ['50%', 'half'],
              ['66%', 'twothirds'],
              ['75%', 'threequarters'],
              ['100%', 'full'],
            ]),
            items: contentSlot(),
          },
        },
        responsive: select('Responsive', [
          ['Stack on mobile, side-by-side on desktop', 'yes'],
          ['Always side-by-side', 'no'],
        ]),
        colGap: gapSelect('Column gap'),
        align: select('Align items (vertical)', [
          ['Stretch', 'stretch'],
          ['Top', 'start'],
          ['Center', 'center'],
          ['Bottom', 'end'],
        ]),
        justify: select('Justify content (horizontal)', [
          ['Start', 'start'],
          ['Center', 'center'],
          ['End', 'end'],
          ['Space between', 'between'],
        ]),
      },
      defaultProps: {
        columns: [{ width: 'equal' }, { width: 'equal' }, { width: 'equal' }],
        responsive: 'yes',
        colGap: 'md',
        align: 'stretch',
        justify: 'start',
      },
      render: ({ columns, responsive, colGap, align, justify }) => (
        <BlockRow
          columns={columns}
          responsive={responsive !== 'no'}
          colGap={(colGap ?? 'md') as 'none' | 'sm' | 'md' | 'lg'}
          align={align as 'stretch' | 'start' | 'center' | 'end'}
          justify={justify as 'start' | 'center' | 'end' | 'between'}
        />
      ),
    },
    Card: {
      fields: {
        items: contentSlot(),
        icon: select('Icon (optional)', [
          ['None', 'none'],
          ['Zap', 'zap'],
          ['Lock', 'lock'],
          ['Download', 'download'],
          ['Chart', 'chart'],
          ['Sync', 'sync'],
          ['Globe', 'globe'],
          ['Support', 'support'],
        ]),
        title: text('Title'),
        text: textarea('Text'),
        linkLabel: text('Link label'),
        linkHref: text('Link URL'),
        backgroundColor: styleFields.backgroundColor,
        textColor: styleFields.textColor,
        anchorId: anchorIdField(),
      },
      render: ({ id, icon, title, text, linkLabel, linkHref, backgroundColor, textColor, anchorId, items, ...style }) => (
        <BlockCard
          icon={icon}
          title={title}
          text={text}
          linkLabel={linkLabel}
          linkHref={linkHref}
          backgroundColor={backgroundColor}
          textColor={textColor}
          anchorId={anchorId}
          items={items}
          puckId={id}
          {...style}
        />
      ),
    },
    CardMedia: {
      fields: {
        media: slot(['Image', ...contentBlocks]),
        title: text('Title'),
        text: textarea('Text'),
        linkLabel: text('Link label'),
        linkHref: text('Link URL'),
        mediaSide: select('Media position', [
          ['Top', 'top'],
          ['Left', 'left'],
        ]),
      },
      defaultProps: {
        mediaSide: 'top',
      },
      render: ({ media, title, text, linkLabel, linkHref, mediaSide }) => (
        <BlockCardMedia
          media={media}
          title={title}
          text={text}
          linkLabel={linkLabel}
          linkHref={linkHref}
          mediaSide={mediaSide}
        />
      ),
    },
    Heading: {
      fields: {
        text: text('Text'),
        level: select('Level', [
          ['Heading 2', '2'],
          ['Heading 3', '3'],
          ['Heading 4', '4'],
        ]),
        align: select('Align', [
          ['Left', 'left'],
          ['Center', 'center'],
          ['Right', 'right'],
        ]),
        anchorId: anchorIdField(),
        ...styleFields,
      },
      defaultProps: {
        text: 'Your heading here',
        level: '2',
        align: 'left',
      },
      render: ({ id, text, level, align, anchorId, ...style }) => (
        <BlockHeading text={text} level={Number(level) as 2 | 3 | 4} align={align} anchorId={anchorId} puckId={id} {...style} />
      ),
    },
    Subheading: {
      fields: {
        text: text('Text'),
        align: select('Align', [
          ['Left', 'left'],
          ['Center', 'center'],
          ['Right', 'right'],
        ]),
        anchorId: anchorIdField(),
        ...styleFields,
      },
      defaultProps: {
        text: 'SUBTEXT / EYEBROW',
        align: 'left',
      },
      render: ({ id, text, align, anchorId, ...style }) => (
        <BlockSubheading text={text} align={align} anchorId={anchorId} puckId={id} {...style} />
      ),
    },
    Paragraph: {
      fields: {
        text: textarea('Text'),
        align: select('Align', [
          ['Left', 'left'],
          ['Center', 'center'],
          ['Right', 'right'],
        ]),
        anchorId: anchorIdField(),
        ...styleFields,
      },
      defaultProps: {
        text: 'Write your description here. Separate paragraphs with a blank line.',
        align: 'left',
      },
      render: ({ id, text, align, anchorId, ...style }) => (
        <BlockParagraph text={text} align={align} anchorId={anchorId} puckId={id} {...style} />
      ),
    },
    List: {
      fields: {
        items: {
          type: 'array',
          label: 'Items',
          getItemSummary: (item) => item.text || 'Item',
          defaultItemProps: { text: 'List item' },
          arrayFields: {
            text: text('Text'),
            href: text('Link URL (optional)'),
          },
        },
        ordered: select('Style', [
          ['Bullets', 'no'],
          ['Numbers', 'yes'],
        ]),
        align: select('Align', [
          ['Left', 'left'],
          ['Center', 'center'],
          ['Right', 'right'],
        ]),
        anchorId: anchorIdField(),
        ...styleFields,
      },
      defaultProps: {
        items: [{ text: 'First item' }, { text: 'Second item' }, { text: 'Third item' }],
        ordered: 'no',
        align: 'left',
      },
      render: ({ id, items, ordered, align, anchorId, ...style }) => (
        <BlockList
          items={items}
          ordered={ordered === 'yes'}
          align={align}
          anchorId={anchorId}
          puckId={id}
          {...style}
        />
      ),
    },
    Link: {
      fields: {
        label: text('Label'),
        href: text('URL'),
        align: select('Align', [
          ['Left', 'left'],
          ['Center', 'center'],
          ['Right', 'right'],
        ]),
      },
      defaultProps: {
        label: 'Learn more',
        href: '/',
        align: 'left',
      },
      render: ({ label, href, align }) => <BlockLink label={label} href={href} align={align} />,
    },
    TableOfContents: {
      fields: {
        title: text('Title'),
        items: {
          type: 'array',
          label: 'Items',
          getItemSummary: (item) => item.text || 'Item',
          defaultItemProps: { text: 'Section' },
          arrayFields: {
            text: text('Text'),
            anchor: text('Anchor id (e.g. features)'),
          },
        },
      },
      defaultProps: {
        title: 'Table of contents',
        items: [{ text: 'Introduction', anchor: '' }],
      },
      render: ({ title, items }) => <BlockToc title={title} items={items} />,
    },
    Button: {
      fields: {
        label: text('Label'),
        href: text('URL'),
        variant: select('Variant', [
          ['Primary', 'primary'],
          ['Outline', 'outline'],
          ['Ghost', 'ghost'],
          ['Link', 'link'],
        ]),
        size: select('Size', [
          ['Default', 'default'],
          ['Small', 'sm'],
          ['Large', 'lg'],
        ]),
        align: select('Align', [
          ['Left', 'left'],
          ['Center', 'center'],
          ['Right', 'right'],
        ]),
        borderRadius: select('Border radius', [
          ['Default', 'default'],
          ['None', 'none'],
          ['Small', 'sm'],
          ['Medium', 'md'],
          ['Large', 'lg'],
          ['Pill', 'full'],
        ]),
        anchorId: anchorIdField(),
        ...styleFields,
      },
      defaultProps: {
        label: 'Get started',
        href: '/',
        variant: 'primary',
        size: 'default',
        align: 'left',
      },
      render: ({ id, label, href, variant, size, align, borderRadius, anchorId, ...style }) => (
        <BlockButton
          label={label}
          href={href}
          variant={variant}
          size={size}
          align={align}
          borderRadius={(borderRadius ?? 'default') as keyof typeof borderRadiusMap}
          anchorId={anchorId}
          puckId={id}
          {...style}
        />
      ),
    },
    Image: {
      fields: {
        imageUrl: text('Image URL'),
        alt: text('Alt text'),
        caption: text('Caption'),
        ratio: select('Ratio', [
          ['Video (16:9)', 'video'],
          ['Square', 'square'],
          ['Portrait (3:4)', 'portrait'],
          ['Wide (16:7)', 'wide'],
        ]),
        align: select('Align', [
          ['Left', 'left'],
          ['Center', 'center'],
          ['Right', 'right'],
        ]),
        rounded: select('Corners', [
          ['Rounded', 'yes'],
          ['Square', 'no'],
        ]),
        anchorId: anchorIdField(),
        customCss: styleFields.customCss,
      },
      defaultProps: {
        ratio: 'video',
        align: 'left',
        rounded: 'yes',
      },
      render: ({ id, imageUrl, alt, caption, ratio, align, rounded, anchorId, customCss }) => (
        <BlockImage
          src={imageUrl}
          alt={alt}
          caption={caption}
          ratio={ratio}
          align={align}
          rounded={rounded === 'yes'}
          anchorId={anchorId}
          puckId={id}
          customCss={customCss}
        />
      ),
    },
    Divider: {
      fields: {
        width: select('Width', [
          ['Full', 'full'],
          ['Medium', 'medium'],
          ['Small', 'small'],
        ]),
        customCss: styleFields.customCss,
      },
      defaultProps: {
        width: 'full',
      },
      render: ({ id, width, customCss }) => <BlockDivider width={width} puckId={id} customCss={customCss} />,
    },
    Spacer: {
      fields: {
        height: number('Height (px)'),
        customCss: styleFields.customCss,
      },
      defaultProps: {
        height: 64,
      },
      render: ({ id, height, customCss }) => <BlockSpacer height={height} puckId={id} customCss={customCss} />,
    },
    Html: {
      fields: {
        html: textarea('HTML code'),
        backgroundColor: styleFields.backgroundColor,
        textColor: styleFields.textColor,
        padding: styleFields.padding,
        margin: styleFields.margin,
      },
      defaultProps: {
        html: '<p>Paste your HTML here</p>',
      },
      render: ({ id, html, backgroundColor, textColor, padding, margin, ...style }) => (
        <BlockHtml
          html={html}
          backgroundColor={backgroundColor}
          textColor={textColor}
          padding={padding}
          margin={margin}
          puckId={id}
          {...style}
        />
      ),
    },
  },
}
