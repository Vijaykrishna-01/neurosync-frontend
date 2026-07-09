"use client";

import { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Pencil,
  Plus,
  Trash2,
  FolderTree,
  Link2,
} from "lucide-react";
import type { MenuTreeNode } from "../types/menu";

interface MenuTableProps {
  tree: MenuTreeNode[];
  roleNamesById: Map<number, string>;
  onEdit: (menu: MenuTreeNode) => void;
  onDelete: (menu: MenuTreeNode) => void;
  onAddChild: (parentId: number) => void;
}

function Badge({
  children,
  tone = "slate",
}: {
  children: React.ReactNode;
  tone?: "slate" | "green" | "rose" | "indigo";
}) {
  const tones: Record<string, string> = {
    slate: "bg-slate-100 text-slate-600",
    green: "bg-emerald-50 text-emerald-700",
    rose: "bg-rose-50 text-rose-700",
    indigo: "bg-indigo-50 text-indigo-700",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

function MenuRow({
  node,
  onEdit,
  onDelete,
  onAddChild,
  roleNamesById,
  collapsed,
  onToggleCollapse,
}: {
  node: MenuTreeNode;
  onEdit: (menu: MenuTreeNode) => void;
  onDelete: (menu: MenuTreeNode) => void;
  onAddChild: (parentId: number) => void;
  roleNamesById: Map<number, string>;
  collapsed: Set<number>;
  onToggleCollapse: (id: number) => void;
}) {
  const hasChildren = node.children.length > 0;
  const isCollapsed = collapsed.has(node.id);
  const roleIds =
    node.roleMenuPermissions?.map((item) => item.roleId) ??
    node.roleMenus?.map((item) => item.roleId) ??
    [];

  return (
    <>
      <tr className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50">
        <td className="px-4 py-3">
          <div
            className="flex items-center gap-1.5"
            style={{ paddingLeft: `${node.depth * 20}px` }}
          >
            {hasChildren ? (
              <button
                type="button"
                onClick={() => onToggleCollapse(node.id)}
                className="rounded p-0.5 text-slate-400 hover:bg-slate-200 hover:text-slate-600"
                aria-label={isCollapsed ? "Expand" : "Collapse"}
              >
                {isCollapsed ? (
                  <ChevronRight className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </button>
            ) : (
              <span className="inline-block w-5" />
            )}
            {node.menuType === "GROUP" ? (
              <FolderTree className="h-4 w-4 shrink-0 text-slate-400" />
            ) : (
              <Link2 className="h-4 w-4 shrink-0 text-slate-400" />
            )}
            <span className="font-medium text-slate-900">{node.name}</span>
          </div>
        </td>
        <td className="px-4 py-3 text-slate-600">{node.slug}</td>
        <td className="px-4 py-3 text-slate-600">{node.path ?? "—"}</td>
        <td className="px-4 py-3">
          <Badge tone={node.menuType === "GROUP" ? "indigo" : "slate"}>
            {node.menuType}
          </Badge>
        </td>
        <td className="px-4 py-3 text-slate-600">
          {node.permissionCode ?? "—"}
        </td>
        <td className="px-4 py-3 text-center text-slate-600">
          {node.sortOrder}
        </td>
        <td className="px-4 py-3">
          <Badge tone={node.isActive ? "green" : "rose"}>
            {node.isActive ? "Active" : "Inactive"}
          </Badge>
        </td>
        <td className="px-4 py-3">
          <Badge tone={node.isVisible ? "green" : "slate"}>
            {node.isVisible ? "Visible" : "Hidden"}
          </Badge>
        </td>
        <td className="px-4 py-3">
          {roleIds.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {roleIds.map((roleId) => (
                <Badge key={`${node.id}-${roleId}`} tone="indigo">
                  {roleNamesById.get(roleId) ?? `Role #${roleId}`}
                </Badge>
              ))}
            </div>
          ) : (
            <span className="text-slate-400">—</span>
          )}
        </td>
        <td className="px-4 py-3">
          <div className="flex items-center justify-end gap-1">
            {node.menuType === "GROUP" && (
              <button
                type="button"
                onClick={() => onAddChild(node.id)}
                className="rounded-md p-1.5 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600"
                title="Add child menu"
              >
                <Plus className="h-4 w-4" />
              </button>
            )}
            <button
              type="button"
              onClick={() => onEdit(node)}
              className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              title="Edit"
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => onDelete(node)}
              className="rounded-md p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
              title="Delete"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </td>
      </tr>
      {hasChildren &&
        !isCollapsed &&
        node.children.map((child) => (
          <MenuRow
            key={child.id}
            node={child}
            onEdit={onEdit}
            onDelete={onDelete}
            onAddChild={onAddChild}
            roleNamesById={roleNamesById}
            collapsed={collapsed}
            onToggleCollapse={onToggleCollapse}
          />
        ))}
    </>
  );
}

export function MenuTable({
  tree,
  roleNamesById,
  onEdit,
  onDelete,
  onAddChild,
}: MenuTableProps) {
  const [collapsed, setCollapsed] = useState<Set<number>>(new Set());

  const toggleCollapse = (id: number) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  if (tree.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white py-16 text-center">
        <FolderTree className="h-8 w-8 text-slate-300" />
        <p className="mt-3 text-sm font-medium text-slate-700">
          No menus yet
        </p>
        <p className="mt-1 text-sm text-slate-500">
          Create your first menu group to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Slug</th>
              <th className="px-4 py-3">Path</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Permission</th>
              <th className="px-4 py-3 text-center">Order</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Visibility</th>
              <th className="px-4 py-3">Role permissions</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {tree.map((node) => (
              <MenuRow
                key={node.id}
                node={node}
                onEdit={onEdit}
                onDelete={onDelete}
                onAddChild={onAddChild}
                roleNamesById={roleNamesById}
                collapsed={collapsed}
                onToggleCollapse={toggleCollapse}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
