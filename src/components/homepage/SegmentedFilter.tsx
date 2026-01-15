import { useState } from 'react';
import { MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export interface FilterOption {
  id: string;
  label: string;
  icon?: string; // Emoji icon
}

interface SegmentedFilterProps {
  options: FilterOption[];
  selected: string;
  onSelect: (id: string) => void;
  /** Number of options to show before overflow menu (default: 4) */
  visibleCount?: number;
  className?: string;
}

export function SegmentedFilter({
  options,
  selected,
  onSelect,
  visibleCount = 4,
  className,
}: SegmentedFilterProps) {
  const visibleOptions = options.slice(0, visibleCount);
  const overflowOptions = options.slice(visibleCount);
  const hasOverflow = overflowOptions.length > 0;

  // Check if selected is in overflow
  const selectedInOverflow = overflowOptions.some((o) => o.id === selected);

  return (
    <div className={cn('px-4 py-2', className)}>
      <div className="flex bg-muted/60 rounded-xl p-1 gap-0.5">
        {visibleOptions.map((option) => {
          const isIconOnly = option.icon && !option.label;
          return (
            <button
              key={option.id}
              onClick={() => onSelect(option.id)}
              className={cn(
                'py-2 px-3 rounded-lg text-xs font-medium transition-all whitespace-nowrap flex items-center justify-center gap-1.5',
                isIconOnly ? 'px-3' : 'flex-1',
                selected === option.id
                  ? 'bg-background shadow-sm text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {option.icon && <span className="text-sm">{option.icon}</span>}
              {option.label && <span className="truncate">{option.label}</span>}
            </button>
          );
        })}

        {hasOverflow && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className={cn(
                  'px-3 py-2 rounded-md transition-all flex items-center justify-center',
                  selectedInOverflow
                    ? 'bg-background shadow-sm text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {selectedInOverflow ? (
                  <>
                    {overflowOptions.find((o) => o.id === selected)?.icon}{' '}
                    <span className="text-xs font-medium ml-1">
                      {overflowOptions.find((o) => o.id === selected)?.label}
                    </span>
                  </>
                ) : (
                  <MoreHorizontal className="w-4 h-4" />
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[140px]">
              {overflowOptions.map((option) => (
                <DropdownMenuItem
                  key={option.id}
                  onClick={() => onSelect(option.id)}
                  className={cn(
                    'flex items-center gap-2',
                    selected === option.id && 'bg-muted'
                  )}
                >
                  {option.icon && <span>{option.icon}</span>}
                  {option.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
}
