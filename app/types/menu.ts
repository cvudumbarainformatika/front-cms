/**
 * Menu System Type Definitions
 * Platform Organisasi Profesi Kedokteran (Respiratori)
 */

/**
 * Position dimana menu akan ditampilkan
 */
export type MenuPosition = "header" | "sidebar" | "footer";

/**
 * Role yang bisa mengakses menu
 */
export type UserRole =
  | "public"
  | "member"
  | "admin_cabang"
  | "admin_wilayah"
  | "admin_pusat";

/**
 * Single menu item
 */
export interface MenuItem {
  id: string;
  label: string;
  slug: string;
  to?: string;
  href?: string;
  icon?: string;
  parentId?: string | null;
  position: MenuPosition;
  order: number;
  isActive: boolean;
  isFixed?: boolean;
  isDynamic?: boolean;
  roles: UserRole[];
  target?: "_blank" | "_self";
  children?: MenuItem[];
}

/**
 * Menu collection by position
 */
export interface MenuCollection {
  header: MenuItem[];
  sidebar: MenuItem[];
  footer: MenuItem[];
}

/**
 * API Response untuk menu
 */
export interface MenuApiResponse {
  success: boolean;
  data: MenuItem[];
  message?: string;
}
