import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: string;
  description?: string;
  icon: LucideIcon;
  iconBg?: string;
  iconColor?: string;
  gradientFrom?: string;
  className?: string;
}

export function PageHeader({
  title,
  description,
  icon: Icon,
  iconBg = "bg-primary",
  iconColor = "text-primary-foreground",
  gradientFrom,
  className,
}: PageHeaderProps) {
  void gradientFrom;
  return (
    <section
      className={cn(
        "bg-surface-sunken/40 py-6 md:py-8",
        className
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center gap-2.5 mb-2">
          <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center", iconBg)}>
            <Icon className={cn("w-5 h-5", iconColor)} />
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-foreground">
            {title}
          </h1>
        </div>
        {description && (
          <p className="text-center text-muted-foreground text-sm max-w-sm mx-auto">
            {description}
          </p>
        )}
      </div>
    </section>
  );
}
