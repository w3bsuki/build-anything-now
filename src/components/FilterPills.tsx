import { cn } from '@/lib/utils';

interface FilterOption {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

interface FilterPillsProps {
  options: FilterOption[];
  selected: string;
  onSelect: (id: string) => void;
}

export const FilterPills = ({ options, selected, onSelect }: FilterPillsProps) => {
  return (
    <div className="flex gap-2 overflow-x-auto pb-0.5 scrollbar-hide">
      {options.map((option) => (
        <button
          type="button"
          key={option.id}
          onClick={() => onSelect(option.id)}
          className={cn(
            "inline-flex h-9 items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring-strong focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            selected === option.id
              ? "bg-chip-bg-active text-primary-foreground shadow-xs"
              : "bg-chip-bg text-foreground hover:bg-muted"
          )}
        >
          {option.icon}
          {option.label}
        </button>
      ))}
    </div>
  );
};
