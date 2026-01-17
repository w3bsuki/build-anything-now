import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface CardSkeletonProps {
  className?: string;
}

export function CaseCardSkeleton({ className }: CardSkeletonProps) {
  return (
    <div className={cn('bg-card rounded-xl overflow-hidden shadow-sm ring-1 ring-border/30', className)}>
      <Skeleton className="aspect-[4/3] w-full" />
      <div className="p-3.5">
        <Skeleton className="h-5 w-3/4 mb-2" />
        <Skeleton className="h-3 w-1/2 mb-3" />
        <Skeleton className="h-2 w-full rounded-full" />
        <div className="flex justify-between mt-2">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-12" />
        </div>
      </div>
    </div>
  );
}

export function CampaignCardSkeleton({ className }: CardSkeletonProps) {
  return (
    <div className={cn('bg-card rounded-xl overflow-hidden shadow-sm ring-1 ring-border/30', className)}>
      <Skeleton className="aspect-video w-full" />
      <div className="p-4">
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-3/4 mb-4" />
        <div className="flex justify-between mb-2">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-4 w-10" />
        </div>
        <Skeleton className="h-2 w-full rounded-full mb-4" />
        <Skeleton className="h-10 w-full rounded-full" />
      </div>
    </div>
  );
}

export function ClinicCardSkeleton({ className }: CardSkeletonProps) {
  return (
    <div className={cn('bg-card rounded-2xl shadow-sm ring-1 ring-border/30 overflow-hidden', className)}>
      {/* Image area */}
      <Skeleton className="aspect-[4/3] w-full" />
      {/* Content area */}
      <div className="p-3 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  );
}

export function PartnerCardSkeleton({ className }: CardSkeletonProps) {
  return (
    <div className={cn('bg-card rounded-xl shadow-sm ring-1 ring-border/30 overflow-hidden', className)}>
      <div className="p-4">
        <div className="flex items-start gap-3">
          <Skeleton className="w-14 h-14 rounded-lg flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <Skeleton className="h-4 w-32 mb-2" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
        </div>
        <Skeleton className="h-3 w-full mt-3" />
        <Skeleton className="h-3 w-3/4 mt-1" />
      </div>
      <div className="bg-muted/30 px-4 py-2.5 flex items-center justify-between border-t border-border/50">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-3 w-16" />
      </div>
    </div>
  );
}
