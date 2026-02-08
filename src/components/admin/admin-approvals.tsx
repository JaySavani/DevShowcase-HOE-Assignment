"use client";

import { useEffect, useState } from "react";

import Link from "next/link";

import {
  CheckCircle2,
  Clock,
  ExternalLink,
  Eye,
  Github,
  Loader2,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

import { getAllProjects, updateProjectStatus } from "@/actions/admin-action";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import { cn } from "@/lib/utils";
import type { Project } from "@/types/project";

export function AdminApprovals() {
  const [pending, setPending] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewProject, setPreviewProject] = useState<Project | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  useEffect(() => {
    fetchPendingProjects();
  }, []);

  const fetchPendingProjects = async () => {
    setIsLoading(true);
    try {
      const result = await getAllProjects();
      if (result.success && result.data) {
        // Filter for pending status
        const pendingOnes = (result.data as Project[]).filter(
          (p) => p.status === "pending"
        );
        setPending(pendingOnes);
      } else {
        toast.error(result.error || "Failed to fetch pending projects");
      }
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    setIsSubmitting(true);
    try {
      const result = await updateProjectStatus(id, "APPROVED");
      if (result.success) {
        toast.success(result.message);
        fetchPendingProjects();
      } else {
        toast.error(result.error || "Failed to approve project");
      }
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async (id: string) => {
    setIsSubmitting(true);
    try {
      const result = await updateProjectStatus(id, "REJECTED");
      if (result.success) {
        toast.success(result.message);
        fetchPendingProjects();
      } else {
        toast.error(result.error || "Failed to reject project");
      }
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-4">
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
        <p className="text-muted-foreground text-sm">
          Loading pending projects...
        </p>
      </div>
    );
  }

  if (pending.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="bg-success/10 flex h-12 w-12 items-center justify-center rounded-full">
            <CheckCircle2 className="text-success h-5 w-5" />
          </div>
          <h3 className="text-foreground mt-4 text-sm font-semibold">
            All caught up
          </h3>
          <p className="text-muted-foreground mt-1 text-sm">
            No pending submissions to review.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="text-warning h-4 w-4" />
          <span className="text-foreground text-sm font-medium">
            {pending.length} pending{" "}
            {pending.length === 1 ? "submission" : "submissions"}
          </span>
        </div>
      </div>

      <div className="space-y-3">
        {pending.map((project) => {
          const initials = project.authorName
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase();

          return (
            <Card
              key={project.id}
              className="hover:border-primary/20 overflow-hidden border transition-all hover:shadow-xs"
            >
              <CardContent className="p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 flex-1 space-y-3">
                    <div className="flex items-start gap-3">
                      <Avatar className="mt-0.5 h-9 w-9 shrink-0">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <h3 className="text-foreground truncate text-base font-semibold">
                          {project.title}
                        </h3>
                        <p className="text-muted-foreground text-xs">
                          by {project.authorName} &middot;{" "}
                          {new Date(project.createdAt).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            }
                          )}
                        </p>
                      </div>
                    </div>
                    <p className="text-muted-foreground line-clamp-2 text-sm leading-relaxed">
                      {project.description}
                    </p>
                    <div className="flex flex-wrap items-center gap-2">
                      {project.categories.map((cat) => (
                        <Badge
                          key={cat.id}
                          variant="secondary"
                          className={cn("text-xs", cat.color)}
                        >
                          {cat.name}
                        </Badge>
                      ))}
                      <div className="ml-1 flex items-center gap-1">
                        <Link
                          href={project.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:bg-muted hover:text-foreground rounded-md p-1 transition-colors"
                          aria-label="GitHub"
                        >
                          <Github className="h-3.5 w-3.5" />
                        </Link>
                        {project.websiteUrl && (
                          <Link
                            href={project.websiteUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-muted-foreground hover:bg-muted hover:text-foreground rounded-md p-1 transition-colors"
                            aria-label="Website"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2 lg:flex-col lg:items-end">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5 bg-transparent"
                      disabled={isSubmitting}
                      onClick={() => {
                        setPreviewProject(project);
                        setPreviewOpen(true);
                      }}
                    >
                      <Eye className="h-3.5 w-3.5" />
                      Preview
                    </Button>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="bg-success hover:bg-success/90 text-success-foreground gap-1.5"
                        disabled={isSubmitting}
                        onClick={() => handleApprove(project.id)}
                      >
                        {isSubmitting ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        )}
                        Approve
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="gap-1.5"
                        disabled={isSubmitting}
                        onClick={() => handleReject(project.id)}
                      >
                        {isSubmitting ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <XCircle className="h-3.5 w-3.5" />
                        )}
                        Reject
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{previewProject?.title}</DialogTitle>
            <DialogDescription>
              Submitted by {previewProject?.authorName}
            </DialogDescription>
          </DialogHeader>
          {previewProject && (
            <div className="space-y-4">
              <p className="text-muted-foreground text-sm leading-relaxed">
                {previewProject.description}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {previewProject.categories.map((cat) => (
                  <Badge
                    key={cat.id}
                    variant="secondary"
                    className={cn("text-xs", cat.color)}
                  >
                    {cat.name}
                  </Badge>
                ))}
              </div>
              <div className="bg-muted/50 space-y-2 rounded-lg p-3">
                <div className="flex items-center gap-2 text-sm">
                  <Github className="text-muted-foreground h-4 w-4" />
                  <Link
                    href={previewProject.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    {previewProject.githubUrl}
                  </Link>
                </div>
                {previewProject.websiteUrl && (
                  <div className="flex items-center gap-2 text-sm">
                    <ExternalLink className="text-muted-foreground h-4 w-4" />
                    <Link
                      href={previewProject.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {previewProject.websiteUrl}
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="destructive"
              size="sm"
              className="gap-1.5"
              disabled={isSubmitting}
              onClick={() => {
                if (previewProject) handleReject(previewProject.id);
                setPreviewOpen(false);
              }}
            >
              {isSubmitting ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <XCircle className="h-3.5 w-3.5" />
              )}
              Reject
            </Button>
            <Button
              size="sm"
              className="bg-success hover:bg-success/90 text-success-foreground gap-1.5"
              disabled={isSubmitting}
              onClick={() => {
                if (previewProject) handleApprove(previewProject.id);
                setPreviewOpen(false);
              }}
            >
              {isSubmitting ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <CheckCircle2 className="h-3.5 w-3.5" />
              )}
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
