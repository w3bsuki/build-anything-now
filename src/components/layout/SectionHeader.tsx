import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  title: React.ReactNode;
  count?: number;
  description?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
  titleClassName?: string;
}

export function SectionHeader({
  title,
  count,
  description,
  action,
  className,
  titleClassName,
}: SectionHeaderProps) {
  return (
    <div className={cn("mb-3.5 flex items-start justify-between gap-3", className)}>
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <h2 className={cn("font-display text-xl font-bold leading-tight tracking-tight text-foreground", titleClassName)}>{title}</h2>
          {typeof count === "number" ? (
            <span className="inline-flex h-5 items-center rounded-full border border-border/70 bg-surface-sunken px-2 text-[11px] font-semibold text-foreground/80">
              {count}
            </span>
          ) : null}
        </div>
        {description ? <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{description}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
