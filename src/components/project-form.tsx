"use client";

import React from "react";
import { useState } from "react";

import { FileText, Github, Globe, Loader2, Send, Tag } from "lucide-react";

import { CategoryMultiSelect } from "@/components/category-multi-select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { type ProjectFormValues, projectSchema } from "@/lib/schemas";

interface ProjectFormProps {
  defaultValues?: Partial<ProjectFormValues>;
  onSubmit: (data: ProjectFormValues) => void;
  submitLabel?: string;
  isLoading?: boolean;
}

export function ProjectForm({
  defaultValues,
  onSubmit,
  submitLabel = "Submit Project",
  isLoading = false,
}: ProjectFormProps) {
  const [values, setValues] = useState<ProjectFormValues>({
    title: defaultValues?.title || "",
    description: defaultValues?.description || "",
    githubUrl: defaultValues?.githubUrl || "",
    websiteUrl: defaultValues?.websiteUrl || "",
    categoryIds: defaultValues?.categoryIds || [],
  });
  const [errors, setErrors] = useState<
    Partial<Record<keyof ProjectFormValues, string>>
  >({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = projectSchema.safeParse(values);

    if (!result.success) {
      const fieldErrors: Partial<Record<keyof ProjectFormValues, string>> = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof ProjectFormValues;
        if (!fieldErrors[field]) {
          fieldErrors[field] = issue.message;
        }
      }
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    onSubmit(result.data);
  };

  const updateField = <K extends keyof ProjectFormValues>(
    field: K,
    value: ProjectFormValues[K]
  ) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label
          htmlFor="title"
          className="flex items-center gap-2 text-sm font-medium"
        >
          <FileText className="text-muted-foreground h-4 w-4" />
          Project Title
        </Label>
        <Input
          id="title"
          placeholder="e.g. My Awesome Project"
          value={values.title}
          onChange={(e) => updateField("title", e.target.value)}
          className={errors.title ? "border-destructive" : ""}
        />
        {errors.title && (
          <p className="text-destructive text-xs">{errors.title}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label
          htmlFor="description"
          className="flex items-center gap-2 text-sm font-medium"
        >
          <FileText className="text-muted-foreground h-4 w-4" />
          Description
        </Label>
        <Textarea
          id="description"
          placeholder="Describe your project in detail. What problem does it solve? What technologies are used?"
          value={values.description}
          onChange={(e) => updateField("description", e.target.value)}
          rows={4}
          className={errors.description ? "border-destructive" : ""}
        />
        <div className="flex items-center justify-between">
          {errors.description ? (
            <p className="text-destructive text-xs">{errors.description}</p>
          ) : (
            <span />
          )}
          <span className="text-muted-foreground text-xs">
            {values.description.length}/500
          </span>
        </div>
      </div>

      <div className="space-y-2">
        <Label
          htmlFor="githubUrl"
          className="flex items-center gap-2 text-sm font-medium"
        >
          <Github className="text-muted-foreground h-4 w-4" />
          GitHub URL
        </Label>
        <Input
          id="githubUrl"
          placeholder="https://github.com/username/repository"
          value={values.githubUrl}
          onChange={(e) => updateField("githubUrl", e.target.value)}
          className={errors.githubUrl ? "border-destructive" : ""}
        />
        {errors.githubUrl && (
          <p className="text-destructive text-xs">{errors.githubUrl}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label
          htmlFor="websiteUrl"
          className="flex items-center gap-2 text-sm font-medium"
        >
          <Globe className="text-muted-foreground h-4 w-4" />
          Website URL
          <span className="text-muted-foreground text-xs font-normal">
            (optional)
          </span>
        </Label>
        <Input
          id="websiteUrl"
          placeholder="https://your-project.com"
          value={values.websiteUrl}
          onChange={(e) => updateField("websiteUrl", e.target.value)}
          className={errors.websiteUrl ? "border-destructive" : ""}
        />
        {errors.websiteUrl && (
          <p className="text-destructive text-xs">{errors.websiteUrl}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label className="flex items-center gap-2 text-sm font-medium">
          <Tag className="text-muted-foreground h-4 w-4" />
          Categories
          <span className="text-muted-foreground text-xs font-normal">
            (select up to 3)
          </span>
        </Label>
        <CategoryMultiSelect
          value={values.categoryIds}
          onChange={(ids) => updateField("categoryIds", ids)}
          error={errors.categoryIds}
        />
      </div>

      <div className="flex justify-end pt-2">
        <Button type="submit" disabled={isLoading} className="gap-2">
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
