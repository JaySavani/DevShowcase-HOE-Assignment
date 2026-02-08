"use client";

import { useState } from "react";

import { ThumbsDown, ThumbsUp } from "lucide-react";
import { toast } from "sonner";

import { voteProject } from "@/actions/social-action";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface VoteButtonsProps {
  projectId: string;
  initialUpvotes: number;
  initialDownvotes: number;
  initialUserVote: number;
}

export function VoteButtons({
  projectId,
  initialUpvotes,
  initialDownvotes,
  initialUserVote,
}: VoteButtonsProps) {
  const [upvotes, setUpvotes] = useState(initialUpvotes);
  const [downvotes, setDownvotes] = useState(initialDownvotes);
  const [userVote, setUserVote] = useState(initialUserVote);
  const [isVoting, setIsVoting] = useState(false);

  const handleVote = async (value: number) => {
    if (isVoting) return;

    // Toggle vote if clicking the same one
    const newValue = userVote === value ? 0 : value;

    setIsVoting(true);

    // Optimistic UI
    const prevUserVote = userVote;
    setUserVote(newValue);

    if (prevUserVote === 1) setUpvotes((u) => u - 1);
    else if (prevUserVote === -1) setDownvotes((d) => d - 1);

    if (newValue === 1) setUpvotes((u) => u + 1);
    else if (newValue === -1) setDownvotes((d) => d + 1);

    try {
      const result = await voteProject(projectId, newValue);
      if (!result.success) {
        // Rollback
        setUserVote(prevUserVote);
        if (newValue === 1) setUpvotes((u) => u - 1);
        else if (newValue === -1) setDownvotes((d) => d - 1);

        if (prevUserVote === 1) setUpvotes((u) => u + 1);
        else if (prevUserVote === -1) setDownvotes((d) => d + 1);

        toast.error(result.error || "Failed to vote");
      }
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setIsVoting(false);
    }
  };

  return (
    <div className="bg-muted/50 flex items-center gap-1 rounded-full border p-1">
      <Button
        variant="ghost"
        size="sm"
        className={cn(
          "h-8 gap-1.5 rounded-full px-3",
          userVote === 1 && "bg-primary/10 text-primary hover:bg-primary/20"
        )}
        onClick={() => handleVote(1)}
        disabled={isVoting}
      >
        <ThumbsUp className={cn("h-4 w-4", userVote === 1 && "fill-current")} />
        <span className="text-xs font-bold">{upvotes}</span>
      </Button>
      <div className="bg-border mx-0.5 h-4 w-px" />
      <Button
        variant="ghost"
        size="sm"
        className={cn(
          "h-8 gap-1.5 rounded-full px-3",
          userVote === -1 &&
            "bg-destructive/10 text-destructive hover:bg-destructive/20"
        )}
        onClick={() => handleVote(-1)}
        disabled={isVoting}
      >
        <ThumbsDown
          className={cn("h-4 w-4", userVote === -1 && "fill-current")}
        />
        <span className="text-xs font-bold">{downvotes}</span>
      </Button>
    </div>
  );
}
