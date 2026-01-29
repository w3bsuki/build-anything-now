import { Siren, MapPin, Heart, Building2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

export type FilterTab = 'urgent' | 'nearby' | 'sofia' | 'varna' | 'plovdiv' | 'success';

// Bulgarian cities with case counts (will be dynamic later)
export const BULGARIAN_CITIES = ['sofia', 'varna', 'plovdiv'] as const;
export type CityFilter = typeof BULGARIAN_CITIES[number];

interface IntentFilterPillsProps {
  selected: FilterTab;
  onSelect: (id: FilterTab) => void;
  cityCounts?: Record<CityFilter, number>;
  className?: string;
}

export function IntentFilterPills({ selected, onSelect, cityCounts, className }: IntentFilterPillsProps) {
  const { t } = useTranslation();

  // City labels in Bulgarian
  const cityLabels: Record<CityFilter, string> = {
    sofia: 'София',
    varna: 'Варна',
    plovdiv: 'Пловдив',
  };

  const options = [
    { 
      id: 'urgent' as FilterTab, 
      label: t('filters.urgent', 'Urgent'), 
      icon: <Siren className="w-3.5 h-3.5" />,
      activeClass: 'bg-warm-accent text-warm-accent-foreground',
    },
    { 
      id: 'nearby' as FilterTab, 
      label: t('filters.nearMe', 'Near Me'), 
      icon: <MapPin className="w-3.5 h-3.5" />,
      activeClass: 'bg-primary text-primary-foreground',
    },
    // Dynamic city pills
    ...BULGARIAN_CITIES.map(city => ({
      id: city as FilterTab,
      label: cityCounts?.[city] 
        ? `${cityLabels[city]} (${cityCounts[city]})`
        : cityLabels[city],
      icon: <Building2 className="w-3.5 h-3.5" />,
      activeClass: 'bg-primary text-primary-foreground',
    })),
    { 
      id: 'success' as FilterTab, 
      label: t('filters.success', 'Success'), 
      icon: <Heart className="w-3.5 h-3.5" />,
      activeClass: 'bg-adopted text-adopted-foreground',
    },
  ];

  return (
    <div className={cn("", className)}>
      <div className="flex gap-2 overflow-x-auto pb-0.5 scrollbar-hide">
        {options.map((option) => {
          const isSelected = selected === option.id;
          return (
            <button
              key={option.id}
              onClick={() => onSelect(option.id)}
              className={cn(
                "flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all active:scale-95",
                isSelected
                  ? option.activeClass
                  : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
              )}
            >
              {option.icon}
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
