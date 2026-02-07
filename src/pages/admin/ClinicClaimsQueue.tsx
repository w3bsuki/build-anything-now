import { useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import type { Id } from '../../../convex/_generated/dataModel';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';

export default function ClinicClaimsQueue() {
  const me = useQuery(api.users.me);
  const claims = useQuery(api.clinics.listPendingClaims, me?.role === 'admin' ? {} : 'skip');
  const reviewClaim = useMutation(api.clinics.reviewClaim);

  const [rejectingClaimId, setRejectingClaimId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (me === undefined) {
    return <div className="p-6 text-sm text-muted-foreground">Loading clinic claim queue...</div>;
  }

  if (!me || me.role !== 'admin') {
    return <div className="p-6 text-sm text-muted-foreground">Admin access required.</div>;
  }

  const handleApprove = async (claimId: string) => {
    setIsSubmitting(true);
    try {
      await reviewClaim({
        claimId: claimId as Id<'clinicClaims'>,
        action: 'approve',
      });
      toast({ title: 'Claim approved' });
    } catch (error) {
      console.error(error);
      toast({ title: 'Failed to approve claim', variant: 'destructive' });
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
      toast({ title: 'Claim rejected' });
      setRejectingClaimId(null);
      setRejectReason('');
    } catch (error) {
      console.error(error);
      toast({ title: 'Failed to reject claim', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background md:pt-16 pb-24 md:pb-10">
      <div className="container mx-auto px-4 py-4 space-y-4">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Clinic Claim Queue</h1>
          <p className="text-sm text-muted-foreground">Review pending ownership claims for pre-seeded clinics.</p>
        </div>

        {claims === undefined ? (
          <div className="text-sm text-muted-foreground">Loading claims...</div>
        ) : claims.length === 0 ? (
          <div className="rounded-xl border border-border p-4 text-sm text-muted-foreground">No pending claims.</div>
        ) : (
          <div className="space-y-3">
            {claims.map((claim) => (
              <div key={claim._id} className="rounded-xl border border-border bg-card p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-foreground">{claim.clinic?.name ?? 'Unknown clinic'}</p>
                    <p className="text-xs text-muted-foreground">
                      {claim.clinic?.city ?? 'Unknown city'} · {claim.clinic?.address ?? 'No address'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Claimant: {claim.claimant?.name ?? 'Unknown'} ({claim.claimerRole})
                    </p>
                    <p className="text-xs text-muted-foreground">Email: {claim.claimerEmail}</p>
                    {claim.claimerPhone ? (
                      <p className="text-xs text-muted-foreground">Phone: {claim.claimerPhone}</p>
                    ) : null}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleApprove(String(claim._id))}
                      disabled={isSubmitting}
                    >
                      Approve
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
                      Reject
                    </Button>
                  </div>
                </div>

                {claim.additionalInfo ? (
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{claim.additionalInfo}</p>
                ) : null}

                {rejectingClaimId === String(claim._id) && (
                  <div className="rounded-lg border border-border/70 p-3 space-y-2">
                    <div className="space-y-1.5">
                      <Label htmlFor={`reject-reason-${claim._id}`}>Rejection reason</Label>
                      <Textarea
                        id={`reject-reason-${claim._id}`}
                        rows={3}
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        placeholder="Provide a clear reason for the rejection..."
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
                        Cancel
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={handleReject}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? 'Rejecting...' : 'Confirm Rejection'}
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
