import { useParams, Link } from 'react-router-dom';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { mockCases } from '@/data/mockData';
import { ImageGallery } from '@/components/ImageGallery';
import { StatusBadge } from '@/components/StatusBadge';
import { ProgressBar } from '@/components/ProgressBar';
import { UpdatesTimeline } from '@/components/UpdatesTimeline';
import { Button } from '@/components/ui/button';
import { ShareButton } from '@/components/ShareButton';
import { ArrowLeft, MapPin, Heart, Calendar, Bookmark } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

const AnimalProfile = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const [isSaved, setIsSaved] = useState(false);
  const caseData = mockCases.find((c) => c.id === id);

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

  return (
    <div className="min-h-screen pb-28 md:pb-8 md:pt-16">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-card/95 backdrop-blur-md border-b border-border md:hidden">
        <div className="flex items-center gap-3 h-14 px-3">
          <Link
            to="/"
            className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center active:bg-muted/80 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </Link>
          <h1 className="font-medium text-sm text-foreground truncate flex-1">
            {caseData.title}
          </h1>
          <ShareButton title={caseData.title} text={caseData.description} />
        </div>
      </div>

      <div className="container mx-auto px-4 py-5">
        <div className="max-w-2xl mx-auto">
          {/* Desktop Back Button */}
          <Link
            to="/"
            className="hidden md:inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-5 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('common.backToAllCases')}
          </Link>

          {/* Image Gallery */}
          <div className="mb-5">
            <ImageGallery images={caseData.images} alt={caseData.title} />
          </div>

          {/* Status and Location */}
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

          {/* Title */}
          <h1 className="text-xl md:text-2xl font-bold text-foreground mb-4">
            {caseData.title}
          </h1>

          {/* Progress */}
          <div className="bg-card rounded-xl border border-border p-4 mb-5">
            <ProgressBar
              current={caseData.fundraising.current}
              goal={caseData.fundraising.goal}
              currency={caseData.fundraising.currency}
              size="md"
            />
          </div>

          {/* Story */}
          <div className="mb-6">
            <h2 className="text-base font-semibold text-foreground mb-2">{t('animalProfile.theStory')}</h2>
            <div className="text-sm text-muted-foreground leading-relaxed space-y-3">
              {caseData.story.split('\n\n').map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </div>

          {/* Updates Timeline */}
          <div className="mb-6">
            <h2 className="text-base font-semibold text-foreground mb-3">{t('animalProfile.updates')}</h2>
            <UpdatesTimeline updates={caseData.updates} />
          </div>
        </div>
      </div>

      {/* Sticky Action Bar */}
      <div className="sticky-donate">
        <div className="container mx-auto max-w-2xl flex gap-2">
          <button
            onClick={() => setIsSaved(!isSaved)}
            className={cn(
              "w-12 h-12 rounded-xl border flex items-center justify-center shrink-0 transition-colors active:scale-95",
              isSaved 
                ? "bg-primary/10 border-primary text-primary" 
                : "bg-card border-border text-foreground"
            )}
          >
            <Bookmark className={cn("w-5 h-5", isSaved && "fill-current")} />
          </button>
          <Button className="flex-1 h-12 btn-donate text-base">
            <Heart className="w-5 h-5 mr-2" />
            {t('actions.donateNow')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AnimalProfile;
