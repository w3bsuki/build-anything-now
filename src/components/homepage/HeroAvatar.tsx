import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
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
  const sizeClasses = size === 'sm' ? 'size-12' : 'size-14';
  const innerClasses = size === 'sm' ? 'size-10' : 'size-12';

  const content = (
    <>
      {/* Avatar with badge */}
      <div className="relative">
        <div
          className={cn(
            "rounded-full border-2 border-primary/85 bg-surface p-0.5 ring-1 ring-background/90",
            sizeClasses
          )}
        >
          <div className="size-full rounded-full bg-surface p-0.5">
            {avatar ? (
              <img
                src={avatar}
                alt={name}
                className={cn("rounded-full object-cover", innerClasses)}
              />
            ) : (
              <div
                className={cn(
                  "flex items-center justify-center rounded-full bg-surface-sunken",
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
          <div className="absolute -bottom-0.5 -right-0.5 rounded-full bg-surface p-0.5">
            <div className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-xs font-bold leading-none text-primary-foreground">
              {count}
            </div>
          </div>
        )}
      </div>

      {/* Name */}
      <span className="max-w-16 truncate text-xs font-medium leading-none text-foreground/88">
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
  const { t } = useTranslation();
  const sizeClasses = size === 'sm' ? 'size-12' : 'size-14';

  return (
    <Link
      to="/create-case"
      className={cn('flex flex-col items-center gap-0.5 shrink-0', className)}
    >
      <div
        className={cn(
          "flex items-center justify-center rounded-full border-2 border-dashed border-primary/85 bg-surface ring-1 ring-background/90 transition-colors hover:border-primary hover:bg-primary/10",
          sizeClasses
        )}
      >
        <Plus className="size-5 text-primary" />
      </div>
      <span className="text-xs leading-none text-foreground/80">{t('actions.create', 'Create')}</span>
    </Link>
  );
}
