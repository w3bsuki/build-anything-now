import { Siren, MapPin, Heart, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

export type FilterTab = 'urgent' | 'nearby' | 'success' | 'following';

interface IntentFilterPillsProps {
  selected: FilterTab;
  onSelect: (id: FilterTab) => void;
  followingCount?: number;
  className?: string;
}

export function IntentFilterPills({ selected, onSelect, followingCount = 0, className }: IntentFilterPillsProps) {
  const { t } = useTranslation();

  const options = [
    { 
      id: 'urgent' as FilterTab, 
      label: t('filters.urgent', 'Urgent'), 
      icon: <Siren className="w-3.5 h-3.5" />,
      activeClass: 'bg-destructive text-destructive-foreground',
    },
    { 
      id: 'nearby' as FilterTab, 
      label: t('filters.nearMe', 'Near Me'), 
      icon: <MapPin className="w-3.5 h-3.5" />,
      activeClass: 'bg-primary text-primary-foreground',
    },
    { 
      id: 'success' as FilterTab, 
      label: t('filters.successStories', 'Success Stories'), 
      icon: <Heart className="w-3.5 h-3.5" />,
      activeClass: 'bg-adopted text-adopted-foreground',
    },
    { 
      id: 'following' as FilterTab, 
      label: followingCount > 0 
        ? t('filters.followingCount', 'Following ({{count}})', { count: followingCount })
        : t('filters.following', 'Following'), 
      icon: <Users className="w-3.5 h-3.5" />,
      activeClass: 'bg-primary text-primary-foreground',
    },
  ];

  return (
    <div className={cn("px-4 pt-2 pb-2", className)}>
      <div className="flex gap-2 overflow-x-auto pb-0.5 scrollbar-hide -mx-4 px-4">
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
        {/* Right edge safe area */}
        <div className="shrink-0 w-0.5" aria-hidden="true" />
      </div>
    </div>
  );
}
