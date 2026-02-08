import Link from "next/link";

import { ExternalLink, Github } from "lucide-react";

import { StatusBadge } from "@/components/status-badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Project } from "@/types/project";

export function ProjectCard({
  project,
  showStatus = false,
}: {
  project: Project;
  showStatus?: boolean;
}) {
  const initials = project.authorName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <Card className="group hover:border-primary/30 hover:shadow-primary/5 flex flex-col gap-2 overflow-hidden border py-0 transition-all duration-200 hover:shadow-lg">
      <CardHeader className="pt-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="text-foreground group-hover:text-primary truncate text-base font-semibold transition-colors">
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

      <CardFooter className="bg-muted/30 px-5 py-3">
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <span className="text-muted-foreground text-xs font-medium">
              {project.authorName}
            </span>
          </div>
          <div className="flex items-center gap-2">
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
