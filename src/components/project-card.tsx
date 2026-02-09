import Link from "next/link";

import {
  ExternalLink,
  Github,
  MessageSquare,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";

import { StatusBadge } from "@/components/status-badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Project } from "@/types/project";

export function ProjectCard({
  project,
  showStatus = false,
}: {
  project: Project;
  showStatus?: boolean;
}) {
  const isApproved = project.status === "approved";

  const initials = project.authorName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <Card
      className={cn(
        "flex flex-col gap-2 overflow-hidden border py-0 transition-all duration-200",
        isApproved
          ? "group hover:border-primary/30 hover:shadow-primary/5 hover:shadow-lg"
          : "opacity-95"
      )}
    >
      {isApproved ? (
        <Link
          href={`/projects/${project.slug}`}
          className="flex flex-1 flex-col"
        >
          <CardHeader className="pt-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <h3 className="group-hover:text-primary text-foreground truncate text-base font-semibold transition-colors">
                  {project.title}
                </h3>
              </div>
              {showStatus && <StatusBadge status={project.status} />}
            </div>
          </CardHeader>

          <CardContent className="flex-1 pb-4">
            <p className="text-muted-foreground line-clamp-2 text-sm leading-relaxed">
              {project.description}
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {project.categories.map((cat) => (
                <Badge
                  key={cat.id}
                  variant="secondary"
                  className={`text-xs font-medium ${cat.color}`}
                >
                  {cat.name}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Link>
      ) : (
        <div className="flex flex-1 cursor-default flex-col select-none">
          <CardHeader className="pt-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <h3 className="text-foreground truncate text-base font-semibold transition-colors">
                  {project.title}
                </h3>
              </div>
              {showStatus && <StatusBadge status={project.status} />}
            </div>
          </CardHeader>

          <CardContent className="flex-1 pb-4">
            <p className="text-muted-foreground line-clamp-2 text-sm leading-relaxed">
              {project.description}
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {project.categories.map((cat) => (
                <Badge
                  key={cat.id}
                  variant="secondary"
                  className={`text-xs font-medium ${cat.color}`}
                >
                  {cat.name}
                </Badge>
              ))}
            </div>
          </CardContent>
        </div>
      )}

      <CardFooter className="bg-muted/30 px-5 py-3">
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center gap-3">
            {project.stats && (
              <div className="flex items-center gap-2">
                <div className="text-muted-foreground flex items-center gap-1 text-[10px] font-medium">
                  <ThumbsUp className="h-3 w-3" />
                  <span>{project.stats.upvotes}</span>
                </div>
                <div className="text-muted-foreground flex items-center gap-1 text-[10px] font-medium">
                  <ThumbsDown className="h-3 w-3" />
                  <span>{project.stats.downvotes}</span>
                </div>
                {project.stats.commentCount > 0 && (
                  <div className="text-muted-foreground flex items-center gap-1 text-[10px] font-medium">
                    <MessageSquare className="h-3 w-3" />
                    <span>{project.stats.commentCount}</span>
                  </div>
                )}
              </div>
            )}
            <div className="flex items-center gap-1.5 border-l pl-3">
              <Avatar className="h-5 w-5">
                <AvatarFallback className="bg-primary/10 text-primary text-[8px] font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <span className="text-muted-foreground max-w-[80px] truncate text-[10px] font-medium">
                {project.authorName}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Link
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:bg-muted hover:text-foreground rounded-md p-1.5 transition-colors"
              aria-label={`View ${project.title} on GitHub`}
            >
              <Github className="h-4 w-4" />
            </Link>
            {project.websiteUrl && (
              <Link
                href={project.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:bg-muted hover:text-foreground rounded-md p-1.5 transition-colors"
                aria-label={`Visit ${project.title} website`}
              >
                <ExternalLink className="h-4 w-4" />
              </Link>
            )}
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
