"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Menu, MenuPayload, MenuTreeNode } from "../types/menu";
import { ApiError, menuApi } from "../lib/api/menuApi";


function buildTree(menus: Menu[]): MenuTreeNode[] {
  const nodeMap = new Map<number, MenuTreeNode>();

  menus.forEach((menu) => {
    nodeMap.set(menu.id, { ...menu, children: [], depth: 0 });
  });

  const roots: MenuTreeNode[] = [];

  nodeMap.forEach((node) => {
    if (node.parentId && nodeMap.has(node.parentId)) {
      const parent = nodeMap.get(node.parentId)!;
      node.depth = parent.depth + 1;
      parent.children.push(node);
    } else {
      roots.push(node);
    }
  });

  const sortRecursive = (nodes: MenuTreeNode[]) => {
    nodes.sort((a, b) => a.sortOrder - b.sortOrder);
    nodes.forEach((n) => sortRecursive(n.children));
  };
  sortRecursive(roots);

  return roots;
}

// Fixes up depth for nested children after a root-level sort/build pass
function flattenTree(nodes: MenuTreeNode[]): MenuTreeNode[] {
  const out: MenuTreeNode[] = [];
  const walk = (list: MenuTreeNode[]) => {
    list.forEach((n) => {
      out.push(n);
      if (n.children.length) walk(n.children);
    });
  };
  walk(nodes);
  return out;
}

export function useMenus() {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMutating, setIsMutating] = useState(false);

  const fetchMenus = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await menuApi.list();
      setMenus(res.data);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Failed to load menus."
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMenus();
  }, [fetchMenus]);

  const tree = useMemo(() => buildTree(menus), [menus]);
  const flatOrdered = useMemo(() => flattenTree(tree), [tree]);

  // Options for a "parent menu" select — GROUP type menus make sense as parents
  const parentOptions = useMemo(
    () =>
      menus
        .filter((m) => m.menuType === "GROUP")
        .map((m) => ({ id: m.id, name: m.name })),
    [menus]
  );

  const createMenu = useCallback(async (payload: MenuPayload) => {
    setIsMutating(true);
    setError(null);
    try {
      const res = await menuApi.create(payload);
      setMenus((prev) => [...prev, res.data]);
      return { ok: true as const };
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Failed to create menu.";
      setError(message);
      return { ok: false as const, message };
    } finally {
      setIsMutating(false);
    }
  }, []);

  const updateMenu = useCallback(async (id: number, payload: MenuPayload) => {
    setIsMutating(true);
    setError(null);
    try {
      const res = await menuApi.update(id, payload);
      setMenus((prev) => prev.map((m) => (m.id === id ? res.data : m)));
      return { ok: true as const };
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Failed to update menu.";
      setError(message);
      return { ok: false as const, message };
    } finally {
      setIsMutating(false);
    }
  }, []);

  const deleteMenu = useCallback(async (id: number) => {
    setIsMutating(true);
    setError(null);
    try {
      await menuApi.remove(id);
      setMenus((prev) => prev.filter((m) => m.id !== id));
      return { ok: true as const };
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Failed to delete menu.";
      setError(message);
      return { ok: false as const, message };
    } finally {
      setIsMutating(false);
    }
  }, []);

  return {
    menus,
    tree,
    flatOrdered,
    parentOptions,
    isLoading,
    isMutating,
    error,
    refetch: fetchMenus,
    createMenu,
    updateMenu,
    deleteMenu,
  };
}
