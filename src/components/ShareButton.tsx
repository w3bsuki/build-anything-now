import { Share2, Link, Twitter, Facebook, MessageCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

interface ShareButtonProps {
  title: string;
  text?: string;
  url?: string;
  className?: string;
  variant?: 'icon' | 'button';
  size?: 'default' | 'sm';
  /** Visual style: 'default' for standard, 'overlay' for use on images with dark backgrounds */
  appearance?: 'default' | 'overlay';
}

export function ShareButton({ title, text, url, className, variant = 'icon', size = 'default', appearance = 'default' }: ShareButtonProps) {
  const { t } = useTranslation();
  const shareUrl = url || window.location.href;
  const shareText = text || title;

  const buttonSize = size === 'sm' ? 'w-8 h-8' : 'w-10 h-10';
  const iconSize = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';

  // Appearance-based styles
  const appearanceStyles = appearance === 'overlay'
    ? 'bg-overlay-dim/45 backdrop-blur-md text-primary-foreground hover:bg-overlay-dim/60 active:bg-overlay-dim/70 shadow-lg ring-1 ring-ring/20'
    : 'bg-muted text-foreground hover:bg-muted/80 active:bg-muted/70';

  const openExternal = (targetUrl: string, features?: string) => {
    const finalFeatures = features ? `${features},noopener,noreferrer` : 'noopener,noreferrer';
    const newWindow = window.open(targetUrl, '_blank', finalFeatures);
    if (newWindow) {
      newWindow.opener = null;
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: shareText,
          url: shareUrl,
        });
      } catch (_err) {
        // User cancelled or error
      }
    }
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(shareUrl);
    toast({
      title: t('common.copied'),
      description: t('common.linkCopied'),
    });
  };

  const shareToTwitter = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
    openExternal(twitterUrl, 'width=550,height=420');
  };

  const shareToFacebook = () => {
    const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    openExternal(fbUrl, 'width=550,height=420');
  };

  const shareToWhatsApp = () => {
    const waUrl = `https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`;
    openExternal(waUrl);
  };

  // Use native share on mobile if available
  if (navigator.share && variant === 'icon') {
    return (
      <button
        onClick={handleNativeShare}
        className={cn(
          `${buttonSize} rounded-full flex items-center justify-center transition-all duration-200`,
          appearanceStyles,
          className
        )}
        aria-label={t('common.share')}
      >
        <Share2 className={iconSize} />
      </button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {variant === 'icon' ? (
          <button
            className={cn(
              `${buttonSize} rounded-full flex items-center justify-center transition-all duration-200`,
              appearanceStyles,
              className
            )}
            aria-label="Share"
          >
            <Share2 className={iconSize} />
          </button>
        ) : (
          <Button variant="outline" size="sm" className={cn("gap-2", className)}>
            <Share2 className="w-4 h-4" />
            {t('common.share')}
          </Button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={copyLink}>
          <Link className="w-4 h-4 mr-2" />
          {t('share.copyLink')}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={shareToTwitter}>
          <Twitter className="w-4 h-4 mr-2" />
          {t('share.shareOnTwitter')}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={shareToFacebook}>
          <Facebook className="w-4 h-4 mr-2" />
          {t('share.shareOnFacebook')}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={shareToWhatsApp}>
          <MessageCircle className="w-4 h-4 mr-2" />
          {t('share.shareOnWhatsApp')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
