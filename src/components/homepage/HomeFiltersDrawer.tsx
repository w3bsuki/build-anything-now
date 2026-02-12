import { Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { BULGARIAN_CITIES, type CityFilter } from '@/components/homepage/IntentFilterPills';

const radiusOptions = [5, 10, 25, 50] as const;

interface HomeFiltersDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  city?: CityFilter;
  onCityChange: (city: CityFilter | undefined) => void;
  cityCounts?: Record<CityFilter, number>;
  radiusKm: number;
  onRadiusChange: (radiusKm: number) => void;
  showDistance: boolean;
  onClear: () => void;
}

const cityFallbackLabels: Record<CityFilter, string> = {
  sofia: 'Sofia',
  varna: 'Varna',
  plovdiv: 'Plovdiv',
};

export function HomeFiltersDrawer({
  open,
  onOpenChange,
  city,
  onCityChange,
  cityCounts,
  radiusKm,
  onRadiusChange,
  showDistance,
  onClear,
}: HomeFiltersDrawerProps) {
  const { t } = useTranslation();

  return (
    <Drawer open={open} onOpenChange={onOpenChange} shouldScaleBackground={false}>
      <DrawerContent className="pb-[calc(env(safe-area-inset-bottom)+1rem)]">
        <DrawerHeader className="pb-2">
          <DrawerTitle className="text-center">{t('filters.title', 'Filters')}</DrawerTitle>
        </DrawerHeader>

        <div className="space-y-5 px-4">
          <section className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-foreground/70">
              {t('filters.city', 'City')}
            </p>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => onCityChange(undefined)}
                className={cn(
                  'flex h-11 w-full items-center justify-between rounded-xl border px-3 text-sm font-semibold transition-colors',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring-strong focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                  !city
                    ? 'border-primary/40 bg-primary/10 text-foreground'
                    : 'border-border/65 bg-surface-elevated text-foreground hover:bg-interactive-hover active:bg-interactive-active',
                )}
              >
                <span>{t('filters.allCities', 'All cities')}</span>
                {!city ? <Check className="size-4 text-primary" /> : null}
              </button>

              {(BULGARIAN_CITIES as readonly CityFilter[]).map((cityKey) => {
                const isSelected = city === cityKey;
                const count = cityCounts?.[cityKey] ?? 0;
                const label = t(`cities.${cityKey}`, cityFallbackLabels[cityKey]);

                return (
                  <button
                    type="button"
                    key={cityKey}
                    onClick={() => onCityChange(cityKey)}
                    className={cn(
                      'flex h-11 w-full items-center justify-between rounded-xl border px-3 text-sm font-semibold transition-colors',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring-strong focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                      isSelected
                        ? 'border-primary/40 bg-primary/10 text-foreground'
                        : 'border-border/65 bg-surface-elevated text-foreground hover:bg-interactive-hover active:bg-interactive-active',
                    )}
                  >
                    <span className="truncate">{label}</span>
                    <span className="flex items-center gap-2">
                      {typeof count === 'number' ? (
                        <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-muted px-2 text-[11px] font-semibold text-muted-foreground">
                          {count}
                        </span>
                      ) : null}
                      {isSelected ? <Check className="size-4 text-primary" /> : null}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          {showDistance ? (
            <section className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-foreground/70">
                {t('filters.distance', 'Distance')}
              </p>

              <div className="flex flex-wrap gap-2">
                {radiusOptions.map((option) => {
                  const selected = radiusKm === option;
                  return (
                    <button
                      type="button"
                      key={option}
                      onClick={() => onRadiusChange(option)}
                      className={cn(
                        'inline-flex h-11 items-center justify-center rounded-full border px-4 text-sm font-semibold transition-colors',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring-strong focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                        selected
                          ? 'border-primary/45 bg-chip-bg-active text-primary-foreground'
                          : 'border-chip-border bg-chip-bg text-foreground hover:bg-interactive-hover active:bg-interactive-active',
                      )}
                    >
                      {option}km
                    </button>
                  );
                })}
              </div>
            </section>
          ) : null}

          <section className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-foreground/70">
              {t('filters.utilities', 'Utilities')}
            </p>
            <Button type="button" variant="outline" className="h-11 w-full rounded-xl text-base" onClick={onClear}>
              {t('filters.clear', 'Clear filters')}
            </Button>
          </section>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

