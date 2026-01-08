/**
 * useMenu Composable
 * Fetch dan cache menu dari API dengan SSR support
 */

import type { MenuItem, MenuPosition, MenuApiResponse } from '~/types/menu'

/**
 * Composable untuk mengambil menu berdasarkan position
 * @param position - Position menu: 'header' | 'sidebar' | 'footer'
 */
export const useMenu = (position: MenuPosition) => {
  return useAsyncData<MenuItem[]>(
    `menu-${position}`,
    async () => {
      // Jika sidebar (Admin), gunakan data statis internal
      if (position === 'sidebar') {
        const response = await $fetch<MenuApiResponse>(`/api/menus/${position}`)
        return response.data
      }

      // Jika header (Public), gunakan data dari Backend
      console.log(`[useMenu] Fetching ${position} from Backend...`)
      const { $apiFetch } = useNuxtApp()
      const response = await $apiFetch<MenuApiResponse>('/menus', {
        query: { position }
      })
      
      // Return raw data, let component handle filtering
      return response.data
    },
    {
      // Cache di client selama 5 menit
      getCachedData: (key, nuxtApp) => {
        return nuxtApp.payload.data[key] || nuxtApp.static.data[key]
      },
      server: true // Enable SSR
    }
  )
}

/**
 * Composable untuk mengambil semua menu sekaligus
 */
export const useAllMenus = () => {
  return useAsyncData<MenuItem[]>(
    'menu-all',
    async () => {
      const response = await $fetch<MenuApiResponse>('/api/menus')
      return response.data
    }
  )
}

/**
 * Helper untuk filter menu berdasarkan role user
 * @param menus - Array menu items
 * @param userRole - Role user saat ini
 */
export const filterMenusByRole = (menus: MenuItem[], userRole: string = 'public'): MenuItem[] => {
  if (!menus) return []

  const normalizedUserRole = userRole.toLowerCase()

  return menus
    .filter(menu => {
      // Parse roles if it's a JSON string
      let roles: string[] = []
      try {
        roles = typeof menu.roles === 'string' 
          ? JSON.parse(menu.roles) 
          : (menu.roles || [])
      } catch (e) {
        console.error('Error parsing roles for menu:', menu.label, e)
        roles = []
      }
      
      // Normalize roles for comparison
      const normalizedRoles = roles.map(r => r.toLowerCase())
      
      return menu.is_active && normalizedRoles.includes(normalizedUserRole)
    })
    .map(menu => ({
      ...menu,
      children: (menu.children && menu.children.length > 0)
        ? filterMenusByRole(menu.children, userRole)
        : undefined
    }))
    .filter(menu => {
      // Keep menu if it has children OR it has a destination (leaf node)
      const hasChildren = menu.children && menu.children.length > 0
      const hasDestination = !!menu.to
      return hasChildren || hasDestination
    })
}

/**
 * Transform menu items ke format Nuxt UI NavigationMenu
 */
export const transformToNavigationItems = (menus: MenuItem[]) => {
  return menus.map(menu => ({
    label: menu.label,
    to: menu.to,
    icon: menu.icon,
    children: menu.children?.map(child => ({
      label: child.label,
      to: child.to,
      icon: child.icon
    }))
  }))
}
