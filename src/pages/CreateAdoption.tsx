import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, HeartHandshake } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { PageSection } from '@/components/layout/PageSection';
import { PageShell } from '@/components/layout/PageShell';

const CreateAdoption = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <PageShell>
      <div className="sticky top-0 z-40 border-b border-nav-border/70 bg-nav-surface/95 backdrop-blur-md md:hidden">
        <div className="flex items-center gap-3 h-14 px-3">
          <Button
            variant="outline"
            size="iconSm"
            className="rounded-xl"
            onClick={() => navigate(-1)}
            aria-label={t('actions.back', 'Back')}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="font-medium text-sm text-foreground truncate">
            {t('actions.listForAdoption', 'List for adoption')}
          </h1>
        </div>
      </div>

      <PageSection className="py-6">
        <div className="max-w-xl mx-auto">
          <div className="hidden md:flex mb-4">
            <Button variant="outline" size="sm" className="rounded-xl" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-4 h-4" />
              {t('actions.back', 'Back')}
            </Button>
          </div>

          <div className="rounded-2xl border border-border/60 bg-surface-elevated p-5 shadow-xs">
            <p className="text-xs font-semibold text-muted-foreground">
              {t('common.comingSoon', 'Coming soon')}
            </p>
            <h1 className="mt-2 font-display text-2xl font-bold text-foreground">
              {t('actions.listForAdoption', 'List for adoption')}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {t(
                'createAdoption.comingSoonBody',
                'Adoption listings are not available yet. For now, create a rescue case so the community can donate and help.',
              )}
            </p>

            <div className="mt-5 flex flex-col sm:flex-row gap-2">
              <Button className="rounded-xl" asChild>
                <Link to="/create-case">
                  <HeartHandshake className="w-4 h-4" />
                  {t('actions.reportAnimal', 'Create case')}
                </Link>
              </Button>
              <Button variant="outline" className="rounded-xl" asChild>
                <Link to="/">{t('common.goHome', 'Go to Home')}</Link>
              </Button>
            </div>
          </div>
        </div>
      </PageSection>
    </PageShell>
  );
};

export default CreateAdoption;
