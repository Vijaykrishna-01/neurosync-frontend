import { z } from "zod";

export const menuSchema = z
  .object({
    name: z.string().min(1, "Name is required").max(100, "Name is too long"),
    slug: z
      .string()
      .min(1, "Slug is required")
      .regex(
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        "Slug must be lowercase, alphanumeric, hyphen-separated"
      ),
    path: z.string().max(255).optional().nullable(),
    icon: z.string().max(100).optional().nullable(),
    menuType: z.enum(["GROUP", "LINK"]),
    target: z.enum(["SELF", "BLANK"]),
    sortOrder: z.coerce.number().int().min(0, "Sort order must be 0 or more"),
    isActive: z.boolean(),
    isVisible: z.boolean(),
    permissionCode: z.string().max(100).optional().nullable(),
    parentId: z.coerce.number().int().positive().optional().nullable(),
    roleMenuPermissions: z
      .array(z.object({ roleId: z.coerce.number().int().positive() }))
      .optional()
      .default([]),
  })
  .superRefine((data, ctx) => {
    // LINK menus should have a path; GROUP menus are containers and don't need one
    if (data.menuType === "LINK" && (!data.path || data.path.trim() === "")) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Path is required for LINK type menus",
        path: ["path"],
      });
    }
  });

export type MenuFormValues = z.infer<typeof menuSchema>;
