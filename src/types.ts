import type { ComponentType, LazyExoticComponent } from 'react'

export interface Tool {
  id: string
  label: string
  icon: string
  tags: string[]
  category: string
  component: LazyExoticComponent<ComponentType>
  placeholder?: boolean
}

export type DiffOp = {
  type: 'equal' | 'add' | 'remove'
  line: string
}
