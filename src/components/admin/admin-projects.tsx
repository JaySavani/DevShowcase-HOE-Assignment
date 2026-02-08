"use client";

import { useCallback, useEffect, useState } from "react";

import Link from "next/link";

import {
  ExternalLink,
  FolderOpen,
  Github,
  Loader2,
  Pencil,
  Search,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import {
  adminDeleteProject,
  adminUpdateProject,
  getAllProjects,
} from "@/actions/admin-action";
import { getAdminCategories } from "@/actions/admin-action";
import { ProjectForm } from "@/components/project-form";
import { StatusBadge } from "@/components/status-badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ProjectFormValues } from "@/lib/schemas";
import { cn } from "@/lib/utils";
import type { Category, Project } from "@/types/project";

const ITEMS_PER_PAGE = 8;

export function AdminProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [pagination, setPagination] = useState({
    totalCount: 0,
    totalPages: 0,
    currentPage: 1,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deletingProject, setDeletingProject] = useState<Project | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [projectsRes, categoriesRes] = await Promise.all([
        getAllProjects({
          search: debouncedSearch,
          status: statusFilter,
          categoryId: categoryFilter,
          page: currentPage,
          pageSize: ITEMS_PER_PAGE,
        }),
        getAdminCategories(),
      ]);

      if (projectsRes.success && projectsRes.data) {
        setProjects(projectsRes.data as Project[]);
        if (projectsRes.pagination) {
          setPagination(projectsRes.pagination);
        }
      }
      if (categoriesRes.success && categoriesRes.data) {
        setCategories(categoriesRes.data as Category[]);
      }
    } catch {
      toast.error("Failed to fetch admin data");
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, statusFilter, categoryFilter, currentPage]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const paginatedProjects = projects;
  const totalPages = pagination.totalPages;

  const handleEditSubmit = async (data: ProjectFormValues) => {
    if (!editingProject) return;
    setIsSubmitting(true);
    try {
      const result = await adminUpdateProject(editingProject.id, data);
      if (result.success) {
        toast.success(result.message);
        setEditDialogOpen(false);
        setEditingProject(null);
        fetchData();
      } else {
        toast.error(result.error || "Failed to update project");
      }
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingProject) return;
    setIsSubmitting(true);
    try {
      const result = await adminDeleteProject(deletingProject.id);
      if (result.success) {
        toast.success(result.message);
        setDeleteDialogOpen(false);
        setDeletingProject(null);
        fetchData();
      } else {
        toast.error(result.error || "Failed to delete project");
      }
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            placeholder="Search by title or author..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
            }}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={statusFilter}
            onValueChange={(v) => {
              setStatusFilter(v);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={categoryFilter}
            onValueChange={(v) => {
              setCategoryFilter(v);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Results count */}
      {!isLoading && (
        <p className="text-muted-foreground text-sm">
          <span className="text-foreground font-medium">
            {pagination.totalCount}
          </span>{" "}
          project{pagination.totalCount !== 1 ? "s" : ""} found
        </p>
      )}

      {/* Table / Loading State */}
      {isLoading ? (
        <div className="flex h-64 flex-col items-center justify-center gap-4">
          <Loader2 className="text-primary h-8 w-8 animate-spin" />
          <p className="text-muted-foreground text-sm">Loading projects...</p>
        </div>
      ) : paginatedProjects.length > 0 ? (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project</TableHead>
                <TableHead className="hidden md:table-cell">Author</TableHead>
                <TableHead className="hidden sm:table-cell">
                  Categories
                </TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden lg:table-cell">Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedProjects.map((project) => {
                const initials = project.authorName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase();

                return (
                  <TableRow key={project.id}>
                    <TableCell>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-foreground font-medium">
                          {project.title}
                        </span>
                        <span className="text-muted-foreground line-clamp-1 max-w-xs text-xs">
                          {project.description}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-semibold">
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-muted-foreground text-sm">
                          {project.authorName}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {project.categories.slice(0, 2).map((cat) => (
                          <Badge
                            key={cat.id}
                            variant="secondary"
                            className={cn("text-xs", cat.color)}
                          >
                            {cat.name}
                          </Badge>
                        ))}
                        {project.categories.length > 2 && (
                          <Badge variant="secondary" className="text-xs">
                            +{project.categories.length - 2}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={project.status} />
                    </TableCell>
                    <TableCell className="text-muted-foreground hidden text-sm lg:table-cell">
                      {new Date(project.createdAt).toLocaleDateString("en-US", {
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
                          asChild
                        >
                          <Link
                            href={project.githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="GitHub"
                          >
                            <Github className="h-4 w-4" />
                          </Link>
                        </Button>
                        {project.websiteUrl && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            asChild
                          >
                            <Link
                              href={project.websiteUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              aria-label="Website"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Link>
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => {
                            setEditingProject(project);
                            setEditDialogOpen(true);
                          }}
                          aria-label={`Edit ${project.title}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:bg-destructive/10 hover:text-destructive h-8 w-8"
                          onClick={() => {
                            setDeletingProject(project);
                            setDeleteDialogOpen(true);
                          }}
                          aria-label={`Delete ${project.title}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      ) : (
        <Card>
          <div className="flex flex-col items-center justify-center py-16">
            <div className="bg-muted flex h-12 w-12 items-center justify-center rounded-full">
              <FolderOpen className="text-muted-foreground h-5 w-5" />
            </div>
            <h3 className="text-foreground mt-4 text-sm font-semibold">
              No projects found
            </h3>
            <p className="text-muted-foreground mt-1 text-sm">
              Try adjusting your search or filter criteria.
            </p>
          </div>
        </Card>
      )}

      {/* Pagination */}
      {totalPages > 1 && !isLoading && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className={cn(
                  "cursor-pointer",
                  currentPage === 1 && "pointer-events-none opacity-50"
                )}
              />
            </PaginationItem>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <PaginationItem key={page}>
                <PaginationLink
                  onClick={() => setCurrentPage(page)}
                  isActive={currentPage === page}
                  className="cursor-pointer"
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                className={cn(
                  "cursor-pointer",
                  currentPage === totalPages && "pointer-events-none opacity-50"
                )}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
            <DialogDescription>
              Update the project details as an administrator.
            </DialogDescription>
          </DialogHeader>
          {editingProject && (
            <ProjectForm
              defaultValues={{
                title: editingProject.title,
                description: editingProject.description,
                githubUrl: editingProject.githubUrl,
                websiteUrl: editingProject.websiteUrl,
                categoryIds: editingProject.categories.map((c) => c.id),
              }}
              onSubmit={handleEditSubmit}
              submitLabel="Save Changes"
              isLoading={isSubmitting}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Project</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{" "}
              <span className="text-foreground font-semibold">
                {deletingProject?.title}
              </span>
              ? This action cannot be undone.
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
                "Delete Project"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
