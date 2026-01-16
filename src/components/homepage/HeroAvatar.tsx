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
  const sizeClasses = size === 'sm' ? 'size-14' : 'size-16';
  const innerClasses = size === 'sm' ? 'size-12' : 'size-14';

  const content = (
    <>
      {/* Avatar with badge */}
      <div className="relative">
        {/* Gradient Ring - Twitter blue gradient */}
        <div
          className={cn(
            "rounded-full p-0.5 bg-linear-to-tr from-sky-400 via-primary to-blue-500",
            sizeClasses
          )}
        >
          <div className="rounded-full bg-background p-0.5 size-full">
            {avatar ? (
              <img
                src={avatar}
                alt={name}
                className={cn("rounded-full object-cover", innerClasses)}
              />
            ) : (
              <div
                className={cn(
                  "rounded-full bg-muted flex items-center justify-center",
                  innerClasses
                )}
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
      <span className="text-[11px] text-muted-foreground truncate max-w-16">
        {name}
      </span>
    </>
  );

  // If onClick is provided, render as button (for story viewing)
  if (onClick) {
    return (
      <button
        onClick={onClick}
        className={cn('flex flex-col items-center gap-0.5 shrink-0', className)}
      >
        {content}
      </button>
    );
  }

  // Default: render as Link to profile
  return (
    <Link
      to={`/profile/${id}`}
      className={cn('flex flex-col items-center gap-0.5 shrink-0', className)}
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
  const sizeClasses = size === 'sm' ? 'size-14' : 'size-16';

  return (
    <Link
      to="/create-case"
      className={cn('flex flex-col items-center gap-0.5 shrink-0', className)}
    >
      <div
        className={cn(
          "rounded-full border-2 border-dashed border-primary/40 flex items-center justify-center bg-primary/5 hover:bg-primary/10 hover:border-primary/60 transition-colors",
          sizeClasses
        )}
      >
        <Plus className="size-6 text-primary" />
      </div>
      <span className="text-[11px] text-muted-foreground">Add</span>
    </Link>
  );
}
