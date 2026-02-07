import { Building2, ChevronDown, Heart, MapPin, Siren } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export type FilterTab = 'urgent' | 'nearby' | 'sofia' | 'varna' | 'plovdiv' | 'success';
export const BULGARIAN_CITIES = ['sofia', 'varna', 'plovdiv'] as const;
export type CityFilter = typeof BULGARIAN_CITIES[number];

interface IntentFilterPillsProps {
  selected: FilterTab;
  onSelect: (id: FilterTab) => void;
  cityCounts?: Record<CityFilter, number>;
  className?: string;
}

const cityLabels: Record<CityFilter, string> = {
  sofia: 'София',
  varna: 'Варна',
  plovdiv: 'Пловдив',
};

const primaryTabs: Array<{ id: FilterTab; label: string; icon: React.ReactNode; activeClass: string }> = [
  {
    id: 'urgent',
    label: 'Urgent',
    icon: <Siren className="w-3.5 h-3.5" />,
    activeClass: 'bg-warm-accent text-warm-accent-foreground shadow-xs',
  },
  {
    id: 'nearby',
    label: 'Near Me',
    icon: <MapPin className="w-3.5 h-3.5" />,
    activeClass: 'bg-chip-bg-active text-primary-foreground shadow-xs',
  },
  {
    id: 'sofia',
    label: cityLabels.sofia,
    icon: <Building2 className="w-3.5 h-3.5" />,
    activeClass: 'bg-chip-bg-active text-primary-foreground shadow-xs',
  },
];

const extraTabs: Array<{ id: FilterTab; icon: React.ReactNode }> = [
  { id: 'varna', icon: <Building2 className="w-3.5 h-3.5" /> },
  { id: 'plovdiv', icon: <Building2 className="w-3.5 h-3.5" /> },
  { id: 'success', icon: <Heart className="w-3.5 h-3.5" /> },
];

export function IntentFilterPills({ selected, onSelect, cityCounts, className }: IntentFilterPillsProps) {
  const { t } = useTranslation();

  const isPrimarySelected = primaryTabs.some((tab) => tab.id === selected);
  const moreLabel =
    selected === 'success'
      ? t('filters.success', 'Success')
      : selected === 'varna'
        ? cityLabels.varna
        : selected === 'plovdiv'
          ? cityLabels.plovdiv
          : t('common.more', 'More');

  return (
    <div className={cn('', className)}>
      <div className="flex items-center gap-2 overflow-x-auto pb-0.5 scrollbar-hide">
        {primaryTabs.map((tab) => {
          const isSelected = selected === tab.id;
          const label =
            tab.id === 'sofia' && cityCounts?.sofia
              ? `${cityLabels.sofia} (${cityCounts.sofia})`
              : tab.id === 'urgent'
                ? t('filters.urgent', tab.label)
                : tab.id === 'nearby'
                  ? t('filters.nearMe', tab.label)
                  : tab.label;

          return (
            <button
              type="button"
              key={tab.id}
              onClick={() => onSelect(tab.id)}
              className={cn(
                'inline-flex h-9 items-center gap-1.5 rounded-full px-3.5 text-sm font-semibold whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring-strong focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                isSelected
                  ? tab.activeClass
                  : 'bg-chip-bg text-foreground hover:bg-muted'
              )}
            >
              {tab.icon}
              {label}
            </button>
          );
        })}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className={cn(
                'inline-flex h-9 items-center gap-1.5 rounded-full px-3.5 text-sm font-semibold whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring-strong focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                !isPrimarySelected
                  ? 'bg-chip-bg-active text-primary-foreground shadow-xs'
                  : 'bg-chip-bg text-foreground hover:bg-muted'
              )}
            >
              <ChevronDown className="w-3.5 h-3.5" />
              {moreLabel}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {extraTabs.map((tab) => {
              const isSelected = selected === tab.id;
              const label =
                tab.id === 'success'
                  ? t('filters.success', 'Success')
                  : `${cityLabels[tab.id as CityFilter]}${cityCounts?.[tab.id as CityFilter] ? ` (${cityCounts[tab.id as CityFilter]})` : ''}`;

              return (
                <DropdownMenuItem
                  key={tab.id}
                  onClick={() => onSelect(tab.id)}
                  className={cn(
                    'flex items-center gap-2',
                    isSelected && 'bg-accent text-foreground'
                  )}
                >
                  {tab.icon}
                  {label}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
