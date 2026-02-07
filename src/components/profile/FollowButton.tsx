import { useTranslation } from 'react-i18next';
import { useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Button } from '@/components/ui/button';
import { UserPlus, UserCheck, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import type { Id } from '../../../convex/_generated/dataModel';
import { cn } from '@/lib/utils';

interface FollowButtonProps {
  userId: Id<"users">;
  isFollowing: boolean;
  variant?: 'default' | 'compact';
  className?: string;
}

export function FollowButton({ userId, isFollowing, variant = 'default', className }: FollowButtonProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const toggleFollow = useMutation(api.social.toggleFollow);
  const [isLoading, setIsLoading] = useState(false);
  const [optimisticFollowing, setOptimisticFollowing] = useState(isFollowing);

  const handleClick = async () => {
    setIsLoading(true);
    setOptimisticFollowing(!optimisticFollowing);
    
    try {
      const result = await toggleFollow({ userId });
      setOptimisticFollowing(result.following);
    } catch (error) {
      // Revert optimistic update
      setOptimisticFollowing(isFollowing);
      toast({
        title: t('common.error'),
        description: error instanceof Error ? error.message : t('common.unknownError'),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (variant === 'compact') {
    return (
      <Button
        size="sm"
        variant={optimisticFollowing ? 'outline' : 'default'}
        onClick={handleClick}
        disabled={isLoading}
        className="gap-1.5"
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : optimisticFollowing ? (
          <UserCheck className="w-4 h-4" />
        ) : (
          <UserPlus className="w-4 h-4" />
        )}
      </Button>
    );
  }

  return (
    <Button
      size="sm"
      variant={optimisticFollowing ? 'outline' : 'default'}
      onClick={handleClick}
      disabled={isLoading}
      className={cn("gap-2 font-semibold rounded-xl", className)}
    >
      {isLoading ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : optimisticFollowing ? (
        <>
          <UserCheck className="w-5 h-5" />
          {t('profile.following')}
        </>
      ) : (
        <>
          <UserPlus className="w-5 h-5" />
          {t('profile.follow')}
        </>
      )}
    </Button>
  );
}
