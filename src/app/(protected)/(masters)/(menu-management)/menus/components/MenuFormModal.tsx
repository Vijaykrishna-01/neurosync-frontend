"use client";

import { useEffect, useState } from "react";
import {
  Controller,
  useForm,
  type SubmitHandler,
  type Resolver,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";
import { Menu, MenuPayload } from "../types/menu";
import { MenuFormValues, menuSchema } from "../lib/validations/menuSchema";
import { isDescendantOrSelf } from "../lib/utils/menuTree";
import { menuApi } from "../lib/api/menuApi";

interface MenuFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: MenuPayload) => Promise<{ ok: boolean; message?: string }>;
  editingMenu: Menu | null;
  allMenus: Menu[];
  isSubmitting: boolean;
}

const defaultValues: MenuFormValues = {
  name: "",
  slug: "",
  path: "",
  icon: "",
  menuType: "LINK",
  target: "SELF",
  sortOrder: 0,
  isActive: true,
  isVisible: true,
  permissionCode: "",
  parentId: null,
  roleMenuPermissions: [],
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function MenuFormModal({
  isOpen,
  onClose,
  onSubmit,
  editingMenu,
  allMenus,
  isSubmitting,
}: MenuFormModalProps) {
  const [availableRoles, setAvailableRoles] = useState<Array<{ id: number; name: string }>>([]);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<MenuFormValues>({
    resolver: zodResolver(menuSchema) as Resolver<MenuFormValues>,
    defaultValues,
  });

  const menuType = watch("menuType");
  const nameValue = watch("name");

  useEffect(() => {
    let active = true;

    const loadRoles = async () => {
      try {
        const res = await menuApi.listRoles();
        if (active) {
          setAvailableRoles(res.data ?? []);
        }
      } catch {
        if (active) {
          setAvailableRoles([]);
        }
      }
    };

    loadRoles();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    if (editingMenu) {
      reset({
        name: editingMenu.name,
        slug: editingMenu.slug,
        path: editingMenu.path ?? "",
        icon: editingMenu.icon ?? "",
        menuType: editingMenu.menuType,
        target: editingMenu.target,
        sortOrder: editingMenu.sortOrder,
        isActive: editingMenu.isActive,
        isVisible: editingMenu.isVisible,
        permissionCode: editingMenu.permissionCode ?? "",
        parentId: editingMenu.parentId,
        roleMenuPermissions:
          editingMenu.roleMenuPermissions?.map(({ roleId }) => ({ roleId })) ?? [],
      });
    } else {
      reset(defaultValues);
    }
  }, [isOpen, editingMenu, reset]);

  // Auto-suggest a slug from the name while creating a new menu
  useEffect(() => {
    if (editingMenu) return;
    setValue("slug", slugify(nameValue || ""));
  }, [nameValue, editingMenu, setValue]);

  if (!isOpen) return null;

  const parentCandidates = allMenus.filter((m) => {
    if (m.menuType !== "GROUP") return false;
    if (editingMenu && isDescendantOrSelf(allMenus, editingMenu.id, m.id)) {
      return false; // prevent a menu becoming its own ancestor
    }
    return true;
  });

  const submitHandler: SubmitHandler<MenuFormValues> = async (values) => {
    const payload: MenuPayload = {
      name: values.name.trim(),
      slug: values.slug.trim(),
      path: values.menuType === "GROUP" ? null : values.path?.trim() || null,
      icon: values.icon?.trim() || null,
      menuType: values.menuType,
      target: values.target,
      sortOrder: values.sortOrder,
      isActive: values.isActive,
      isVisible: values.isVisible,
      permissionCode: values.permissionCode?.trim() || null,
      parentId: values.parentId ?? null,
      roleMenuPermissions: values.roleMenuPermissions ?? [],
    };

    const result = await onSubmit(payload);
    if (result.ok) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div className="w-full max-w-2xl rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-900">
            {editingMenu ? "Edit menu" : "Add menu"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(submitHandler)}>
          <div className="grid max-h-[70vh] grid-cols-1 gap-4 overflow-y-auto px-6 py-5 sm:grid-cols-2">
            {/* Name */}
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Name <span className="text-rose-500">*</span>
              </label>
              <input
                {...register("name")}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                placeholder="e.g. Student Directory"
              />
              {errors.name && (
                <p className="mt-1 text-xs text-rose-600">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Slug */}
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Slug <span className="text-rose-500">*</span>
              </label>
              <input
                {...register("slug")}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                placeholder="e.g. student-directory"
              />
              {errors.slug && (
                <p className="mt-1 text-xs text-rose-600">
                  {errors.slug.message}
                </p>
              )}
            </div>

            {/* Menu type */}
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Menu type
              </label>
              <select
                {...register("menuType")}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              >
                <option value="GROUP">Group (container)</option>
                <option value="LINK">Link (page)</option>
              </select>
            </div>

            {/* Path — only meaningful for LINK menus */}
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Path {menuType === "LINK" && <span className="text-rose-500">*</span>}
              </label>
              <input
                {...register("path")}
                disabled={menuType === "GROUP"}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 disabled:bg-slate-50 disabled:text-slate-400"
                placeholder="e.g. /students"
              />
              {errors.path && (
                <p className="mt-1 text-xs text-rose-600">
                  {errors.path.message}
                </p>
              )}
            </div>

            {/* Parent menu */}
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Parent menu
              </label>
              <Controller
                control={control}
                name="parentId"
                render={({ field }) => (
                  <select
                    value={field.value ?? ""}
                    onChange={(e) =>
                      field.onChange(e.target.value ? Number(e.target.value) : null)
                    }
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                  >
                    <option value="">No parent (top level)</option>
                    {parentCandidates.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                )}
              />
            </div>

            {/* Sort order */}
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Sort order
              </label>
              <input
                type="number"
                {...register("sortOrder")}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              />
              {errors.sortOrder && (
                <p className="mt-1 text-xs text-rose-600">
                  {errors.sortOrder.message}
                </p>
              )}
            </div>

            {/* Icon */}
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Icon
              </label>
              <input
                {...register("icon")}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                placeholder="e.g. lucide:users"
              />
            </div>

            {/* Permission code */}
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Permission code
              </label>
              <input
                {...register("permissionCode")}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                placeholder="e.g. student.view"
              />
            </div>

            {/* Target */}
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Open in
              </label>
              <select
                {...register("target")}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              >
                <option value="SELF">Same tab</option>
                <option value="BLANK">New tab</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Assign to roles
              </label>
              <Controller
                control={control}
                name="roleMenuPermissions"
                render={({ field }) => (
                  <div className="max-h-40 overflow-y-auto rounded-lg border border-slate-200 p-3">
                    {availableRoles.length === 0 ? (
                      <p className="text-sm text-slate-500">No roles available.</p>
                    ) : (
                      availableRoles.map((role) => {
                        const checked = (field.value ?? []).some(
                          (item) => item.roleId === role.id,
                        );

                        return (
                          <label
                            key={role.id}
                            className="mb-2 flex items-center gap-2 text-sm text-slate-700"
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => {
                                const currentValue = field.value ?? [];
                                const exists = currentValue.some(
                                  (item) => item.roleId === role.id,
                                );

                                field.onChange(
                                  exists
                                    ? currentValue.filter((item) => item.roleId !== role.id)
                                    : [...currentValue, { roleId: role.id }],
                                );
                              }}
                              className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            <span>{role.name}</span>
                          </label>
                        );
                      })
                    )}
                  </div>
                )}
              />
            </div>

            {/* Toggles */}
            <div className="flex items-center gap-6 sm:col-span-2">
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <input
                  type="checkbox"
                  {...register("isActive")}
                  className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                Active
              </label>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <input
                  type="checkbox"
                  {...register("isVisible")}
                  className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                Visible in menu
              </label>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-slate-200 px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting
                ? "Saving..."
                : editingMenu
                ? "Save changes"
                : "Create menu"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
