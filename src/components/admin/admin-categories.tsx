"use client";

import { useEffect, useState } from "react";

import { Loader2, Palette, Pencil, Plus, Tag, Trash2 } from "lucide-react";
import { toast } from "sonner";

import {
  createCategory,
  deleteCategory,
  getAdminCategories,
  updateCategory,
} from "@/actions/admin-action";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { type CategoryFormValues, categorySchema } from "@/lib/schemas";
import { cn } from "@/lib/utils";
import type { Category } from "@/types/project";

const colorOptions = [
  {
    value: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
    label: "Emerald",
    preview: "bg-emerald-500",
  },
  {
    value: "bg-blue-500/15 text-blue-700 dark:text-blue-400",
    label: "Blue",
    preview: "bg-blue-500",
  },
  {
    value: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
    label: "Amber",
    preview: "bg-amber-500",
  },
  {
    value: "bg-rose-500/15 text-rose-700 dark:text-rose-400",
    label: "Rose",
    preview: "bg-rose-500",
  },
  {
    value: "bg-cyan-500/15 text-cyan-700 dark:text-cyan-400",
    label: "Cyan",
    preview: "bg-cyan-500",
  },
  {
    value: "bg-fuchsia-500/15 text-fuchsia-700 dark:text-fuchsia-400",
    label: "Fuchsia",
    preview: "bg-fuchsia-500",
  },
  {
    value: "bg-teal-500/15 text-teal-700 dark:text-teal-400",
    label: "Teal",
    preview: "bg-teal-500",
  },
  {
    value: "bg-orange-500/15 text-orange-700 dark:text-orange-400",
    label: "Orange",
    preview: "bg-orange-500",
  },
  {
    value: "bg-indigo-500/15 text-indigo-700 dark:text-indigo-400",
    label: "Indigo",
    preview: "bg-indigo-500",
  },
  {
    value: "bg-lime-500/15 text-lime-700 dark:text-lime-400",
    label: "Lime",
    preview: "bg-lime-500",
  },
];

