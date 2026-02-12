import { cn } from "@/lib/utils";

export interface StatsGridItem {
  id: string;
  label: string;
  value: string;
  icon: React.ReactNode;
  tone?: "primary" | "success" | "warning" | "destructive" | "accent";
}

interface StatsGridProps {
  items: StatsGridItem[];
  className?: string;
}

const toneClasses: Record<NonNullable<StatsGridItem["tone"]>, string> = {
  primary: "bg-primary/10 text-primary",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  destructive: "bg-destructive/10 text-destructive",
  accent: "bg-accent/15 text-accent-foreground",
};

export function StatsGrid({ items, className }: StatsGridProps) {
  if (items.length === 0) return null;

  return (
    <div className={cn("overflow-hidden rounded-2xl border border-border/60 bg-surface-elevated shadow-xs", className)}>
      <div
        className={cn(
          "grid divide-x divide-border/50",
          items.length === 2 && "grid-cols-2",
          items.length === 3 && "grid-cols-3",
          items.length >= 4 && "grid-cols-2 sm:grid-cols-4",
        )}
      >
        {items.map((item) => (
          <div key={item.id} className="p-4 text-center">
            <div
              className={cn(
                "mb-2 inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border/40",
                toneClasses[item.tone ?? "primary"],
              )}
            >
              {item.icon}
            </div>
            <p className="font-display text-2xl font-bold leading-none text-foreground">{item.value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{item.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
