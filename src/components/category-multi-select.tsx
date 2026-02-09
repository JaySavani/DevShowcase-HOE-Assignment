"use client";

import { useEffect, useRef, useState } from "react";

import { Check, ChevronsUpDown, Loader2, X } from "lucide-react";
import { toast } from "sonner";

import { getCategories } from "@/actions/project-action";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Category } from "@/types/project";

interface CategoryMultiSelectProps {
  value: string[];
  onChange: (value: string[]) => void;
  error?: string;
}

export function CategoryMultiSelect({
  value,
  onChange,
  error,
}: CategoryMultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const result = await getCategories();
        if (result.success && result.data) {
          setCategories(result.data);
        } else {
          toast.error("Failed to load categories");
        }
      } catch {
        toast.error("An error occurred while loading categories");
      } finally {
        setIsLoading(false);
      }
    }
    fetchCategories();
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedCategories = categories.filter((c) => value.includes(c.id));

  const toggleCategory = (id: string) => {
    if (value.includes(id)) {
      onChange(value.filter((v) => v !== id));
    } else {
      onChange([...value, id]);
    }
  };

  const removeCategory = (id: string) => {
    onChange(value.filter((v) => v !== id));
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        disabled={isLoading}
        className={cn(
          "ring-offset-background flex min-h-10 w-full items-center justify-between rounded-md border bg-transparent px-3 py-2 text-sm transition-colors",
          "focus:ring-ring focus:ring-2 focus:ring-offset-2 focus:outline-hidden",
          error ? "border-destructive" : "border-input",
          isLoading ? "cursor-not-allowed opacity-50" : "hover:bg-muted/50"
        )}
      >
        <div className="flex flex-1 flex-wrap gap-1">
          {isLoading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-muted-foreground">
                Loading categories...
              </span>
            </div>
          ) : selectedCategories.length > 0 ? (
            selectedCategories.map((cat) => (
              <Badge
                key={cat.id}
                variant="secondary"
                className={cn("gap-1 text-xs", cat.color)}
              >
                {cat.name}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeCategory(cat.id);
                  }}
                  className="hover:bg-foreground/10 ml-0.5 rounded-full p-0.5"
                  aria-label={`Remove ${cat.name}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))
          ) : (
            <span className="text-muted-foreground">Select categories...</span>
          )}
        </div>
        <ChevronsUpDown className="text-muted-foreground ml-2 h-4 w-4 shrink-0" />
      </button>

      {open && (
        <div className="bg-popover absolute z-50 mt-1 w-full rounded-md border p-1 shadow-lg">
          <div className="max-h-60 overflow-auto">
            {categories.map((cat) => {
              const isSelected = value.includes(cat.id);
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => toggleCategory(cat.id)}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm transition-colors",
                    isSelected
                      ? "bg-primary/10 text-foreground"
                      : "text-foreground hover:bg-muted"
                  )}
                >
                  <div
                    className={cn(
                      "flex h-4 w-4 items-center justify-center rounded-sm border",
                      isSelected
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-muted-foreground/30"
                    )}
                  >
                    {isSelected && <Check className="h-3 w-3" />}
                  </div>
                  <Badge
                    variant="secondary"
                    className={cn("text-xs", cat.color)}
                  >
                    {cat.name}
                  </Badge>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {error && <p className="text-destructive mt-1.5 text-xs">{error}</p>}
    </div>
  );
}
