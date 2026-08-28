import {
  Zap,
  Lock,
  Download,
  BarChart3,
  Repeat2,
  Globe,
  LifeBuoy,
  type LucideIcon,
} from 'lucide-react'

const featureIcons: Record<string, LucideIcon> = {
  zap: Zap,
  lock: Lock,
  download: Download,
  chart: BarChart3,
  sync: Repeat2,
  globe: Globe,
  support: LifeBuoy,
}

export function getFeatureIcon(key?: string | null): LucideIcon {
  if (!key) return Zap
  return featureIcons[key.toLowerCase()] ?? Zap
}
