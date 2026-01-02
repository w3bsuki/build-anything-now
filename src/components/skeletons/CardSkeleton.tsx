import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface CardSkeletonProps {
  className?: string;
}

export function CaseCardSkeleton({ className }: CardSkeletonProps) {
  return (
    <div className={cn('bg-card rounded-xl overflow-hidden border border-border/50', className)}>
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
    <div className={cn('bg-card rounded-xl overflow-hidden border border-border/50', className)}>
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
    <div className={cn('bg-card rounded-xl border border-border/50 p-4', className)}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1">
          <Skeleton className="h-5 w-2/3 mb-2" />
          <Skeleton className="h-3 w-full" />
        </div>
        <Skeleton className="h-6 w-12 rounded-full" />
      </div>
      <div className="space-y-2 mb-3">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-40" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-5 w-20 rounded-full" />
        <Skeleton className="h-5 w-14 rounded-full" />
      </div>
    </div>
  );
}

export function PartnerCardSkeleton({ className }: CardSkeletonProps) {
  return (
    <div className={cn('bg-card rounded-xl border border-border/50 p-4', className)}>
      <div className="flex items-center gap-3">
        <Skeleton className="w-14 h-14 rounded-xl" />
        <div className="flex-1">
          <Skeleton className="h-4 w-24 mb-2" />
          <Skeleton className="h-3 w-full" />
        </div>
      </div>
    </div>
  );
}
