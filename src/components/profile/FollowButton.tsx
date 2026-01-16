import { useTranslation } from 'react-i18next';
import { useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Button } from '@/components/ui/button';
import { UserPlus, UserCheck, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import type { Id } from '../../../convex/_generated/dataModel';

interface FollowButtonProps {
  userId: Id<"users">;
  isFollowing: boolean;
  variant?: 'default' | 'compact';
}

export function FollowButton({ userId, isFollowing, variant = 'default' }: FollowButtonProps) {
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
      className="gap-2"
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : optimisticFollowing ? (
        <>
          <UserCheck className="w-4 h-4" />
          {t('profile.following')}
        </>
      ) : (
        <>
          <UserPlus className="w-4 h-4" />
          {t('profile.follow')}
        </>
      )}
    </Button>
  );
}
