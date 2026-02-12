import { cn } from "@/lib/utils";

interface StickyActionBarProps {
  children: React.ReactNode;
  note?: React.ReactNode;
  className?: string;
}

export function StickyActionBar({ children, note, className }: StickyActionBarProps) {
  return (
    <div className={cn("sticky-donate", className)}>
      <div>
        <div className="flex items-center gap-2">{children}</div>
        {note ? <p className="mt-1 text-center text-[11px] text-muted-foreground">{note}</p> : null}
      </div>
    </div>
  );
}

