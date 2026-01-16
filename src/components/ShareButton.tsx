import { Share2, Link, Twitter, Facebook, MessageCircle } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
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
  const shareUrl = url || window.location.href;
  const shareText = text || title;

  const buttonSize = size === 'sm' ? 'w-8 h-8' : 'w-10 h-10';
  const iconSize = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';

  // Appearance-based styles
  const appearanceStyles = appearance === 'overlay'
    ? 'bg-black/40 backdrop-blur-md text-white hover:bg-black/60 active:bg-black/70 shadow-lg ring-1 ring-white/20'
    : 'bg-muted text-foreground hover:bg-muted/80 active:bg-muted/70';

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: shareText,
          url: shareUrl,
        });
      } catch (err) {
        // User cancelled or error
      }
    }
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(shareUrl);
    toast({
      title: 'Link copied!',
      description: 'The link has been copied to your clipboard.',
    });
  };

  const shareToTwitter = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(twitterUrl, '_blank', 'width=550,height=420');
  };

  const shareToFacebook = () => {
    const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    window.open(fbUrl, '_blank', 'width=550,height=420');
  };

  const shareToWhatsApp = () => {
    const waUrl = `https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`;
    window.open(waUrl, '_blank');
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
        aria-label="Share"
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
            Share
          </Button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={copyLink}>
          <Link className="w-4 h-4 mr-2" />
          Copy link
        </DropdownMenuItem>
        <DropdownMenuItem onClick={shareToTwitter}>
          <Twitter className="w-4 h-4 mr-2" />
          Share on Twitter
        </DropdownMenuItem>
        <DropdownMenuItem onClick={shareToFacebook}>
          <Facebook className="w-4 h-4 mr-2" />
          Share on Facebook
        </DropdownMenuItem>
        <DropdownMenuItem onClick={shareToWhatsApp}>
          <MessageCircle className="w-4 h-4 mr-2" />
          Share on WhatsApp
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
