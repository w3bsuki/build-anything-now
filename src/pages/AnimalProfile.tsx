import { useParams, Link } from 'react-router-dom';
import { mockCases } from '@/data/mockData';
import { ImageGallery } from '@/components/ImageGallery';
import { StatusBadge } from '@/components/StatusBadge';
import { ProgressBar } from '@/components/ProgressBar';
import { UpdatesTimeline } from '@/components/UpdatesTimeline';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MapPin, Share2, Heart, Calendar } from 'lucide-react';
import { format } from 'date-fns';

const AnimalProfile = () => {
  const { id } = useParams();
  const caseData = mockCases.find((c) => c.id === id);

  if (!caseData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Case not found</h1>
          <Link to="/" className="text-primary hover:underline">
            Go back home
          </Link>
        </div>
      </div>
    );
  }

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: caseData.title,
        text: caseData.description,
        url: window.location.href,
      });
    }
  };

  return (
    <div className="min-h-screen pb-32 md:pb-8 md:pt-20">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-card/95 backdrop-blur-lg border-b border-border md:hidden">
        <div className="flex items-center gap-3 px-4 py-3">
          <Link
            to="/"
            className="w-10 h-10 rounded-full bg-muted flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </Link>
          <h1 className="font-semibold text-foreground truncate flex-1">
            {caseData.title}
          </h1>
          <button
            onClick={handleShare}
            className="w-10 h-10 rounded-full bg-muted flex items-center justify-center"
          >
            <Share2 className="w-5 h-5 text-foreground" />
          </button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="max-w-3xl mx-auto">
          {/* Desktop Back Button */}
          <Link
            to="/"
            className="hidden md:inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to all cases
          </Link>

          {/* Image Gallery */}
          <div className="mb-6">
            <ImageGallery images={caseData.images} alt={caseData.title} />
          </div>

          {/* Status and Location */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <StatusBadge status={caseData.status} />
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <MapPin className="w-4 h-4" />
              <span className="text-sm">
                {caseData.location.city}, {caseData.location.neighborhood}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span className="text-sm">
                {format(new Date(caseData.createdAt), 'MMM d, yyyy')}
              </span>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
            {caseData.title}
          </h1>

          {/* Progress */}
          <div className="bg-card rounded-2xl p-5 shadow-card mb-6">
            <ProgressBar
              current={caseData.fundraising.current}
              goal={caseData.fundraising.goal}
              currency={caseData.fundraising.currency}
              size="lg"
            />
          </div>

          {/* Story */}
          <div className="mb-8">
            <h2 className="text-lg font-bold text-foreground mb-3">The Story</h2>
            <div className="prose prose-sm text-muted-foreground">
              {caseData.story.split('\n\n').map((paragraph, index) => (
                <p key={index} className="mb-4 last:mb-0 leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>

          {/* Updates Timeline */}
          <div className="mb-8">
            <h2 className="text-lg font-bold text-foreground mb-4">Updates</h2>
            <UpdatesTimeline updates={caseData.updates} />
          </div>
        </div>
      </div>

      {/* Sticky Donate Button */}
      <div className="sticky-donate">
        <div className="container mx-auto max-w-3xl flex gap-3">
          <button
            onClick={handleShare}
            className="w-14 h-14 rounded-full bg-card border border-border flex items-center justify-center shrink-0 shadow-lg"
          >
            <Share2 className="w-5 h-5 text-foreground" />
          </button>
          <Button className="flex-1 h-14 btn-donate text-lg">
            <Heart className="w-5 h-5 mr-2" />
            Donate Now
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AnimalProfile;
