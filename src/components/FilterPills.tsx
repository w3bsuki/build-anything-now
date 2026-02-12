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
    <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-hide">
      {options.map((option) => (
        <button
          type="button"
          key={option.id}
          onClick={() => onSelect(option.id)}
          className={cn(
            "inline-flex h-10 items-center gap-1.5 whitespace-nowrap rounded-full border px-4 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring-strong focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            selected === option.id
              ? "border-primary/55 bg-chip-bg-active text-primary-foreground shadow-sm ring-1 ring-primary/35"
              : "border-chip-border bg-chip-bg text-foreground shadow-2xs hover:bg-surface-sunken"
          )}
        >
          {option.icon}
          {option.label}
        </button>
      ))}
    </div>
  );
};
