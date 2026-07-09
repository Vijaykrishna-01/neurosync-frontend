export type MenuType = "GROUP" | "LINK";
export type MenuTarget = "SELF" | "BLANK";

export interface RoleMenu {
  roleId: number;
}

export interface Menu {
  id: number;
  name: string;
  slug: string;
  path: string | null;
  icon: string | null;
  menuType: MenuType;
  target: MenuTarget;
  sortOrder: number;
  isActive: boolean;
  isVisible: boolean;
  permissionCode: string | null;
  parentId: number | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  roleMenus?: RoleMenu[];
  roleMenuPermissions?: Array<{ roleId: number }>;
}

// Menu augmented with tree metadata for rendering
export interface MenuTreeNode extends Menu {
  children: MenuTreeNode[];
  depth: number;
}

export interface MenusApiResponse {
  success: boolean;
  data: Menu[];
  message?: string;
}

export interface MenuPayload {
  name: string;
  slug: string;
  path: string | null;
  icon: string | null;
  menuType: MenuType;
  target: MenuTarget;
  sortOrder: number;
  isActive: boolean;
  isVisible: boolean;
  permissionCode: string | null;
  parentId: number | null;
  roleMenuPermissions?: Array<{ roleId: number }>;
}
