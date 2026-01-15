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
}

export function ShareButton({ title, text, url, className, variant = 'icon', size = 'default' }: ShareButtonProps) {
  const shareUrl = url || window.location.href;
  const shareText = text || title;

  const buttonSize = size === 'sm' ? 'w-7 h-7' : 'w-9 h-9';
  const iconSize = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';

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
          `${buttonSize} rounded-full hover:bg-muted/60 active:bg-muted flex items-center justify-center transition-colors`,
          className
        )}
        aria-label="Share"
      >
        <Share2 className={cn(iconSize, 'text-foreground/70')} />
      </button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {variant === 'icon' ? (
          <button
            className={cn(
              `${buttonSize} rounded-full hover:bg-muted/60 active:bg-muted flex items-center justify-center transition-colors`,
              className
            )}
            aria-label="Share"
          >
            <Share2 className={cn(iconSize, 'text-foreground/70')} />
          </button>
        ) : (
          <Button variant="outline" size="sm" className={className}>
            <Share2 className="w-4 h-4 mr-2" />
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
