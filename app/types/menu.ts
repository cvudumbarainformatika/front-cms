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
  id: number | string;
  label: string;
  slug: string;
  to?: string;
  href?: string;
  icon?: string;
  parent_id?: number | null;
  position: MenuPosition;
  order: number;
  is_active: boolean;
  is_fixed?: boolean;
  roles: UserRole[] | string; // Can be array or JSON string from backend
  description?: string;
  target?: "_blank" | "_self";
  children?: MenuItem[];
  created_at?: string;
  updated_at?: string;
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
