import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HeroAvatarProps {
  id: string;
  name: string;
  avatar?: string;
  count: number;
  size?: 'sm' | 'md';
  className?: string;
  onClick?: () => void; // Optional click handler for story viewing
}

export function HeroAvatar({ id, name, avatar, count, size = 'md', className, onClick }: HeroAvatarProps) {
  const dimensions = size === 'sm' ? 48 : 56;
  const innerSize = dimensions - 8; // Account for ring + padding

  const content = (
    <>
      {/* Avatar with badge */}
      <div className="relative">
        {/* Gradient Ring - Twitter blue gradient */}
        <div
          className="rounded-full p-[2px] bg-gradient-to-tr from-sky-400 via-primary to-blue-500"
          style={{ width: dimensions, height: dimensions }}
        >
          <div className="rounded-full bg-background p-[2px] w-full h-full">
            {avatar ? (
              <img
                src={avatar}
                alt={name}
                className="rounded-full object-cover w-full h-full"
                style={{ width: innerSize, height: innerSize }}
              />
            ) : (
              <div
                className="rounded-full bg-muted flex items-center justify-center w-full h-full"
                style={{ width: innerSize, height: innerSize }}
              >
                <span className="text-sm font-medium text-muted-foreground">
                  {name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Trophy Badge - positioned at bottom right */}
        {count > 0 && (
          <div className="absolute -bottom-0.5 -right-0.5 bg-background rounded-full p-[2px]">
            <div className="bg-primary text-primary-foreground text-[9px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
              {count}
            </div>
          </div>
        )}
      </div>

      {/* Name */}
      <span className="text-[11px] text-muted-foreground truncate max-w-[56px]">
        {name}
      </span>
    </>
  );

  // If onClick is provided, render as button (for story viewing)
  if (onClick) {
    return (
      <button
        onClick={onClick}
        className={cn('flex flex-col items-center gap-0.5 flex-shrink-0', className)}
      >
        {content}
      </button>
    );
  }

  // Default: render as Link to profile
  return (
    <Link
      to={`/profile/${id}`}
      className={cn('flex flex-col items-center gap-0.5 flex-shrink-0', className)}
    >
      {content}
    </Link>
  );
}

interface AddCaseCircleProps {
  size?: 'sm' | 'md';
  className?: string;
}

export function AddCaseCircle({ size = 'md', className }: AddCaseCircleProps) {
  const dimensions = size === 'sm' ? 48 : 56;

  return (
    <Link
      to="/create-case"
      className={cn('flex flex-col items-center gap-0.5 flex-shrink-0', className)}
    >
      <div
        className="rounded-full border-2 border-dashed border-primary/40 flex items-center justify-center bg-primary/5 hover:bg-primary/10 hover:border-primary/60 transition-colors"
        style={{ width: dimensions, height: dimensions }}
      >
        <Plus className="w-5 h-5 text-primary" />
      </div>
      <span className="text-[11px] text-muted-foreground">Add</span>
    </Link>
  );
}
