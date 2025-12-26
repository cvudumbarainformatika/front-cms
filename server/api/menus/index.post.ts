import { headerMenus, sidebarMenus, footerMenus } from '../../data/menus'
import type { MenuItem, MenuPosition } from '../../types/menu'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { position, menus } = body as { position: MenuPosition, menus: MenuItem[] }

  if (!position || !menus) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Position and menus are required'
    })
  }

  // Get original menus for validation
  let originalMenus: MenuItem[] = []
  switch (position) {
    case 'header': originalMenus = headerMenus; break
    case 'sidebar': originalMenus = sidebarMenus; break
    case 'footer': originalMenus = footerMenus; break
  }

  // Simple validation to protect isFixed items
  // In a real app with a DB, this would be more robust.
  const validateFixed = (newItems: MenuItem[], oldItems: MenuItem[]) => {
    for (const oldItem of oldItems) {
      if (oldItem.isFixed) {
        const newItem = findByIdRecursive(newItems, oldItem.id)
        if (!newItem) {
          throw createError({
            statusCode: 403,
            statusMessage: `Menu sistem '${oldItem.label}' tidak boleh dihapus`
          })
        }
        // Protect critical fields
        newItem.isFixed = true
        newItem.to = oldItem.to
        newItem.slug = oldItem.slug
      }
      if (oldItem.children) {
        validateFixed(newItems, oldItem.children)
      }
    }
  }

  function findByIdRecursive(items: MenuItem[], id: string): MenuItem | undefined {
    for (const item of items) {
      if (item.id === id) return item
      if (item.children) {
        const found = findByIdRecursive(item.children, id)
        if (found) return found
      }
    }
    return undefined
  }

  validateFixed(menus, originalMenus)

  // Update data based on position
  switch (position) {
    case 'header':
      headerMenus.length = 0
      headerMenus.push(...menus)
      break
    case 'sidebar':
      sidebarMenus.length = 0
      sidebarMenus.push(...menus)
      break
    case 'footer':
      footerMenus.length = 0
      footerMenus.push(...menus)
      break
  }

  return {
    success: true,
    message: `Menu ${position} berhasil diperbarui`,
    data: menus
  }
})
