import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { SignedIn, SignedOut } from '@clerk/clerk-react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Camera, Loader2, Sparkles, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

type Urgency = 'critical' | 'urgent' | 'recovering';

const SUGGESTIONS = [
  {
    urgency: 'critical' as const,
    title: 'Injured cat needs urgent surgery',
    description: 'Found on the street with an injured leg. Needs immediate vet care and surgery.',
    goal: 800,
  },
  {
    urgency: 'urgent' as const,
    title: 'Stray dog needs treatment and safe shelter',
    description: 'Friendly dog with visible skin issues. Needs treatment, vaccines, and temporary shelter.',
    goal: 350,
  },
  {
    urgency: 'recovering' as const,
    title: 'Recovery support for rescued kitten',
    description: 'Recovering after clinic visit. Needs food, medication, and follow-up checks.',
    goal: 200,
  },
];

const CreateCaseAi = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isReady, setIsReady] = useState(false);

  const [urgency, setUrgency] = useState<Urgency>('urgent');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [goal, setGoal] = useState<number>(250);
  const currency = 'EUR';

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const suggestion = useMemo(() => {
    if (!file) return SUGGESTIONS[1];
    const idx = Math.abs((file.name || '').split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0)) % SUGGESTIONS.length;
    return SUGGESTIONS[idx];
  }, [file]);

  const generate = async () => {
    if (!file) {
      toast({
        title: t('common.error', 'Error'),
        description: t('createAi.uploadFirst', 'Add a photo first to generate details.'),
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);
    try {
      await new Promise((r) => setTimeout(r, 2000));
      setUrgency(suggestion.urgency);
      setTitle(suggestion.title);
      setDescription(suggestion.description);
      setGoal(suggestion.goal);
      toast({
        title: t('createAi.generated', 'Draft created'),
        description: t('createAi.review', 'Review and edit before publishing.'),
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const publish = () => {
    setIsReady(true);
  };

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-8 md:pt-16">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-nav-surface/95 backdrop-blur-md border-b border-nav-border/70 md:hidden">
        <div className="flex items-center gap-3 h-14 px-3">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center active:bg-muted/80 transition-colors"
            aria-label={t('common.back', 'Back')}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-semibold text-foreground truncate">
            {t('createAi.title', 'List with AI')}
          </h1>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="max-w-lg mx-auto space-y-5">
          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-foreground">
                  {t('createAi.previewTitle', 'AI Preview (demo)')}
                </p>
                <p className="text-sm text-muted-foreground">
                  {t(
                    'createAi.previewBody',
                    'This is a demonstration of the AI-assisted listing flow. You’ll always review before publishing.'
                  )}
                </p>
              </div>
              <span className="shrink-0 rounded-full bg-foreground/10 px-2 py-0.5 text-[11px] font-semibold text-foreground/80">
                {t('common.preview', 'Preview')}
              </span>
            </div>
          </div>

          {isReady ? (
            <>
              <div className="rounded-2xl border border-border/60 bg-surface-elevated shadow-xs p-4">
                <p className="font-semibold text-foreground">
                  {t('createAi.readyTitle', 'Draft ready')}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {t(
                    'createAi.readyBody',
                    'Publishing with AI review ships in the MVP. For now, this flow is a demo and publishing is gated.'
                  )}
                </p>
              </div>

              <div className="rounded-2xl border border-border/60 bg-surface-elevated shadow-xs p-4 space-y-3">
                <p className="font-semibold text-foreground">{t('createAi.draft', 'Draft')}</p>
                {previewUrl ? (
                  <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-border bg-muted/30">
                    <img src={previewUrl} alt="" className="w-full h-full object-cover" />
                    <div className="absolute left-2 top-2 rounded-md bg-foreground/70 px-2 py-1 text-[11px] font-semibold text-background">
                      {t('createAi.previewWatermark', 'AI Preview')}
                    </div>
                  </div>
                ) : null}
                <div className="text-sm text-muted-foreground space-y-1">
                  <p><strong>{t('createAi.urgency', 'Urgency')}:</strong> {t(`createCase.${urgency}`, urgency)}</p>
                  <p><strong>{t('createAi.caseTitle', 'Title')}:</strong> {title || t('createCase.notSet', 'Not set')}</p>
                  <p><strong>{t('createAi.shortDesc', 'Short description')}:</strong> {description || t('createCase.notSet', 'Not set')}</p>
                  <p><strong>{t('createAi.goal', 'Suggested goal')}:</strong> {goal} {currency}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <Button variant="outline" className="h-11 rounded-xl" onClick={() => setIsReady(false)}>
                  {t('createAi.editDraft', 'Edit draft')}
                </Button>
                <Button className="h-11 rounded-xl font-semibold" onClick={() => navigate('/')}>
                  {t('createAi.backToFeed', 'Back to feed')}
                </Button>
              </div>
            </>
          ) : (
            <>

          {/* Photo */}
          <div className="rounded-2xl border border-border/60 bg-surface-elevated shadow-xs p-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="font-semibold text-foreground">{t('createAi.photo', 'Photo')}</p>
              <Label
                htmlFor="ai-photo"
                className="inline-flex items-center gap-2 text-sm font-semibold text-primary cursor-pointer"
              >
                <Camera className="w-4 h-4" />
                {t('createAi.addPhoto', 'Add photo')}
              </Label>
              <Input
                id="ai-photo"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
            </div>

            <div className={cn(
              'rounded-xl border border-dashed border-border bg-muted/30 overflow-hidden',
              previewUrl ? 'aspect-[4/3]' : 'py-10'
            )}>
              {previewUrl ? (
                <div className="relative w-full h-full">
                  <img src={previewUrl} alt="" className="w-full h-full object-cover" />
                  <div className="absolute left-2 top-2 rounded-md bg-foreground/70 px-2 py-1 text-[11px] font-semibold text-background">
                    {t('createAi.previewWatermark', 'AI Preview')}
                  </div>
                </div>
              ) : (
                <div className="text-center text-sm text-muted-foreground">
                  {t('createAi.photoHint', 'Add a photo to generate a draft.')}
                </div>
              )}
            </div>

            <Button
              className="w-full h-11 rounded-xl font-semibold"
              onClick={generate}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t('createAi.generating', 'Generating…')}
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  {t('createAi.generate', 'Generate details')}
                </>
              )}
            </Button>
          </div>

          {/* Draft */}
          <div className="rounded-2xl border border-border/60 bg-surface-elevated shadow-xs p-4 space-y-4">
            <p className="font-semibold text-foreground">{t('createAi.draft', 'Draft')}</p>

            <div className="grid grid-cols-3 gap-2">
              {(['critical', 'urgent', 'recovering'] as const).map((u) => (
                <button
                  key={u}
                  onClick={() => setUrgency(u)}
                  className={cn(
                    'h-10 rounded-xl border text-sm font-semibold transition-colors',
                    urgency === u ? 'border-primary bg-primary/10 text-primary' : 'border-border hover:bg-muted/40'
                  )}
                >
                  {t(`createCase.${u}`, u)}
                </button>
              ))}
            </div>

            <div className="space-y-2">
              <Label htmlFor="ai-title">{t('createAi.caseTitle', 'Title')}</Label>
              <Input
                id="ai-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t('createAi.titlePlaceholder', 'e.g., Injured cat needs urgent surgery')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ai-desc">{t('createAi.shortDesc', 'Short description')}</Label>
              <Textarea
                id="ai-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t('createAi.descPlaceholder', 'What happened and what help is needed?')}
                rows={4}
                className="resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ai-goal">{t('createAi.goal', 'Suggested goal')}</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="ai-goal"
                  value={String(goal)}
                  onChange={(e) => setGoal(Number(e.target.value.replace(/[^\d]/g, '')) || 0)}
                  inputMode="numeric"
                />
                <div className="px-3 h-10 rounded-xl bg-muted flex items-center text-sm text-muted-foreground">
                  {currency}
                </div>
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" />
                {t('createAi.safety', 'This is a preview. You control what gets published.')}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <Button
                variant="outline"
                className="h-11 rounded-xl"
                asChild
              >
                <Link to="/create-case">
                  {t('createAi.openFullForm', 'Open full form')}
                </Link>
              </Button>

              <SignedOut>
                <Button className="h-11 rounded-xl font-semibold" asChild>
                  <Link to="/sign-in">
                    {t('createAi.signInToPublish', 'Sign in to publish')}
                  </Link>
                </Button>
              </SignedOut>
              <SignedIn>
                <Button
                  className="h-11 rounded-xl font-semibold"
                  onClick={publish}
                >
                  {t('createAi.publish', 'Publish')}
                </Button>
              </SignedIn>
            </div>
          </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateCaseAi;
