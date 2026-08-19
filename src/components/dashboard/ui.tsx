import type { ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { label } from "@/lib/labels";

export function PageTitle({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function StatCard({
  label: title,
  value,
  hint,
}: {
  label: string;
  value: ReactNode;
  hint?: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <p className="text-xs uppercase tracking-wider text-muted-foreground">{title}</p>
      <p className="mt-2 text-2xl font-semibold tabular-nums">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function Loading({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2 py-10 text-sm text-muted-foreground", className)}>
      <Loader2 className="size-4 animate-spin" /> Loading…
    </div>
  );
}

export function EmptyState({ title, body }: { title: string; body?: string }) {
  return (
    <div className="rounded-xl border border-dashed border-border p-10 text-center">
      <p className="text-sm font-medium">{title}</p>
      {body && <p className="mt-1 text-sm text-muted-foreground">{body}</p>}
    </div>
  );
}

const TONE: Record<string, string> = {
  confirmed: "bg-primary/12 text-primary border-primary/25",
  completed: "bg-primary/12 text-primary border-primary/25",
  paid: "bg-primary/12 text-primary border-primary/25",
  connected: "bg-primary/12 text-primary border-primary/25",
  pending: "bg-accent/15 text-accent border-accent/30",
  partially_paid: "bg-accent/15 text-accent border-accent/30",
  awaiting_payment: "bg-accent/15 text-accent border-accent/30",
  planning: "bg-accent/15 text-accent border-accent/30",
  negotiating: "bg-accent/15 text-accent border-accent/30",
  cancelled: "bg-destructive/12 text-destructive border-destructive/25",
  lost: "bg-destructive/12 text-destructive border-destructive/25",
  refunded: "bg-destructive/12 text-destructive border-destructive/25",
};

export function StatusBadge({ value }: { value: string }) {
  return (
    <Badge
      variant="outline"
      className={cn("font-normal", TONE[value] ?? "bg-muted text-muted-foreground border-border")}
    >
      {label(value)}
    </Badge>
  );
}
