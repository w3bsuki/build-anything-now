import { cn } from "@/lib/utils";

interface PageShellProps {
  children: React.ReactNode;
  className?: string;
  withDesktopTopOffset?: boolean;
  withBottomNavOffset?: boolean;
}

export function PageShell({
  children,
  className,
  withDesktopTopOffset = true,
  withBottomNavOffset = true,
}: PageShellProps) {
  return (
    <div
      className={cn(
        "min-h-screen bg-background text-foreground",
        withBottomNavOffset && "pb-28 md:pb-8",
        withDesktopTopOffset && "md:pt-16",
        className,
      )}
    >
      {children}
    </div>
  );
}
