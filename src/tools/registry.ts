import { lazy } from 'react'
import { Braces } from 'lucide-react'
import type { Tool } from '@/types'

export const TOOLS: Tool[] = [
  {
    id: 'text-diff',
    label: 'Text Diff',
    icon: '⇄',
    tags: ['diff', 'compare', 'text', 'delta'],
    category: 'text',
    component: lazy(() => import('./text-diff')),
  },
  {
    id: 'password',
    label: 'Password Generator',
    icon: '🔑',
    tags: ['password', 'security', 'random', 'generator', 'crypto'],
    category: 'security',
    component: lazy(() => import('./password')),
  },
  {
    id: 'json-formatter',
    label: 'JSON Formatter',
    icon: Braces,
    tags: ['json', 'format', 'validate', 'pretty', 'parse'],
    category: 'code',
    component: lazy(() => import('./json-formatter')),
  },
  {
    id: 'ip-calculator',
    label: 'IP Calculator',
    icon: '⧉',
    tags: ['ip', 'subnet', 'network', 'cidr', 'netmask', 'calculator'],
    category: 'network',
    component: lazy(() => import('./ip-calculator')),
  },
  {
    id: 'route-aggregation',
    label: 'Route Aggregation',
    icon: '⇲',
    tags: ['ip', 'cidr', 'subnet', 'aggregate', 'summarize', 'network', 'route'],
    category: 'network',
    component: lazy(() => import('./route-aggregation')),
  },
  {
    id: 'timestamp',
    label: 'Timestamp Converter',
    icon: '⏱',
    tags: ['unix', 'timestamp', 'epoch', 'time', 'date', 'converter', 'iso', 'utc'],
    category: 'time',
    component: lazy(() => import('./timestamp')),
  },
  {
    id: 'base64',
    label: 'Base64 Encode/Decode',
    icon: '⇌',
    tags: ['base64', 'encode', 'decode', 'binary', 'text'],
    category: 'encoding',
    component: lazy(() => import('./base64')),
  },
  {
    id: 'color-picker',
    label: 'Color Picker',
    icon: '🎨',
    tags: ['color', 'hex', 'rgb', 'hsl', 'design', 'picker'],
    category: 'design',
    component: lazy(() => import('./color-picker')),
    placeholder: true,
  },
  {
    id: 'image-converter',
    label: 'Image Converter',
    icon: '🖼',
    tags: ['image', 'convert', 'png', 'jpg', 'webp', 'resize'],
    category: 'media',
    component: lazy(() => import('./image-converter')),
    placeholder: true,
    // intentionally isolated: future versions will load a heavy WASM/canvas library here
  },
]
