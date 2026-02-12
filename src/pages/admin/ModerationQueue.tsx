import { useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { useTranslation } from 'react-i18next';
import { api } from '../../../convex/_generated/api';
import { PageShell } from '@/components/layout/PageShell';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import type { Id } from '../../../convex/_generated/dataModel';

type ResolveAction = 'hide_case' | 'warn_user' | 'dismiss' | 'no_action';

export default function ModerationQueue() {
  const { t } = useTranslation();
  const me = useQuery(api.users.me);
  const reports = useQuery(api.reports.listPending, me?.role === 'admin' ? {} : 'skip');
  const setReviewing = useMutation(api.reports.setReviewing);
  const resolveReport = useMutation(api.reports.resolve);

  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [selectedAction, setSelectedAction] = useState<ResolveAction>('dismiss');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (me === undefined) {
    return <div className="p-6 text-sm text-muted-foreground">{t('admin.moderation.loading')}</div>;
  }

  if (!me || me.role !== 'admin') {
    return <div className="p-6 text-sm text-muted-foreground">{t('admin.common.adminRequired')}</div>;
  }

  const handleSetReviewing = async (reportId: string) => {
    try {
      await setReviewing({ reportId: reportId as Id<'reports'> });
      toast({ title: t('admin.moderation.toasts.setReviewing') });
    } catch (error) {
      console.error(error);
      toast({ title: t('admin.moderation.toasts.setReviewingFailed'), variant: 'destructive' });
    }
  };

  const handleResolve = async () => {
    if (!selectedReportId) return;

    setIsSubmitting(true);
    try {
      await resolveReport({
        reportId: selectedReportId as Id<'reports'>,
        action: selectedAction,
        notes: notes.trim() || undefined,
      });
      toast({ title: t('admin.moderation.toasts.resolved') });
      setSelectedReportId(null);
      setNotes('');
      setSelectedAction('dismiss');
    } catch (error) {
      console.error(error);
      toast({ title: t('admin.moderation.toasts.resolveFailed'), variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const actionOptions = [
    { value: 'hide_case', label: t('admin.moderation.actions.hideCase') },
    { value: 'warn_user', label: t('admin.moderation.actions.warnUser') },
    { value: 'dismiss', label: t('admin.moderation.actions.dismiss') },
    { value: 'no_action', label: t('admin.moderation.actions.noAction') },
  ] satisfies Array<{ value: ResolveAction; label: string }>;

  return (
    <PageShell>
      <div className="container mx-auto px-4 py-4 space-y-4">
        <div>
          <h1 className="text-xl font-semibold text-foreground">{t('admin.moderation.title')}</h1>
          <p className="text-sm text-muted-foreground">{t('admin.moderation.subtitle')}</p>
        </div>

        {reports === undefined ? (
          <div className="text-sm text-muted-foreground">{t('admin.moderation.loading')}</div>
        ) : reports.length === 0 ? (
          <div className="rounded-xl border border-border p-4 text-sm text-muted-foreground">{t('admin.moderation.empty')}</div>
        ) : (
          <div className="space-y-3">
            {reports.map((report) => (
              <div key={report._id} className="rounded-2xl border border-border/60 bg-surface-elevated shadow-xs p-4 space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {report.case?.title ?? t('admin.moderation.unknownCase')}
                    </p>
                    <p className="text-xs text-muted-foreground">{t('admin.moderation.reason')}: {report.reason}</p>
                    <p className="text-xs text-muted-foreground">{t('admin.moderation.status')}: {report.status}</p>
                  </div>
                  <div className="flex gap-2">
                    {report.status === 'open' && (
                      <Button variant="outline" size="sm" onClick={() => handleSetReviewing(String(report._id))}>
                        {t('admin.moderation.setReviewing')}
                      </Button>
                    )}
                    <Button size="sm" onClick={() => setSelectedReportId(String(report._id))}>
                      {t('admin.moderation.resolve')}
                    </Button>
                  </div>
                </div>

                {report.details ? (
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{report.details}</p>
                ) : null}

                {selectedReportId === String(report._id) && (
                  <div className="rounded-lg border border-border/70 p-3 space-y-2">
                    <div className="space-y-1.5">
                      <Label htmlFor={`resolve-action-${report._id}`}>{t('admin.moderation.resolutionAction')}</Label>
                      <select
                        id={`resolve-action-${report._id}`}
                        value={selectedAction}
                        onChange={(e) => setSelectedAction(e.target.value as ResolveAction)}
                        className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                      >
                        {actionOptions.map((option) => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor={`resolve-notes-${report._id}`}>{t('admin.moderation.notesOptional')}</Label>
                      <Textarea
                        id={`resolve-notes-${report._id}`}
                        rows={3}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder={t('admin.moderation.notesPlaceholder')}
                      />
                    </div>

                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setSelectedReportId(null)} disabled={isSubmitting}>
                        {t('actions.cancel')}
                      </Button>
                      <Button onClick={handleResolve} disabled={isSubmitting}>
                        {isSubmitting ? t('admin.common.saving') : t('admin.moderation.confirmResolution')}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </PageShell>
  );
}
