import { AlertTriangle, Eye } from 'lucide-react';
import { useQuery } from 'convex/react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { api } from '../../../convex/_generated/api';
import type { Id } from '../../../convex/_generated/dataModel';

/**
 * Internal-only badge showing if a case has pending reports.
 * Only visible to ops roles (admin, clinic).
 * 
 * Returns null if:
 * - User is not logged in
 * - User is not admin/clinic role
 * - Case has no pending reports
 */
export function ReportedBadge({
  caseId,
  className,
}: {
  caseId: string;
  className?: string;
}) {
  const reportStatus = useQuery(
    api.reports.getCasePendingReportStatus,
    { caseId: caseId as Id<"cases"> }
  );

  // Don't render anything if user can't see reports or no pending reports
  if (!reportStatus?.hasPendingReports) {
    return null;
  }

  const isReviewing = reportStatus.status === "reviewing";
  const label = isReviewing ? "Under review" : "Reported";
  const description = isReviewing 
    ? `This case is under review (${reportStatus.count} report${reportStatus.count > 1 ? 's' : ''})`
    : `${reportStatus.count} report${reportStatus.count > 1 ? 's' : ''} pending review`;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          className={cn(
            'inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-sm',
            isReviewing 
              ? 'bg-warning/15 text-warning-foreground'
              : 'bg-muted text-muted-foreground',
            className
          )}
        >
          {isReviewing ? (
            <Eye className="h-2.5 w-2.5" />
          ) : (
            <AlertTriangle className="h-2.5 w-2.5" />
          )}
          <span>{label}</span>
        </span>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="max-w-[200px] text-left">
        <p className="text-xs">{description}</p>
        <p className="text-[10px] text-muted-foreground mt-0.5">Only visible to ops</p>
      </TooltipContent>
    </Tooltip>
  );
}
