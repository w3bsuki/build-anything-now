import { cn } from "@/lib/utils";

interface StickySegmentRailProps {
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
}

export function StickySegmentRail({ children, className, contentClassName }: StickySegmentRailProps) {
  return (
    <div
      className={cn(
        "sticky top-14 z-30 hidden border-b border-nav-border/80 bg-nav-surface py-2.5 md:block",
        className,
      )}
    >
      <div className="mx-auto w-full max-w-3xl px-4 sm:px-5">
        <div className={cn("rounded-2xl border border-border/65 bg-surface-overlay px-2.5 py-2", contentClassName)}>
          {children}
        </div>
      </div>
    </div>
  );
}
