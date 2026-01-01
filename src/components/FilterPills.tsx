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
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
      {options.map((option) => (
        <button
          key={option.id}
          onClick={() => onSelect(option.id)}
          className={cn(
            "flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors",
            selected === option.id
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          )}
        >
          {option.icon}
          {option.label}
        </button>
      ))}
    </div>
  );
};
