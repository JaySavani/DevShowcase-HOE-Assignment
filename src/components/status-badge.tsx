import { CheckCircle2, Clock, XCircle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ProjectStatus } from "@/types/project";

const statusConfig: Record<
  ProjectStatus,
  { label: string; className: string; icon: typeof Clock }
> = {
  pending: {
    label: "Pending",
    className: "bg-warning/15 text-warning border-warning/25",
    icon: Clock,
  },
  approved: {
    label: "Approved",
    className: "bg-success/15 text-success border-success/25",
    icon: CheckCircle2,
  },
  rejected: {
    label: "Rejected",
    className: "bg-destructive/15 text-destructive border-destructive/25",
    icon: XCircle,
  },
};

export function StatusBadge({ status }: { status: ProjectStatus }) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Badge
      variant="outline"
      className={cn("gap-1 font-medium", config.className)}
    >
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
}
