import { cn } from "@/lib/utils";

interface PageSectionProps {
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
  contained?: boolean;
}

export function PageSection({
  children,
  className,
  contentClassName,
  contained = true,
}: PageSectionProps) {
  return (
    <section className={cn("py-5", className)}>
      {contained ? (
        <div className={cn("mx-auto w-full max-w-3xl px-4 sm:px-5", contentClassName)}>{children}</div>
      ) : (
        children
      )}
    </section>
  );
}
