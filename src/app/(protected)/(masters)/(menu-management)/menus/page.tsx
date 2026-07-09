"use client";

import React, { useMemo, useState } from "react";
import {
  Plus,
  RefreshCw,
  Search,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { useMenus } from "./hooks/useMenus";
import { Menu, MenuTreeNode } from "./types/menu";
import { MenuTable } from "./components/MenuTable";
import { MenuFormModal } from "./components/MenuFormModal";
import { DeleteConfirmModal } from "./components/DeleteConfirmModal";
import { getDirectChildrenCount } from "./lib/utils/menuTree";

type StatusMessage = { type: "success" | "error"; text: string } | null;

const Page = () => {
  const {
    menus,
    tree,
    isLoading,
    isMutating,
    error,
    refetch,
    createMenu,
    updateMenu,
    deleteMenu,
  } = useMenus();

  const [search, setSearch] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMenu, setEditingMenu] = useState<Menu | null>(null);
  const [prefillParentId, setPrefillParentId] = useState<number | null>(null);
  const [deletingMenu, setDeletingMenu] = useState<Menu | null>(null);
  const [status, setStatus] = useState<StatusMessage>(null);

  const filteredTree = useMemo(() => {
    if (!search.trim()) return tree;
    const q = search.trim().toLowerCase();

    const matches = (node: MenuTreeNode): boolean =>
      node.name.toLowerCase().includes(q) ||
      node.slug.toLowerCase().includes(q) ||
      (node.path ?? "").toLowerCase().includes(q) ||
      (node.permissionCode ?? "").toLowerCase().includes(q);

    const filterNode = (node: MenuTreeNode): MenuTreeNode | null => {
      const filteredChildren = node.children
        .map(filterNode)
        .filter((n): n is MenuTreeNode => n !== null);

      if (matches(node) || filteredChildren.length > 0) {
        return { ...node, children: filteredChildren };
      }
      return null;
    };

    return tree.map(filterNode).filter((n): n is MenuTreeNode => n !== null);
  }, [tree, search]);

  const showStatus = (type: "success" | "error", text: string) => {
    setStatus({ type, text });
    setTimeout(() => setStatus(null), 3500);
  };

  const openCreateForm = (parentId: number | null = null) => {
    setEditingMenu(null);
    setPrefillParentId(parentId);
    setIsFormOpen(true);
  };

  const openEditForm = (menu: Menu) => {
    setEditingMenu(menu);
    setPrefillParentId(null);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingMenu(null);
    setPrefillParentId(null);
  };

  const handleSubmit = async (payload: Parameters<typeof createMenu>[0]) => {
    const finalPayload = editingMenu
      ? payload
      : { ...payload, parentId: payload.parentId ?? prefillParentId };

    const result = editingMenu
      ? await updateMenu(editingMenu.id, finalPayload)
      : await createMenu(finalPayload);

    if (result.ok) {
      showStatus(
        "success",
        editingMenu
          ? "Menu updated successfully."
          : "Menu created successfully.",
      );
    } else {
      showStatus("error", result.message || "Something went wrong.");
    }
    return result;
  };

  const handleDeleteConfirm = async () => {
    if (!deletingMenu) return;
    const result = await deleteMenu(deletingMenu.id);
    if (result.ok) {
      showStatus("success", `"${deletingMenu.name}" was deleted.`);
      setDeletingMenu(null);
    } else {
      showStatus("error", result.message || "Failed to delete menu.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div>
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">
              Menu Management
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Create, edit, and organize the menus rendered across the app.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => refetch()}
              disabled={isLoading}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
            >
              <RefreshCw
                className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
            <button
              type="button"
              onClick={() => openCreateForm(null)}
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3.5 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            >
              <Plus className="h-4 w-4" />
              Add menu
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard label="Total menus" value={menus.length} />
          <StatCard
            label="Groups"
            value={menus.filter((m) => m.menuType === "GROUP").length}
          />
          <StatCard
            label="Links"
            value={menus.filter((m) => m.menuType === "LINK").length}
          />
          <StatCard
            label="Inactive"
            value={menus.filter((m) => !m.isActive).length}
          />
        </div>

        {/* Toolbar */}
        <div className="mb-4">
          <div className="relative max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, slug, path, or permission..."
              className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            />
          </div>
        </div>

        {/* Status banner */}
        {status && (
          <div
            className={`mb-4 flex items-center gap-2 rounded-lg border px-4 py-3 text-sm ${
              status.type === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-rose-200 bg-rose-50 text-rose-700"
            }`}
          >
            {status.type === "success" ? (
              <CheckCircle2 className="h-4 w-4 shrink-0" />
            ) : (
              <AlertCircle className="h-4 w-4 shrink-0" />
            )}
            {status.text}
          </div>
        )}

        {error && !status && (
          <div className="mb-4 flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        {/* Table / loading state */}
        {isLoading ? (
          <div className="flex items-center justify-center rounded-xl border border-slate-200 bg-white py-20">
            <RefreshCw className="h-5 w-5 animate-spin text-slate-400" />
            <span className="ml-2 text-sm text-slate-500">
              Loading menus...
            </span>
          </div>
        ) : (
          <MenuTable
            tree={filteredTree}
            onEdit={openEditForm}
            onDelete={setDeletingMenu}
            onAddChild={(parentId) => openCreateForm(parentId)}
          />
        )}
      </div>

      <MenuFormModal
        isOpen={isFormOpen}
        onClose={closeForm}
        onSubmit={handleSubmit}
        editingMenu={editingMenu}
        allMenus={menus}
        isSubmitting={isMutating}
      />

      <DeleteConfirmModal
        menu={deletingMenu}
        childCount={
          deletingMenu ? getDirectChildrenCount(menus, deletingMenu.id) : 0
        }
        onCancel={() => setDeletingMenu(null)}
        onConfirm={handleDeleteConfirm}
        isDeleting={isMutating}
      />
    </div>
  );
};

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-4 py-3.5">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-2xl font-semibold text-slate-900">{value}</p>
    </div>
  );
}

export default Page;
