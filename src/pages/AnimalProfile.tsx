import { useParams, Link } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation, useQuery } from 'convex/react';
import { ImageGallery } from '@/components/ImageGallery';
import { StatusBadge } from '@/components/StatusBadge';
import { ProgressBar } from '@/components/ProgressBar';
import { UpdatesTimeline } from '@/components/UpdatesTimeline';
import { Button } from '@/components/ui/button';
import { ShareButton } from '@/components/ShareButton';
import { CommentsSheet } from '@/components/homepage/CommentsSheet';
import { DonationFlowDrawer } from '@/components/donations/DonationFlowDrawer';
import { ArrowLeft, MapPin, Heart, Calendar, Bookmark, MessageCircle, Flag, PlusCircle, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { VerificationBadge } from '@/components/trust/VerificationBadge';
import { ReportConcernSheet } from '@/components/trust/ReportConcernSheet';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';

import { api } from '../../convex/_generated/api';
import type { Id } from '../../convex/_generated/dataModel';

function normalizeLocale(locale: string) {
  return locale.trim().toLowerCase().split('-')[0];
}

const lifecycleLabels: Record<string, string> = {
  active_treatment: 'Active Treatment',
  seeking_adoption: 'Seeking Adoption',
  closed_success: 'Closed: Success',
  closed_transferred: 'Closed: Transferred',
  closed_other: 'Closed: Other',
};

const lifecycleBadgeStyles: Record<string, string> = {
  active_treatment: 'bg-warning/10 text-warning border-warning/30',
  seeking_adoption: 'bg-primary/10 text-primary border-primary/30',
  closed_success: 'bg-success/10 text-success border-success/30',
  closed_transferred: 'bg-accent text-accent-foreground border-border/50',
  closed_other: 'bg-muted text-muted-foreground border-border',
};

const transitionOptionsByStage: Record<string, Array<{ stage: 'seeking_adoption' | 'closed_success' | 'closed_transferred' | 'closed_other'; label: string }>> = {
  active_treatment: [
    { stage: 'seeking_adoption', label: 'Move to Seeking Adoption' },
    { stage: 'closed_success', label: 'Close: Success' },
    { stage: 'closed_transferred', label: 'Close: Transferred' },
    { stage: 'closed_other', label: 'Close: Other' },
  ],
  seeking_adoption: [
    { stage: 'closed_success', label: 'Close: Adopted / Success' },
    { stage: 'closed_transferred', label: 'Close: Transferred' },
    { stage: 'closed_other', label: 'Close: Other' },
  ],
  closed_success: [],
  closed_transferred: [],
  closed_other: [],
};

const AnimalProfile = () => {
  const { t, i18n } = useTranslation();
  const { id } = useParams();
  const [isSaved, setIsSaved] = useState(false);
  const [showOriginal, setShowOriginal] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [donateOpen, setDonateOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [updateOpen, setUpdateOpen] = useState(false);
  const [updateText, setUpdateText] = useState('');
  const [updateType, setUpdateType] = useState<'medical' | 'milestone' | 'update' | 'success'>('update');
  const [evidenceType, setEvidenceType] = useState<'bill' | 'lab_result' | 'clinic_photo' | 'other' | ''>('');
  const [updateImages, setUpdateImages] = useState<File[]>([]);
  const [isSubmittingUpdate, setIsSubmittingUpdate] = useState(false);
  const [transitionOpen, setTransitionOpen] = useState(false);
  const [nextLifecycleStage, setNextLifecycleStage] = useState<'seeking_adoption' | 'closed_success' | 'closed_transferred' | 'closed_other' | ''>('');
  const [transitionNotes, setTransitionNotes] = useState('');
  const [isSubmittingTransition, setIsSubmittingTransition] = useState(false);

  const locale = i18n.language;
  const caseId = id as Id<'cases'> | undefined;
  const caseData = useQuery(api.cases.getUiForLocale, caseId ? { id: caseId, locale } : 'skip');
  const requestTranslations = useMutation(api.translate.requestCaseTranslations);
  const addUpdate = useMutation(api.cases.addUpdate);
  const updateLifecycleStage = useMutation(api.cases.updateLifecycleStage);
  const generateUploadUrl = useMutation(api.storage.generateUploadUrl);

  const transitionOptions = useMemo(() => {
    if (!caseData?.lifecycleStage) return [];
    return transitionOptionsByStage[caseData.lifecycleStage] ?? [];
  }, [caseData?.lifecycleStage]);

  const uploadImages = async (files: File[]): Promise<Id<'_storage'>[]> => {
    const uploadedIds: Id<'_storage'>[] = [];
    for (const file of files) {
      const uploadUrl = await generateUploadUrl();
      const response = await fetch(uploadUrl, {
        method: 'POST',
        headers: { 'Content-Type': file.type },
        body: file,
      });

      if (!response.ok) {
        throw new Error(`Failed to upload image: ${response.statusText}`);
      }

      const { storageId } = await response.json();
      uploadedIds.push(storageId as Id<'_storage'>);
    }

    return uploadedIds;
  };

  const resetUpdateForm = () => {
    setUpdateText('');
    setUpdateType('update');
    setEvidenceType('');
    setUpdateImages([]);
  };

  const handleSubmitUpdate = async () => {
    if (!caseId || !caseData) return;

    const text = updateText.trim();
    if (!text) {
      toast({ title: t('common.missingInfo', 'Missing info'), description: 'Update text is required.', variant: 'destructive' });
      return;
    }

    setIsSubmittingUpdate(true);
    try {
      const imageIds = updateImages.length > 0 ? await uploadImages(updateImages) : undefined;

      await addUpdate({
        caseId,
        text,
        type: updateType,
        images: imageIds,
        evidenceType: evidenceType || undefined,
        clinicId: caseData.clinicId ? (caseData.clinicId as Id<'clinics'>) : undefined,
      });

      toast({
        title: 'Update posted',
        description: 'Your case update is now visible to supporters.',
      });

      setUpdateOpen(false);
      resetUpdateForm();
    } catch (error) {
      console.error(error);
      toast({
        title: 'Failed to post update',
        description: 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmittingUpdate(false);
    }
  };

  const handleOpenTransition = () => {
    if (transitionOptions.length === 0) return;
    setNextLifecycleStage(transitionOptions[0].stage);
    setTransitionNotes('');
    setTransitionOpen(true);
  };

  const handleSubmitTransition = async () => {
    if (!caseId || !nextLifecycleStage) return;

    setIsSubmittingTransition(true);
    try {
      await updateLifecycleStage({
        caseId,
        stage: nextLifecycleStage,
        notes: transitionNotes.trim() || undefined,
      });

      toast({
        title: 'Lifecycle updated',
        description: 'Case stage changed successfully.',
      });

      setTransitionOpen(false);
      setTransitionNotes('');
    } catch (error) {
      console.error(error);
      toast({
        title: 'Failed to update lifecycle',
        description: 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmittingTransition(false);
    }
  };

  if (caseData === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-muted-foreground text-sm">{t('common.loading')}</div>
      </div>
    );
  }

  if (!caseData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">{t('common.caseNotFound')}</h1>
          <Link to="/" className="text-primary hover:underline">
            {t('common.goBackHome')}
          </Link>
        </div>
      </div>
    );
  }

  const targetLocale = normalizeLocale(locale);
  const sourceLocale = caseData.originalLanguage ? normalizeLocale(caseData.originalLanguage) : '';
  const needsTranslation = Boolean(sourceLocale && sourceLocale !== targetLocale && !caseData.isMachineTranslated);
  const isTranslating = caseData.translationStatus === 'pending';

  const displayTitle = showOriginal ? caseData.originalTitle : caseData.title;
  const displayDescription = showOriginal ? caseData.originalDescription : caseData.description;
  const displayStory = showOriginal ? caseData.originalStory : caseData.story;

  const lifecycleLabel = lifecycleLabels[caseData.lifecycleStage] ?? 'Active Treatment';

  return (
    <div className="min-h-screen pb-24 md:pb-8 md:pt-16">
      <div className="sticky top-0 z-40 bg-card/95 backdrop-blur-md md:hidden">
        <div className="flex items-center gap-3 h-14 px-3">
          <Link
            to="/"
            className="w-9 h-9 rounded-xl bg-muted/80 flex items-center justify-center active:bg-muted transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </Link>
          <h1 className="font-medium text-sm text-foreground truncate flex-1">
            {displayTitle}
          </h1>
          <button
            onClick={() => setIsSaved(!isSaved)}
            className={cn(
              'w-9 h-9 rounded-xl flex items-center justify-center transition-colors active:opacity-90',
              isSaved
                ? 'bg-primary/10 text-primary'
                : 'bg-muted/80 text-foreground'
            )}
          >
            <Bookmark className={cn('w-5 h-5', isSaved && 'fill-current')} />
          </button>
          <button
            onClick={() => setReportOpen(true)}
            className="w-9 h-9 rounded-xl bg-muted/80 flex items-center justify-center text-foreground transition-colors active:opacity-90"
            aria-label={t('report.reportConcern', 'Report concern')}
          >
            <Flag className="w-5 h-5" />
          </button>
          <ShareButton title={displayTitle} text={displayDescription} />
        </div>
      </div>

      <div className="container mx-auto px-4 py-5">
        <div className="max-w-2xl mx-auto">
          <Link
            to="/"
            className="hidden md:inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-5 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('common.backToAllCases')}
          </Link>

          <div className="mb-5">
            <ImageGallery images={caseData.images} alt={displayTitle} />
          </div>

          <div className="flex flex-wrap items-center gap-2 mb-3">
            <StatusBadge status={caseData.status} size="sm" />
            <div className={cn('text-xs px-2 py-0.5 rounded-full border', lifecycleBadgeStyles[caseData.lifecycleStage] ?? lifecycleBadgeStyles.active_treatment)}>
              {lifecycleLabel}
            </div>
            <div className="flex items-center gap-1 text-muted-foreground text-sm">
              <MapPin className="w-3.5 h-3.5" />
              <span>{caseData.location.city}, {caseData.location.neighborhood}</span>
            </div>
            <span className="text-muted-foreground/40">•</span>
            <div className="flex items-center gap-1 text-muted-foreground text-sm">
              <Calendar className="w-3.5 h-3.5" />
              <span>{format(new Date(caseData.createdAt), 'MMM d, yyyy')}</span>
            </div>
            <span className="text-muted-foreground/40">•</span>
            <VerificationBadge status={caseData.verificationStatus ?? 'unverified'} showExplainer />
          </div>

          {caseData.isMachineTranslated && caseData.translatedFrom && (
            <div className="mb-3 flex items-center justify-between gap-3 bg-muted/40 border border-border rounded-lg px-3 py-2">
              <div className="text-xs text-muted-foreground">
                {t('contentTranslation.machineTranslatedFrom', { from: caseData.translatedFrom.toUpperCase() })}
              </div>
              <Button
                variant="outline"
                className="h-7 px-2.5 text-xs"
                onClick={() => setShowOriginal((v) => !v)}
              >
                {showOriginal ? t('contentTranslation.viewTranslated') : t('contentTranslation.viewOriginal')}
              </Button>
            </div>
          )}

          {!caseData.isMachineTranslated && needsTranslation && (
            <div className="mb-3 flex items-center justify-between gap-3 bg-muted/40 border border-border rounded-lg px-3 py-2">
              <div className="text-xs text-muted-foreground">
                {isTranslating ? t('contentTranslation.translating') : t('contentTranslation.translatePrompt')}
              </div>
              <Button
                variant="outline"
                className="h-7 px-2.5 text-xs"
                disabled={isTranslating}
                onClick={async () => {
                  await requestTranslations({ caseId: caseData.id, targetLocales: [targetLocale] });
                }}
              >
                {isTranslating ? t('contentTranslation.translatingCta') : t('contentTranslation.translate')}
              </Button>
            </div>
          )}

          <h1 className="text-xl md:text-2xl font-bold text-foreground mb-4">
            {displayTitle}
          </h1>

          <div className="bg-card rounded-xl border border-border p-4 mb-5">
            <ProgressBar
              current={caseData.fundraising.current}
              goal={caseData.fundraising.goal}
              currency={caseData.fundraising.currency}
              size="md"
            />
          </div>

          {caseData.canManageCase && (
            <div className="bg-card rounded-xl border border-border p-4 mb-5 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-sm font-semibold text-foreground">Case Management</h2>
                  <p className="text-xs text-muted-foreground">Post progress evidence and move the lifecycle stage.</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="h-9 text-xs" onClick={() => setUpdateOpen(true)}>
                    <PlusCircle className="w-4 h-4 mr-1" />
                    Add Update
                  </Button>
                  {transitionOptions.length > 0 && (
                    <Button className="h-9 text-xs" onClick={handleOpenTransition}>
                      <RefreshCw className="w-4 h-4 mr-1" />
                      Update Stage
                    </Button>
                  )}
                </div>
              </div>
              {caseData.closedAt && (
                <p className="text-xs text-muted-foreground">
                  Closed on {format(new Date(caseData.closedAt), 'MMM d, yyyy')}
                  {caseData.closedReason ? ` (${caseData.closedReason})` : ''}
                </p>
              )}
            </div>
          )}

          <div className="mb-6">
            <h2 className="text-base font-semibold text-foreground mb-2">{t('animalProfile.theStory')}</h2>
            <div className="text-sm text-muted-foreground leading-relaxed space-y-3">
              {displayStory.split('\n\n').map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-base font-semibold text-foreground mb-3">{t('animalProfile.updates')}</h2>
            <UpdatesTimeline updates={caseData.updates} />
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-50 pb-[env(safe-area-inset-bottom)]">
        <div className="mx-auto w-full max-w-md px-4 pb-2">
          <div className="flex items-center gap-2 rounded-2xl border border-border/70 bg-background/95 px-3 py-2.5 shadow-lg backdrop-blur-xl">
            <Button
              variant="secondary"
              className="h-10 px-4 rounded-xl"
              onClick={() => setCommentsOpen(true)}
            >
              <MessageCircle className="w-4 h-4 mr-1.5" />
              Chat
            </Button>

            <Button
              className="flex-1 h-10 rounded-xl font-semibold"
              onClick={() => setDonateOpen(true)}
              disabled={!caseData.isDonationAllowed}
            >
              <Heart className="w-4 h-4 mr-1.5 fill-current" />
              {caseData.isDonationAllowed ? t('actions.donateNow') : 'Donations Closed'}
            </Button>
          </div>
          {!caseData.isDonationAllowed && (
            <p className="mt-1 text-[11px] text-center text-muted-foreground">
              Donations are currently disabled for this case due to lifecycle or trust gating.
            </p>
          )}
        </div>
      </div>

      {caseId && (
        <CommentsSheet
          isOpen={commentsOpen}
          onClose={() => setCommentsOpen(false)}
          caseId={caseId}
          caseTitle={caseData?.title || ''}
        />
      )}

      <DonationFlowDrawer
        open={donateOpen}
        onOpenChange={setDonateOpen}
        caseId={caseData.id}
        caseTitle={displayTitle}
        caseCoverImage={caseData.images?.[0]}
        currency={caseData.fundraising.currency}
      />

      <ReportConcernSheet
        open={reportOpen}
        onOpenChange={setReportOpen}
        caseId={caseData.id}
        caseTitle={displayTitle}
      />

      <Dialog open={updateOpen} onOpenChange={setUpdateOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Case Update</DialogTitle>
            <DialogDescription>
              Share progress with supporters and include evidence when available.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="update-type">Update type</Label>
              <select
                id="update-type"
                value={updateType}
                onChange={(e) => setUpdateType(e.target.value as typeof updateType)}
                className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="update">General update</option>
                <option value="medical">Medical update</option>
                <option value="milestone">Milestone</option>
                <option value="success">Success</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="evidence-type">Evidence type (optional)</Label>
              <select
                id="evidence-type"
                value={evidenceType}
                onChange={(e) => setEvidenceType(e.target.value as typeof evidenceType)}
                className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="">None</option>
                <option value="bill">Bill</option>
                <option value="lab_result">Lab result</option>
                <option value="clinic_photo">Clinic photo</option>
                <option value="other">Other evidence</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="update-text">Update details</Label>
              <Textarea
                id="update-text"
                value={updateText}
                onChange={(e) => setUpdateText(e.target.value)}
                placeholder="What changed since the last update?"
                rows={5}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="update-images">Evidence images (optional)</Label>
              <Input
                id="update-images"
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => setUpdateImages(Array.from(e.target.files ?? []))}
              />
              {updateImages.length > 0 && (
                <p className="text-xs text-muted-foreground">{updateImages.length} file(s) selected</p>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setUpdateOpen(false)} disabled={isSubmittingUpdate}>
                Cancel
              </Button>
              <Button onClick={handleSubmitUpdate} disabled={isSubmittingUpdate}>
                {isSubmittingUpdate ? 'Posting...' : 'Post Update'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={transitionOpen} onOpenChange={setTransitionOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Update Lifecycle Stage</DialogTitle>
            <DialogDescription>
              Move this case through rescue stages with a transparent timeline event.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="next-stage">Next stage</Label>
              <select
                id="next-stage"
                value={nextLifecycleStage}
                onChange={(e) => setNextLifecycleStage(e.target.value as typeof nextLifecycleStage)}
                className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
              >
                {transitionOptions.map((opt) => (
                  <option key={opt.stage} value={opt.stage}>{opt.label}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="transition-notes">Notes (optional)</Label>
              <Textarea
                id="transition-notes"
                value={transitionNotes}
                onChange={(e) => setTransitionNotes(e.target.value)}
                placeholder="Add context for supporters..."
                rows={4}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setTransitionOpen(false)} disabled={isSubmittingTransition}>
                Cancel
              </Button>
              <Button onClick={handleSubmitTransition} disabled={isSubmittingTransition || !nextLifecycleStage}>
                {isSubmittingTransition ? 'Saving...' : 'Save Stage'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AnimalProfile;
