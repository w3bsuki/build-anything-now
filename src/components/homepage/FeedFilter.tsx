import { ChevronDown, MapPin, Heart, Home } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

export interface FilterOption {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

interface FeedFilterProps {
  selected: string;
  onSelect: (id: string) => void;
  className?: string;
}

export function FeedFilter({ selected, onSelect, className }: FeedFilterProps) {
  const { t } = useTranslation();

  const options: FilterOption[] = [
    { id: 'all', label: t('status.all', 'All cases') },
    { id: 'urgent', label: t('status.urgentOnly', 'Urgent only'), icon: <Heart className="w-4 h-4 text-red-500" /> },
    { id: 'adopted', label: t('status.adopted', 'Adopted'), icon: <Home className="w-4 h-4 text-green-500" /> },
    { id: 'nearby', label: t('status.nearMe', 'Near me'), icon: <MapPin className="w-4 h-4 text-blue-500" /> },
  ];

  const selectedOption = options.find(o => o.id === selected) || options[0];

  return (
    <div className={cn('px-4 py-2', className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-foreground/80 transition-colors">
            {selectedOption.icon}
            <span>{selectedOption.label}</span>
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48">
          {options.map((option) => (
            <DropdownMenuItem
              key={option.id}
              onClick={() => onSelect(option.id)}
              className={cn(
                'flex items-center gap-2 cursor-pointer',
                selected === option.id && 'bg-accent'
              )}
            >
              {option.icon}
              <span>{option.label}</span>
              {selected === option.id && (
                <span className="ml-auto text-primary">✓</span>
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
