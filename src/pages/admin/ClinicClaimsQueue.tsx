import { useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { useTranslation } from 'react-i18next';
import { api } from '../../../convex/_generated/api';
import type { Id } from '../../../convex/_generated/dataModel';
import { PageShell } from '@/components/layout/PageShell';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';

export default function ClinicClaimsQueue() {
  const { t, i18n } = useTranslation();
  const me = useQuery(api.users.me);
  const claims = useQuery(api.clinics.listPendingClaims, me?.role === 'admin' ? {} : 'skip');
  const reviewClaim = useMutation(api.clinics.reviewClaim);

  const [rejectingClaimId, setRejectingClaimId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formatTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);

    if (seconds < 60) return t('time.justNow');
    if (seconds < 3600) return t('time.minutesAgo', { count: Math.floor(seconds / 60) });
    if (seconds < 86400) return t('time.hoursAgo', { count: Math.floor(seconds / 3600) });
    if (seconds < 604800) return t('time.daysAgo', { count: Math.floor(seconds / 86400) });

    return new Date(timestamp).toLocaleDateString(i18n.language, {
      month: 'short',
      day: 'numeric',
    });
  };

  if (me === undefined) {
    return <div className="p-6 text-sm text-muted-foreground">{t('admin.clinicClaims.loading')}</div>;
  }

  if (!me || me.role !== 'admin') {
    return <div className="p-6 text-sm text-muted-foreground">{t('admin.common.adminRequired')}</div>;
  }

  const handleApprove = async (claimId: string) => {
    setIsSubmitting(true);
    try {
      await reviewClaim({
        claimId: claimId as Id<'clinicClaims'>,
        action: 'approve',
      });
      toast({ title: t('admin.clinicClaims.toasts.approved') });
    } catch (error) {
      console.error(error);
      toast({ title: t('admin.clinicClaims.toasts.approveFailed'), variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!rejectingClaimId) return;

    setIsSubmitting(true);
    try {
      await reviewClaim({
        claimId: rejectingClaimId as Id<'clinicClaims'>,
        action: 'reject',
        rejectionReason: rejectReason.trim() || undefined,
      });
      toast({ title: t('admin.clinicClaims.toasts.rejected') });
      setRejectingClaimId(null);
      setRejectReason('');
    } catch (error) {
      console.error(error);
      toast({ title: t('admin.clinicClaims.toasts.rejectFailed'), variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const claimCount = claims?.length ?? 0;
  const oldestCreatedAt = claimCount > 0 ? Math.min(...(claims ?? []).map((claim) => claim.createdAt)) : null;

  return (
    <PageShell>
      <div className="container mx-auto px-4 py-4 space-y-4">
        <div>
          <h1 className="text-xl font-semibold text-foreground">{t('admin.clinicClaims.title')}</h1>
          <p className="text-sm text-muted-foreground">{t('admin.clinicClaims.subtitle')}</p>
          {oldestCreatedAt ? (
            <p className="text-xs text-muted-foreground mt-1">
              {t('admin.clinicClaims.stats', {
                count: claimCount,
                oldest: formatTimeAgo(oldestCreatedAt),
              })}
            </p>
          ) : null}
        </div>

        {claims === undefined ? (
          <div className="text-sm text-muted-foreground">{t('admin.clinicClaims.loading')}</div>
        ) : claims.length === 0 ? (
          <div className="rounded-xl border border-border p-4 text-sm text-muted-foreground">{t('admin.clinicClaims.empty')}</div>
        ) : (
          <div className="space-y-3">
            {claims.map((claim) => (
              <div key={claim._id} className="rounded-2xl border border-border/60 bg-surface-elevated shadow-xs p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-foreground">{claim.clinic?.name ?? t('common.notAvailable')}</p>
                    <p className="text-xs text-muted-foreground">
                      {claim.clinic?.city ?? t('common.notAvailable')} · {claim.clinic?.address ?? t('common.notAvailable')}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {t('admin.clinicClaims.claimant')}: {claim.claimant?.name ?? t('common.anonymous')} ({claim.claimerRole})
                    </p>
                    <p className="text-xs text-muted-foreground">{t('admin.clinicClaims.submitted', { time: formatTimeAgo(claim.createdAt) })}</p>
                    <p className="text-xs text-muted-foreground">{t('admin.clinicClaims.email')}: {claim.claimerEmail}</p>
                    {claim.claimerPhone ? (
                      <p className="text-xs text-muted-foreground">{t('admin.clinicClaims.phone')}: {claim.claimerPhone}</p>
                    ) : null}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleApprove(String(claim._id))}
                      disabled={isSubmitting}
                    >
                      {t('admin.common.approve')}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setRejectingClaimId(String(claim._id));
                        setRejectReason('');
                      }}
                      disabled={isSubmitting}
                    >
                      {t('admin.common.reject')}
                    </Button>
                  </div>
                </div>

                {claim.additionalInfo ? (
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{claim.additionalInfo}</p>
                ) : null}

                {rejectingClaimId === String(claim._id) && (
                  <div className="rounded-lg border border-border/70 p-3 space-y-2">
                    <div className="space-y-1.5">
                      <Label htmlFor={`reject-reason-${claim._id}`}>{t('admin.clinicClaims.rejectionReason')}</Label>
                      <Textarea
                        id={`reject-reason-${claim._id}`}
                        rows={3}
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        placeholder={t('admin.clinicClaims.rejectionReasonPlaceholder')}
                      />
                    </div>

                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setRejectingClaimId(null);
                          setRejectReason('');
                        }}
                        disabled={isSubmitting}
                      >
                        {t('actions.cancel')}
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={handleReject}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? t('admin.common.rejecting') : t('admin.clinicClaims.confirmRejection')}
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
