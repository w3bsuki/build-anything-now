import { Circle, CheckCircle, Hospital, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import type { CaseVerificationStatus } from '@/types';

const labelByStatus: Record<CaseVerificationStatus, string> = {
  unverified: 'Unverified',
  community: 'Community ✓',
  clinic: 'Clinic ✓',
};

const explainerByStatus: Record<CaseVerificationStatus, { title: string; body: string }> = {
  unverified: {
    title: 'Not yet verified',
    body: 'This case has not been reviewed by the community or a clinic. Exercise caution before donating.',
  },
  community: {
    title: 'Community verified',
    body: 'Trusted community members have confirmed this case appears legitimate based on available evidence.',
  },
  clinic: {
    title: 'Clinic verified',
    body: 'A verified partner clinic has confirmed they are treating this animal and the case details are accurate.',
  },
};

export function VerificationBadge({
  status,
  className,
  showExplainer = false,
}: {
  status: CaseVerificationStatus;
  className?: string;
  /** When true, shows a help icon that reveals an explainer tooltip */
  showExplainer?: boolean;
}) {
  const explainer = explainerByStatus[status];

  const badge = (
    <span
      className={cn(
        'inline-flex items-center gap-1 text-[10px] font-medium',
        status === 'unverified' && 'text-muted-foreground',
        status === 'community' && 'text-green-600 dark:text-green-500',
        status === 'clinic' && 'text-primary',
        className
      )}
    >
      {status === 'unverified' ? <Circle className="h-2.5 w-2.5" /> : null}
      {status === 'community' ? <CheckCircle className="h-3 w-3" /> : null}
      {status === 'clinic' ? (
        <>
          <Hospital className="h-3 w-3" />
          <CheckCircle className="-ml-1 h-2.5 w-2.5" />
        </>
      ) : null}
      <span>{labelByStatus[status]}</span>
      {showExplainer && (
        <HelpCircle className="h-3 w-3 opacity-50 hover:opacity-100 transition-opacity" />
      )}
    </span>
  );

  if (!showExplainer) {
    return badge;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button type="button" className="cursor-help">
          {badge}
        </button>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="max-w-[240px] text-left">
        <p className="font-semibold text-xs mb-1">{explainer.title}</p>
        <p className="text-xs text-muted-foreground leading-relaxed">{explainer.body}</p>
      </TooltipContent>
    </Tooltip>
  );
}