export function AdminCategories() {
  const [cats, setCats] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(
    null
  );

  // Form state
  const [name, setName] = useState("");
  const [color, setColor] = useState("");
  const [errors, setErrors] = useState<
    Partial<Record<keyof CategoryFormValues, string>>
  >({});

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const result = await getAdminCategories();
      if (result.success && result.data) {
        setCats(result.data as Category[]);
      } else {
        toast.error(result.error || "Failed to fetch categories");
      }
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const openCreateDialog = () => {
    setEditingCategory(null);
    setName("");
    setColor("");
    setErrors({});
    setDialogOpen(true);
  };

  const openEditDialog = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name);
    setColor(cat.color);
    setErrors({});
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    const check = categorySchema.safeParse({ name, color });

    if (!check.success) {
      const fieldErrors: Partial<Record<keyof CategoryFormValues, string>> = {};
      for (const issue of check.error.issues) {
        const field = issue.path[0] as keyof CategoryFormValues;
        if (!fieldErrors[field]) {
          fieldErrors[field] = issue.message;
        }
      }
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      let result;
      if (editingCategory) {
        result = await updateCategory(editingCategory.id, check.data);
      } else {
        result = await createCategory(check.data);
      }

      if (result.success) {
        toast.success(result.message);
        setDialogOpen(false);
        fetchCategories();
      } else {
        toast.error(result.error || "Failed to save category");
      }
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingCategory) return;
    setIsSubmitting(true);
    try {
      const result = await deleteCategory(deletingCategory.id);
      if (result.success) {
        toast.success(result.message);
        setDeleteDialogOpen(false);
        fetchCategories();
      } else {
        toast.error(result.error || "Failed to delete category");
      }
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-sm">
          <span className="text-foreground font-medium">{cats.length}</span>{" "}
          {cats.length === 1 ? "category" : "categories"} total
        </p>
        <Button size="sm" className="gap-2" onClick={openCreateDialog}>
          <Plus className="h-4 w-4" />
          Add Category
        </Button>
      </div>

      <Card>
        {isLoading ? (
          <div className="flex h-64 flex-col items-center justify-center gap-4">
            <Loader2 className="text-primary h-8 w-8 animate-spin" />
            <p className="text-muted-foreground text-sm">
              Loading categories...
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category</TableHead>
                <TableHead className="hidden sm:table-cell">Slug</TableHead>
                <TableHead className="hidden md:table-cell">Projects</TableHead>
                <TableHead className="hidden md:table-cell">Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cats.map((cat) => (
                <TableRow key={cat.id}>
                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      <Badge
                        variant="secondary"
                        className={cn("text-xs font-medium", cat.color)}
                      >
                        {cat.name}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground hidden text-sm sm:table-cell">
                    <code className="bg-muted rounded px-1.5 py-0.5 text-xs">
                      {cat.slug}
                    </code>
                  </TableCell>
                  <TableCell className="text-muted-foreground hidden text-sm md:table-cell">
                    {cat.projectCount} projects
                  </TableCell>
                  <TableCell className="text-muted-foreground hidden text-sm md:table-cell">
                    {new Date(cat.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => openEditDialog(cat)}
                        aria-label={`Edit ${cat.name}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:bg-destructive/10 hover:text-destructive h-8 w-8"
                        onClick={() => {
                          setDeletingCategory(cat);
                          setDeleteDialogOpen(true);
                        }}
                        aria-label={`Delete ${cat.name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Tag className="text-primary h-5 w-5" />
              {editingCategory ? "Edit Category" : "Create Category"}
            </DialogTitle>
            <DialogDescription>
              {editingCategory
                ? "Update the category name and color."
                : "Add a new category for project classification."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cat-name">Name</Label>
              <Input
                id="cat-name"
                placeholder="e.g. Machine Learning"
                value={name}
                disabled={isSubmitting}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name)
                    setErrors((prev) => ({ ...prev, name: undefined }));
                }}
                className={errors.name ? "border-destructive" : ""}
              />
              {errors.name && (
                <p className="text-destructive text-xs">{errors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Palette className="text-muted-foreground h-4 w-4" />
                Color
              </Label>
              <div className="grid grid-cols-5 gap-2">
                {colorOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => {
                      setColor(opt.value);
                      if (errors.color)
                        setErrors((prev) => ({ ...prev, color: undefined }));
                    }}
                    className={cn(
                      "flex flex-col items-center gap-1.5 rounded-lg border p-2 transition-all",
                      color === opt.value
                        ? "border-primary bg-primary/5 ring-primary ring-1"
                        : "border-border hover:border-muted-foreground/30",
                      isSubmitting && "cursor-not-allowed opacity-50"
                    )}
                  >
                    <div className={cn("h-6 w-6 rounded-full", opt.preview)} />
                    <span className="text-muted-foreground text-[10px] font-medium">
                      {opt.label}
                    </span>
                  </button>
                ))}
              </div>
              {errors.color && (
                <p className="text-destructive text-xs">{errors.color}</p>
              )}
              {color && (
                <div className="mt-2">
                  <span className="text-muted-foreground mr-2 text-xs">
                    Preview:
                  </span>
                  <Badge
                    variant="secondary"
                    className={cn("text-xs font-medium", color)}
                  >
                    {name || "Category Name"}
                  </Badge>
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              disabled={isSubmitting}
              onClick={() => setDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button disabled={isSubmitting} onClick={handleSubmit}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : editingCategory ? (
                "Save Changes"
              ) : (
                "Create Category"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Category</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the{" "}
              <Badge
                variant="secondary"
                className={cn("text-xs", deletingCategory?.color)}
              >
                {deletingCategory?.name}
              </Badge>{" "}
              category? Projects using this category will not be deleted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              disabled={isSubmitting}
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={isSubmitting}
              onClick={handleDelete}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Category"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
