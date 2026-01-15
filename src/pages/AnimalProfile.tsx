import { useParams, Link } from 'react-router-dom';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation, useQuery } from 'convex/react';
import { ImageGallery } from '@/components/ImageGallery';
import { StatusBadge } from '@/components/StatusBadge';
import { ProgressBar } from '@/components/ProgressBar';
import { UpdatesTimeline } from '@/components/UpdatesTimeline';
import { Button } from '@/components/ui/button';
import { ShareButton } from '@/components/ShareButton';
import { ArrowLeft, MapPin, Heart, Calendar, Bookmark } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

import { api } from '../../convex/_generated/api';
import type { Id } from '../../convex/_generated/dataModel';

function normalizeLocale(locale: string) {
  return locale.trim().toLowerCase().split('-')[0];
}

const AnimalProfile = () => {
  const { t, i18n } = useTranslation();
  const { id } = useParams();
  const [isSaved, setIsSaved] = useState(false);
  const [showOriginal, setShowOriginal] = useState(false);

  const locale = i18n.language;
  const caseId = id as Id<'cases'> | undefined;
  const caseData = useQuery(api.cases.getUiForLocale, caseId ? { id: caseId, locale } : 'skip');
  const requestTranslations = useMutation(api.translate.requestCaseTranslations);

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
            <StatusBadge status={caseData.status} />
            <div className="flex items-center gap-1 text-muted-foreground text-sm">
              <MapPin className="w-3.5 h-3.5" />
              <span>{caseData.location.city}, {caseData.location.neighborhood}</span>
            </div>
            <span className="text-muted-foreground/40">•</span>
            <div className="flex items-center gap-1 text-muted-foreground text-sm">
              <Calendar className="w-3.5 h-3.5" />
              <span>{format(new Date(caseData.createdAt), 'MMM d, yyyy')}</span>
            </div>
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

      <div className="sticky-donate">
        <div>
          <div className="flex gap-2">
            <button
              onClick={() => setIsSaved(!isSaved)}
              className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors active:scale-95",
                isSaved
                  ? "bg-primary/10 text-primary"
                  : "bg-muted/50 text-foreground"
              )}
            >
              <Bookmark className={cn("w-4 h-4", isSaved && "fill-current")} />
            </button>
            <Button variant="donate" className="flex-1 h-10 text-sm">
              <Heart className="w-4 h-4 mr-2" />
              {t('actions.donateNow')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnimalProfile;
