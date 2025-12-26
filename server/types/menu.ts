/**
 * Menu System Type Definitions for Server
 * Duplikat dari app/types/menu.ts untuk server context
 */

export type MenuPosition = 'header' | 'sidebar' | 'footer'
export type UserRole = 'public' | 'member' | 'admin_cabang' | 'admin_wilayah' | 'admin_pusat'

export interface MenuItem {
  id: string
  label: string
  slug: string
  to?: string
  href?: string
  icon?: string
  parentId?: string | null
  position: MenuPosition
  order: number
  isActive: boolean
  isFixed?: boolean
  isDynamic?: boolean
  roles: UserRole[]
  target?: '_blank' | '_self'
  children?: MenuItem[]
}
