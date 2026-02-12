import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation } from 'convex/react';
import { useAuth } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { Flag, Loader2 } from 'lucide-react';
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

import { api } from '../../../convex/_generated/api';
import type { Id } from '../../../convex/_generated/dataModel';

export type ReportReason =
  | 'suspected_scam'
  | 'duplicate_case'
  | 'incorrect_information'
  | 'animal_welfare'
  | 'other';

const maxDetailsChars = 500;

export function ReportConcernSheet({
  open,
  onOpenChange,
  caseId,
  caseTitle,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  caseId: string;
  caseTitle?: string;
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isLoaded, isSignedIn } = useAuth();
  const createReport = useMutation(api.reports.create);
  const [reason, setReason] = useState<ReportReason>('suspected_scam');
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const reasons = useMemo(
    () =>
      [
        { value: 'suspected_scam' as const, label: t('report.reasons.suspectedScam', 'Suspected scam or fraud') },
        { value: 'duplicate_case' as const, label: t('report.reasons.duplicate', 'Duplicate case') },
        { value: 'incorrect_information' as const, label: t('report.reasons.incorrect', 'Incorrect information') },
        { value: 'animal_welfare' as const, label: t('report.reasons.welfare', 'Animal welfare concern') },
        { value: 'other' as const, label: t('report.reasons.other', 'Other') },
      ] satisfies Array<{ value: ReportReason; label: string }>,
    [t]
  );

  const submit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await createReport({
        caseId: caseId as Id<'cases'>,
        reason,
        details: details.trim() ? details.trim() : undefined,
      });
      toast({
        title: t('report.thanksTitle', 'Thanks for helping'),
        description: t('report.thanksBody', "We'll review this within 24 hours."),
      });
      onOpenChange(false);
      setDetails('');
      setReason('suspected_scam');
    } catch (error) {
      toast({
        title: t('common.error', 'Error'),
        description: error instanceof Error ? error.message : t('common.unknownError', 'Something went wrong'),
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-2xl px-4 pb-[calc(env(safe-area-inset-bottom)+1rem)]">
        <SheetHeader className="text-left">
          <SheetTitle className="flex items-center gap-2">
            <Flag className="h-5 w-5 text-muted-foreground" />
            {t('report.title', 'Help us keep Pawtreon safe')}
          </SheetTitle>
          <SheetDescription>
            {caseTitle ? (
              <span className="block">
                <span className="text-muted-foreground">{t('report.caseLabel', 'Case')}:</span>{' '}
                <span className="font-medium text-foreground">{caseTitle}</span>
              </span>
            ) : null}
            <span className="block">{t('report.subtitle', 'Select the reason for your report')}</span>
          </SheetDescription>
        </SheetHeader>

        <div className="mt-4 space-y-4">
          <RadioGroup value={reason} onValueChange={(v) => setReason(v as ReportReason)} className="gap-3">
            {reasons.map((r) => (
              <div key={r.value} className="flex items-start gap-3 rounded-xl border border-border/60 bg-card/40 p-3">
                <RadioGroupItem value={r.value} id={`report-${r.value}`} className="mt-0.5" />
                <Label htmlFor={`report-${r.value}`} className="cursor-pointer text-sm leading-snug">
                  {r.label}
                </Label>
              </div>
            ))}
          </RadioGroup>

          <div className="space-y-1.5">
            <Label htmlFor="report-details" className="text-sm">
              {t('report.detailsLabel', 'Details (optional)')}
            </Label>
            <Textarea
              id="report-details"
              value={details}
              onChange={(e) => setDetails(e.target.value.slice(0, maxDetailsChars))}
              placeholder={t('report.detailsPlaceholder', 'Add any helpful context (links, what looks wrong, etc.)')}
              className="min-h-[96px] resize-none"
              maxLength={maxDetailsChars}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{t('report.privateNote', "Don't include private info.")}</span>
              <span className={cn(details.length > maxDetailsChars * 0.9 && 'text-foreground')}>
                {details.length}/{maxDetailsChars}
              </span>
            </div>
          </div>
        </div>

        <SheetFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            {t('actions.cancel', 'Cancel')}
          </Button>
          {isLoaded && !isSignedIn ? (
            <Button
              onClick={() => {
                onOpenChange(false);
                navigate('/sign-in');
              }}
            >
              {t('report.signInToReport', 'Sign in to report')}
            </Button>
          ) : (
            <Button onClick={submit} disabled={isSubmitting || !isLoaded}>
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {t('report.submit', 'Submit report')}
            </Button>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}


