"use client";

import { useCallback, useEffect, useState } from "react";

import Link from "next/link";

import {
  ExternalLink,
  FolderOpen,
  Github,
  LayoutGrid,
  List,
  Loader2,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import {
  deleteProject,
  getMyProjects,
  updateProject,
} from "@/actions/my-project-action";
import { ProjectCard } from "@/components/project-card";
import { ProjectForm } from "@/components/project-form";
import { StatusBadge } from "@/components/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { Project } from "@/types/project";

const ITEMS_PER_PAGE = 6;

export default function MyProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
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
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
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

  const fetchProjects = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await getMyProjects({
        search: debouncedSearch,
        status: statusFilter,
        page: currentPage,
        pageSize: ITEMS_PER_PAGE,
      });
      if (result.success && result.data) {
        setProjects(result.data as Project[]);
        if (result.pagination) {
          setPagination(result.pagination);
        }
      } else {
        toast.error(result.error || "Failed to fetch projects");
      }
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, statusFilter, currentPage]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const paginatedProjects = projects;
  const totalPages = pagination.totalPages;

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setEditDialogOpen(true);
  };

  const handleEditSubmit = async (data: ProjectFormValues) => {
    if (!editingProject) return;
    setIsSubmitting(true);
    try {
      const result = await updateProject(editingProject.id, data);
      if (result.success) {
        toast.success(result.message);
        setEditDialogOpen(false);
        setEditingProject(null);
        fetchProjects();
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
      const result = await deleteProject(deletingProject.id);
      if (result.success) {
        toast.success(result.message);
        setDeleteDialogOpen(false);
        setDeletingProject(null);
        fetchProjects();
      } else {
        toast.error(result.error || "Failed to delete project");
      }
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const statusCounts = {
    all: pagination.totalCount,
    pending: 0, // Would need a separate action or count for all statuses
    approved: 0,
    rejected: 0,
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-foreground text-2xl font-bold tracking-tight">
            My Projects
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Manage and track all your submitted projects.
          </p>
        </div>
        <Link href="/submit">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Project
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {(
          [
            { key: "all", label: "Total", color: "bg-primary/10 text-primary" },
            {
              key: "pending",
              label: "Pending",
              color: "bg-warning/10 text-warning",
            },
            {
              key: "approved",
              label: "Approved",
              color: "bg-success/10 text-success",
            },
            {
              key: "rejected",
              label: "Rejected",
              color: "bg-destructive/10 text-destructive",
            },
          ] as const
        ).map(({ key, label, color }) => (
          <Card key={key} className="border">
            <CardContent className="flex items-center gap-3 p-4">
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-lg",
                  color
                )}
              >
                <span className="text-lg font-bold">{statusCounts[key]}</span>
              </div>
              <span className="text-muted-foreground text-sm font-medium">
                {label}
              </span>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            placeholder="Search your projects..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
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
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
          <div className="bg-card flex items-center rounded-lg border p-0.5">
            <Button
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              size="icon"
              className="h-8 w-8"
              onClick={() => setViewMode("grid")}
              aria-label="Grid view"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="icon"
              className="h-8 w-8"
              onClick={() => setViewMode("list")}
              aria-label="List view"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex h-64 flex-col items-center justify-center gap-4">
          <Loader2 className="text-primary h-8 w-8 animate-spin" />
          <p className="text-muted-foreground text-sm">
            Loading your projects...
          </p>
        </div>
      ) : paginatedProjects.length > 0 ? (
        viewMode === "grid" ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {paginatedProjects.map((project) => (
              <div key={project.id} className="group relative">
                <ProjectCard project={project} showStatus />
                <div className="absolute top-3 right-3 flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <Button
                    variant="secondary"
                    size="icon"
                    className="h-8 w-8 shadow-xs"
                    onClick={() => handleEdit(project)}
                    aria-label={`Edit ${project.title}`}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="hover:bg-destructive hover:text-destructive-foreground h-8 w-8 shadow-xs"
                    onClick={() => {
                      setDeletingProject(project);
                      setDeleteDialogOpen(true);
                    }}
                    aria-label={`Delete ${project.title}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <Card className="px-2">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project</TableHead>
                  <TableHead className="hidden sm:table-cell">
                    Categories
                  </TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden md:table-cell">Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedProjects.map((project) => (
                  <TableRow key={project.id}>
                    <TableCell>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-foreground font-medium">
                          {project.title}
                        </span>
                        <span className="text-muted-foreground line-clamp-1 text-xs">
                          {project.description}
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
                    <TableCell className="text-muted-foreground hidden text-sm md:table-cell">
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
                          onClick={() => handleEdit(project)}
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
                ))}
              </TableBody>
            </Table>
          </Card>
        )
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="bg-muted flex h-12 w-12 items-center justify-center rounded-full">
              <FolderOpen className="text-muted-foreground h-5 w-5" />
            </div>
            <h3 className="text-foreground mt-4 text-sm font-semibold">
              No projects found
            </h3>
            <p className="text-muted-foreground mt-1 text-sm">
              {search || statusFilter !== "all"
                ? "Try adjusting your filters."
                : "Submit your first project to get started."}
            </p>
            {!search && statusFilter === "all" && (
              <Link href="/submit">
                <Button size="sm" className="mt-4 gap-2">
                  <Plus className="h-4 w-4" />
                  Submit Project
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      {totalPages > 1 && !isLoading && (
        <div className="mt-8">
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
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <PaginationItem key={page}>
                    <PaginationLink
                      onClick={() => setCurrentPage(page)}
                      isActive={currentPage === page}
                      className="cursor-pointer"
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                )
              )}
              <PaginationItem>
                <PaginationNext
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  className={cn(
                    "cursor-pointer",
                    currentPage === totalPages &&
                      "pointer-events-none opacity-50"
                  )}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
            <DialogDescription>
              Update the details of your project submission.
            </DialogDescription>
          </DialogHeader>
          {editingProject && (
            <ProjectForm
              defaultValues={{
                title: editingProject.title,
                description: editingProject.description,
                githubUrl: editingProject.githubUrl,
                websiteUrl: editingProject.websiteUrl || undefined,
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
