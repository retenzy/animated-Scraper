import type { Block } from 'payload'
import { CtaBlock } from './CtaBlock'
import { FaqBlock } from './FaqBlock'
import { FeaturesBlock } from './FeaturesBlock'
import { HeroBlock } from './HeroBlock'
import { HowItWorksBlock } from './HowItWorksBlock'
import { ImageBlock } from './ImageBlock'
import { RichTextBlock } from './RichTextBlock'
import { SpacerBlock } from './SpacerBlock'
import { StatisticsBlock } from './StatisticsBlock'
import { TestimonialsBlock } from './TestimonialsBlock'

export const blocks: Block[] = [
  HeroBlock,
  FeaturesBlock,
  StatisticsBlock,
  HowItWorksBlock,
  TestimonialsBlock,
  FaqBlock,
  CtaBlock,
  RichTextBlock,
  ImageBlock,
  SpacerBlock,
]
