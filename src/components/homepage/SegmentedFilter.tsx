import { useRef, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

export interface FilterOption {
  id: string;
  label: string;
  icon?: string; // Emoji icon
}

interface SegmentedFilterProps {
  options: FilterOption[];
  selected: string;
  onSelect: (id: string) => void;
  className?: string;
  /** Visual variant */
  variant?: 'default' | 'pill' | 'scroll';
}

export function SegmentedFilter({
  options,
  selected,
  onSelect,
  className,
  variant = 'scroll',
}: SegmentedFilterProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });

  // Scroll selected item into view
  useEffect(() => {
    if (!scrollRef.current) return;
    const selectedButton = scrollRef.current.querySelector(`[data-id="${selected}"]`) as HTMLElement;
    if (selectedButton) {
      selectedButton.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      
      // Update indicator position for pill variant
      if (variant === 'pill') {
        setIndicatorStyle({
          left: selectedButton.offsetLeft,
          width: selectedButton.offsetWidth,
        });
      }
    }
  }, [selected, variant]);

  // Scrollable pills variant - horizontal scroll
  if (variant === 'scroll') {
    return (
      <div className={cn('relative', className)}>
        <div 
          ref={scrollRef}
          className="flex gap-2 overflow-x-auto scrollbar-hide px-4 py-2"
        >
          {options.map((option) => {
            const isSelected = selected === option.id;
            return (
              <button
                key={option.id}
                data-id={option.id}
                onClick={() => onSelect(option.id)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors',
                  isSelected
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted/60 text-muted-foreground hover:bg-muted'
                )}
              >
                {option.icon && <span className="text-sm">{option.icon}</span>}
                <span>{option.label}</span>
              </button>
            );
          })}
        </div>
        {/* Fade edges */}
        <div className="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-background to-transparent pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-4 bg-gradient-to-l from-background to-transparent pointer-events-none" />
      </div>
    );
  }

  // Pill variant - contained with background and sliding indicator
  if (variant === 'pill') {
    return (
      <div className={cn('px-4 py-1.5', className)}>
        <div
          ref={scrollRef}
          className="relative flex bg-muted/50 rounded-xl p-0.5 gap-0.5 overflow-x-auto scrollbar-hide"
        >
          {/* Sliding indicator */}
          <div
            className="absolute top-0.5 bottom-0.5 rounded-lg bg-background shadow-sm transition-all duration-200 ease-out"
            style={{
              left: indicatorStyle.left,
              width: indicatorStyle.width,
            }}
          />

          {options.map((option) => {
            const isSelected = selected === option.id;
            return (
              <button
                key={option.id}
                data-id={option.id}
                onClick={() => onSelect(option.id)}
                className={cn(
                  'relative z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors',
                  isSelected ? 'text-foreground' : 'text-muted-foreground hover:text-foreground/80'
                )}
              >
                {option.icon && <span className="text-sm">{option.icon}</span>}
                <span>{option.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // Default variant - simple buttons with selected state
  return (
    <div className={cn('px-4 py-1.5', className)}>
      <div
        ref={scrollRef}
        className="flex gap-1 overflow-x-auto scrollbar-hide"
      >
        {options.map((option) => {
          const isSelected = selected === option.id;
          return (
            <button
              key={option.id}
              data-id={option.id}
              onClick={() => onSelect(option.id)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors',
                isSelected
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              {option.icon && <span className="text-sm">{option.icon}</span>}
              <span>{option.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
