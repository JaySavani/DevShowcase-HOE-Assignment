"use client";

import { useCallback, useEffect, useState } from "react";

import { formatDistanceToNow } from "date-fns";
import { Loader2, MessageSquare, Send } from "lucide-react";
import { toast } from "sonner";

import { addComment, getComments } from "@/actions/social-action";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface Comment {
  id: string;
  content: string;
  authorName: string;
  createdAt: string;
}

export function CommentsSection({ projectId }: { projectId: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);

  const loadComments = useCallback(
    async (targetPage: number, isInitial: boolean) => {
      if (isInitial) setIsLoading(true);
      else setIsLoadingMore(true);

      const result = await getComments(projectId, targetPage);

      if (result.success && result.data) {
        if (isInitial) {
          setComments(result.data);
          setPage(1);
        } else {
          setComments((prev) => [...prev, ...result.data]);
          setPage(targetPage);
        }
        setHasMore(result.pagination?.hasMore || false);
      }

      setIsLoading(false);
      setIsLoadingMore(false);
    },
    [projectId]
  );

  useEffect(() => {
    loadComments(1, true);
  }, [loadComments]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const result = await addComment(projectId, newComment);
      if (result.success) {
        setNewComment("");
        toast.success("Comment added");
        loadComments(1, true);
      } else {
        toast.error(result.error || "Failed to add comment");
      }
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLoadMore = () => {
    if (hasMore && !isLoadingMore) {
      loadComments(page + 1, false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Comment Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <Textarea
          placeholder="Share your thoughts on this project..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="min-h-[100px] resize-none"
        />
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={isSubmitting || !newComment.trim()}
            className="gap-2"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            Post Comment
          </Button>
        </div>
      </form>

      {/* Comments List */}
      <div className="space-y-6">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
          </div>
        ) : comments.length > 0 ? (
          <>
            <div className="space-y-6">
              {comments.map((comment) => (
                <div key={comment.id} className="flex gap-4">
                  <Avatar className="h-9 w-9 border">
                    <AvatarFallback className="bg-primary/5 text-primary text-xs font-semibold">
                      {comment.authorName[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-bold">
                        {comment.authorName}
                      </span>
                      <span className="text-muted-foreground text-xs">
                        {formatDistanceToNow(new Date(comment.createdAt), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {comment.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {hasMore && (
              <div className="flex justify-center pt-4">
                <Button
                  variant="ghost"
                  onClick={handleLoadMore}
                  disabled={isLoadingMore}
                  className="gap-2 text-sm"
                >
                  {isLoadingMore ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : null}
                  Load More Comments
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="bg-muted/30 flex flex-col items-center justify-center rounded-xl py-12 text-center">
            <div className="bg-muted flex h-10 w-10 items-center justify-center rounded-full">
              <MessageSquare className="text-muted-foreground h-5 w-5" />
            </div>
            <p className="text-muted-foreground mt-3 text-sm font-medium">
              No comments yet. Be the first to share your thoughts!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
