import { Suspense } from "react";

import Link from "next/link";
import { notFound } from "next/navigation";

import { formatDistanceToNow } from "date-fns";
import { ArrowLeft, ExternalLink, Github, MessageSquare } from "lucide-react";

import { getProjectBySlug } from "@/actions/project-action";
import { getUserVote } from "@/actions/social-action";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Category } from "@/types/project";

import { CommentsSection } from "./comments-section";
import { VoteButtons } from "./vote-buttons";

export default async function ProjectDetailsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const result = await getProjectBySlug(slug);

  if (!result.success || !result.data) {
    notFound();
  }

  const project = result.data;
  const initialUserVoteResult = await getUserVote(project.id);
  const initialUserVote = initialUserVoteResult.success
    ? (initialUserVoteResult.value ?? 0)
    : 0;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 lg:px-8">
      <Link
        href="/"
        className="text-muted-foreground hover:text-foreground mb-6 flex items-center gap-2 text-sm font-medium transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Explore
      </Link>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <Card className="mb-8">
            <CardHeader className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between gap-4">
                  <CardTitle className="text-2xl font-bold">
                    {project.title}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <VoteButtons
                      projectId={project.id}
                      initialUpvotes={project.stats.upvotes}
                      initialDownvotes={project.stats.downvotes}
                      initialUserVote={initialUserVote}
                    />
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {project.categories.map((cat: Category) => (
                    <Badge key={cat.id} className={cat.color}>
                      {cat.name}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="prose prose-stone dark:prose-invert max-w-none">
                <p className="text-muted-foreground text-md leading-relaxed whitespace-pre-wrap">
                  {project.description}
                </p>
              </div>

              <div className="mt-8 flex flex-wrap gap-4">
                <Button asChild className="gap-2">
                  <Link href={project.githubUrl} target="_blank">
                    <Github className="h-4 w-4" />
                    View on GitHub
                  </Link>
                </Button>
                {project.websiteUrl && (
                  <Button asChild variant="outline" className="gap-2">
                    <Link href={project.websiteUrl} target="_blank">
                      <ExternalLink className="h-4 w-4" />
                      Visit Website
                    </Link>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          <Separator className="my-8" />

          <section>
            <div className="mb-6 flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              <h2 className="text-md font-bold">
                Comments ({project.stats.commentCount})
              </h2>
            </div>
            <Suspense fallback={<div>Loading comments...</div>}>
              <CommentsSection projectId={project.id} />
            </Suspense>
          </section>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <Card className="gap-2">
            <CardHeader>
              <CardTitle className="text-muted-foreground text-sm font-medium tracking-wider uppercase">
                About the Author
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-full font-bold">
                  {project.authorName[0].toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold">{project.authorName}</p>
                  <p className="text-muted-foreground text-xs">
                    {project.authorEmail}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="gap-2">
            <CardHeader>
              <CardTitle className="text-muted-foreground text-sm font-medium tracking-wider uppercase">
                Project Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-muted-foreground text-xs">Submitted</p>
                <p className="text-sm font-medium">
                  {formatDistanceToNow(new Date(project.createdAt), {
                    addSuffix: true,
                  })}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Last Updated</p>
                <p className="text-sm font-medium">
                  {formatDistanceToNow(new Date(project.updatedAt), {
                    addSuffix: true,
                  })}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
