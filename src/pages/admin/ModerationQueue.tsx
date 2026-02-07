import { useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import type { Id } from '../../../convex/_generated/dataModel';

const actionOptions = [
  { value: 'hide_case', label: 'Hide Case' },
  { value: 'warn_user', label: 'Warn User' },
  { value: 'dismiss', label: 'Dismiss' },
  { value: 'no_action', label: 'No Action' },
] as const;

type ResolveAction = (typeof actionOptions)[number]['value'];

export default function ModerationQueue() {
  const me = useQuery(api.users.me);
  const reports = useQuery(api.reports.listPending, me?.role === 'admin' ? {} : 'skip');
  const setReviewing = useMutation(api.reports.setReviewing);
  const resolveReport = useMutation(api.reports.resolve);

  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [selectedAction, setSelectedAction] = useState<ResolveAction>('dismiss');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (me === undefined) {
    return <div className="p-6 text-sm text-muted-foreground">Loading moderation queue...</div>;
  }

  if (!me || me.role !== 'admin') {
    return <div className="p-6 text-sm text-muted-foreground">Admin access required.</div>;
  }

  const handleSetReviewing = async (reportId: string) => {
    try {
      await setReviewing({ reportId: reportId as Id<'reports'> });
      toast({ title: 'Report marked as reviewing' });
    } catch (error) {
      console.error(error);
      toast({ title: 'Failed to update report', variant: 'destructive' });
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
      toast({ title: 'Report resolved' });
      setSelectedReportId(null);
      setNotes('');
      setSelectedAction('dismiss');
    } catch (error) {
      console.error(error);
      toast({ title: 'Failed to resolve report', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background md:pt-16 pb-24 md:pb-10">
      <div className="container mx-auto px-4 py-4 space-y-4">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Moderation Queue</h1>
          <p className="text-sm text-muted-foreground">Review pending trust reports and apply resolution actions.</p>
        </div>

        {reports === undefined ? (
          <div className="text-sm text-muted-foreground">Loading reports...</div>
        ) : reports.length === 0 ? (
          <div className="rounded-xl border border-border p-4 text-sm text-muted-foreground">No pending reports.</div>
        ) : (
          <div className="space-y-3">
            {reports.map((report) => (
              <div key={report._id} className="rounded-xl border border-border bg-card p-4 space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {report.case?.title ?? 'Unknown case'}
                    </p>
                    <p className="text-xs text-muted-foreground">Reason: {report.reason}</p>
                    <p className="text-xs text-muted-foreground">Status: {report.status}</p>
                  </div>
                  <div className="flex gap-2">
                    {report.status === 'open' && (
                      <Button variant="outline" size="sm" onClick={() => handleSetReviewing(String(report._id))}>
                        Set Reviewing
                      </Button>
                    )}
                    <Button size="sm" onClick={() => setSelectedReportId(String(report._id))}>
                      Resolve
                    </Button>
                  </div>
                </div>

                {report.details ? (
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{report.details}</p>
                ) : null}

                {selectedReportId === String(report._id) && (
                  <div className="rounded-lg border border-border/70 p-3 space-y-2">
                    <div className="space-y-1.5">
                      <Label htmlFor={`resolve-action-${report._id}`}>Resolution action</Label>
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
                      <Label htmlFor={`resolve-notes-${report._id}`}>Notes (optional)</Label>
                      <Textarea
                        id={`resolve-notes-${report._id}`}
                        rows={3}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Add resolution context..."
                      />
                    </div>

                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setSelectedReportId(null)} disabled={isSubmitting}>
                        Cancel
                      </Button>
                      <Button onClick={handleResolve} disabled={isSubmitting}>
                        {isSubmitting ? 'Saving...' : 'Confirm Resolution'}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
