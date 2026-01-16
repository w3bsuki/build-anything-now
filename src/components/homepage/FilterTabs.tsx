import { cn } from '@/lib/utils';

export interface FilterOption {
  id: string;
  label: string;
  icon?: string;
}

interface FilterTabsProps {
  options: FilterOption[];
  selected: string;
  onSelect: (id: string) => void;
  className?: string;
}

export function FilterTabs({
  options,
  selected,
  onSelect,
  className,
}: FilterTabsProps) {
  return (
    <div className={cn('overflow-x-auto scrollbar-hide border-b border-border/50', className)}>
      <div className="flex px-4">
        {options.map((option) => {
          const isSelected = selected === option.id;
          return (
            <button
              key={option.id}
              onClick={() => onSelect(option.id)}
              className={cn(
                'relative flex items-center gap-1.5 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors',
                isSelected
                  ? 'text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {option.icon && <span>{option.icon}</span>}
              <span>{option.label}</span>
              {isSelected && (
                <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-foreground rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
