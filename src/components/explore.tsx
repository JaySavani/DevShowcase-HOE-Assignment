"use client";

import { useEffect, useState } from "react";

import { Loader2, Search, SlidersHorizontal, Sparkles, X } from "lucide-react";
import { toast } from "sonner";

import { getApprovedProjects, getCategories } from "@/actions/project-action";
import { ProjectCard } from "@/components/project-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
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
import { cn } from "@/lib/utils";
import type { Category, Project } from "@/types/project";

const ITEMS_PER_PAGE = 6;

export default function ExplorePage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [pagination, setPagination] = useState({
    totalCount: 0,
    totalPages: 0,
    currentPage: 1,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    async function fetchCategoriesData() {
      try {
        const res = await getCategories();
        if (res.success && res.data) {
          setCategories(res.data);
        }
      } catch {
        toast.error("Failed to fetch categories");
      }
    }
    fetchCategoriesData();
  }, []);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const res = await getApprovedProjects({
          search: debouncedSearch,
          categoryIds: selectedCategories,
          sortBy,
          page: currentPage,
          pageSize: ITEMS_PER_PAGE,
        });

        if (res.success && res.data) {
          setProjects(res.data);
          if (res.pagination) {
            setPagination(res.pagination);
          }
        } else if (res.error) {
          toast.error(res.error);
        }
      } catch {
        toast.error("An unexpected error occurred while fetching data");
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [debouncedSearch, selectedCategories, sortBy, currentPage]);

  const totalPages = pagination.totalPages;
  const paginatedProjects = projects;

  const toggleCategory = (id: string) => {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearch("");
    setSelectedCategories([]);
    setSortBy("newest");
    setCurrentPage(1);
  };

  const hasActiveFilters =
    search.trim() || selectedCategories.length > 0 || sortBy !== "newest";

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
      {/* Hero section */}
      <section className="mb-10 text-center">
        <div className="mx-auto max-w-2xl">
          <div className="bg-card text-muted-foreground mb-4 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-medium">
            <Sparkles className="text-primary h-3.5 w-3.5" />
            Community-driven project showcase
          </div>
          <h1 className="text-foreground text-3xl font-bold tracking-tight text-balance sm:text-4xl">
            Discover Amazing Projects
          </h1>
          <p className="text-muted-foreground mt-3 text-base leading-relaxed text-pretty">
            Explore open-source projects built by developers around the world.
            Find inspiration, contribute, or submit your own.
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="bg-card mb-8 rounded-xl border p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <Input
              placeholder="Search projects, descriptions, or authors..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-9"
            />
          </div>
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="text-muted-foreground h-4 w-4" />
            <Select
              value={sortBy}
              onValueChange={(v) => {
                setSortBy(v);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="alphabetical">A - Z</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-muted-foreground mr-1 text-xs font-medium">
            Categories:
          </span>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => toggleCategory(cat.id)}
              className={cn(
                "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium transition-all",
                selectedCategories.includes(cat.id)
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
              )}
            >
              {cat.name}
            </button>
          ))}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="bg-destructive/10 text-destructive hover:bg-destructive/20 ml-1 inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium transition-colors"
            >
              <X className="h-3 w-3" />
              Clear filters
            </button>
          )}
        </div>
      </section>

      {/* Results count */}
      {!isLoading && (
        <div className="mb-6 flex items-center justify-between">
          <p className="text-muted-foreground text-sm">
            Showing{" "}
            <span className="text-foreground font-semibold">
              {projects.length}
            </span>{" "}
            of{" "}
            <span className="text-foreground font-semibold">
              {pagination.totalCount}
            </span>{" "}
            projects
          </p>
        </div>
      )}

      {/* Project grid / Loading State */}
      {isLoading ? (
        <div className="flex h-64 flex-col items-center justify-center gap-4">
          <Loader2 className="text-primary h-8 w-8 animate-spin" />
          <p className="text-muted-foreground text-sm">Loading projects...</p>
        </div>
      ) : paginatedProjects.length > 0 ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {paginatedProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      ) : (
        <div className="bg-card flex flex-col items-center justify-center rounded-xl border border-dashed py-16">
          <div className="bg-muted flex h-12 w-12 items-center justify-center rounded-full">
            <Search className="text-muted-foreground h-5 w-5" />
          </div>
          <h3 className="text-foreground mt-4 text-sm font-semibold">
            No projects found
          </h3>
          <p className="text-muted-foreground mt-1 text-sm">
            Try adjusting your search or filter criteria.
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-4 bg-transparent"
            onClick={clearFilters}
          >
            Clear all filters
          </Button>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
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
                (page) => {
                  if (
                    totalPages <= 5 ||
                    page === 1 ||
                    page === totalPages ||
                    Math.abs(page - currentPage) <= 1
                  ) {
                    return (
                      <PaginationItem key={page}>
                        <PaginationLink
                          onClick={() => setCurrentPage(page)}
                          isActive={currentPage === page}
                          className="cursor-pointer"
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  }
                  if (page === currentPage - 2 || page === currentPage + 2) {
                    return (
                      <PaginationItem key={page}>
                        <PaginationEllipsis />
                      </PaginationItem>
                    );
                  }
                  return null;
                }
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
    </div>
  );
}
