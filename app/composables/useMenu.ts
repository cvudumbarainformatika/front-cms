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
      const response = await $fetch<MenuApiResponse>(`/api/menus/${position}`)
      return response.data
    },
    {
      // Cache di client selama 5 menit
      getCachedData: (key, nuxtApp) => {
        return nuxtApp.payload.data[key] || nuxtApp.static.data[key]
      }
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
  return menus
    .filter(menu => menu.isActive && menu.roles.includes(userRole as any))
    .map(menu => ({
      ...menu,
      children: menu.children
        ? filterMenusByRole(menu.children, userRole)
        : undefined
    }))
    .filter(menu => !menu.children || menu.children.length > 0 || menu.to)
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
