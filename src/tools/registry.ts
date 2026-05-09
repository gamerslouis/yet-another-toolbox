import { lazy } from 'react'
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
    icon: '{ }',
    tags: ['json', 'format', 'validate', 'pretty', 'parse'],
    category: 'code',
    component: lazy(() => import('./json-formatter')),
  },
  {
    id: 'base64',
    label: 'Base64 Encode/Decode',
    icon: '⇌',
    tags: ['base64', 'encode', 'decode', 'binary', 'text'],
    category: 'encoding',
    component: lazy(() => import('./base64')),
    placeholder: true,
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
