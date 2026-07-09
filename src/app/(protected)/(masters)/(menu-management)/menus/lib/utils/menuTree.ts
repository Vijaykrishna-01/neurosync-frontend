

// Returns true if `candidateId` is `menuId` itself or one of its descendants —

import { Menu } from "../../types/menu";

// used to stop a menu from being assigned as its own (grand)parent.
export function isDescendantOrSelf(
  menus: Menu[],
  menuId: number,
  candidateId: number
): boolean {
  if (menuId === candidateId) return true;

  const children = menus.filter((m) => m.parentId === menuId);
  return children.some((child) =>
    isDescendantOrSelf(menus, child.id, candidateId)
  );
}

export function getDirectChildrenCount(menus: Menu[], menuId: number): number {
  return menus.filter((m) => m.parentId === menuId).length;
}

export function getMenuLabel(menu: Pick<Menu, "name" | "slug">): string {
  return `${menu.name} (${menu.slug})`;
}
