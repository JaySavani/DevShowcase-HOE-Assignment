"use client";

import { useState } from "react";

import Link from "next/link";

import { ArrowLeft, CheckCircle2, Rocket } from "lucide-react";
import { toast } from "sonner";

import { submitProject } from "@/actions/submit-action";
import { ProjectForm } from "@/components/project-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ProjectFormValues } from "@/lib/schemas";

export default function SubmitProjectPage() {
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: ProjectFormValues) => {
    setIsLoading(true);
    try {
      const result = await submitProject(data);
      if (result.success) {
        toast.success(result.message || "Project submitted successfully!");
        setSubmitted(true);
      } else {
        toast.error(result.error || "Failed to submit project");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 lg:px-8">
        <Card className="border-success/20">
          <CardContent className="flex flex-col items-center py-12 text-center">
            <div className="bg-success/10 flex h-16 w-16 items-center justify-center rounded-full">
              <CheckCircle2 className="text-success h-8 w-8" />
            </div>
            <h2 className="text-foreground mt-6 text-xl font-semibold">
              Project Submitted Successfully
            </h2>
            <p className="text-muted-foreground mt-2 max-w-sm text-sm leading-relaxed">
              Your project has been submitted for review. An admin will review
              your submission and approve or reject it shortly.
            </p>
            <div className="mt-8 flex items-center gap-3">
              <Link href="/my-projects">
                <Button variant="outline" className="gap-2 bg-transparent">
                  View My Projects
                </Button>
              </Link>
              <Button onClick={() => setSubmitted(false)} className="gap-2">
                <Rocket className="h-4 w-4" />
                Submit Another
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 lg:px-8">
      <div className="mb-6">
        <Link
          href="/"
          className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-sm transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Explore
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg">
              <Rocket className="text-primary h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-xl">Submit a Project</CardTitle>
              <CardDescription>
                Share your project with the community for review.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ProjectForm onSubmit={handleSubmit} isLoading={isLoading} />
        </CardContent>
      </Card>
    </div>
  );
}
