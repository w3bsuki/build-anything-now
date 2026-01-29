import { useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import type { Id } from '../../convex/_generated/dataModel';
import { ShareButton } from '@/components/ShareButton';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import {
  ArrowLeft,
  ThumbsUp,
  MessageSquare,
  MoreHorizontal,
  Flag,
  Send,
  Bookmark,
  ImagePlus,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const CommunityPostPage = () => {
  const { t } = useTranslation();
  const { postId } = useParams();
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<{ id: string; name: string } | null>(null);
  const [reportOpen, setReportOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const commentInputRef = useRef<HTMLInputElement>(null);

  const rulesPostId = 'rules';
  const rulesPost = {
    id: rulesPostId,
    author: {
      id: 'system',
      name: t('app.name'),
      avatar: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=200',
      isVolunteer: false,
    },
    content: t('community.rulesBody'),
    image: undefined as string | undefined,
    likes: 0,
    comments: 0,
    timeAgo: t('community.pinned'),
    createdAt: new Date().toISOString(),
  };

  // Fetch post from Convex (skip if it's the rules post)
  const convexPost = useQuery(
    api.community.get,
    postId && postId !== rulesPostId ? { id: postId as Id<"communityPosts"> } : "skip"
  );
  
  const post = postId === rulesPostId ? rulesPost : convexPost;
  
  // TODO: Comments are not yet implemented in Convex
  const comments: never[] = [];
  const isLoading = postId !== rulesPostId && convexPost === undefined;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">{t('common.loading')}</div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">{t('communityPost.postNotFound')}</h1>
          <Link to="/community" className="text-primary hover:underline">
            {t('communityPost.backToCommunity')}
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmitComment = () => {
    if (!newComment.trim() && !selectedImage) return;
    // TODO: Implement comment creation with Convex
    console.log('Submitting comment:', newComment, selectedImage);
    setNewComment('');
    setSelectedImage(null);
    setReplyingTo(null);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen pb-32 md:pb-20 md:pt-16 bg-background">
      {/* Mobile Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-md md:hidden">
        <div className="flex items-center gap-3 h-14 px-3">
          <Link
            to="/community"
            className="w-9 h-9 rounded-xl bg-muted/80 flex items-center justify-center active:bg-muted transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </Link>
          <div className="flex-1 flex items-center gap-2">
            <Avatar className="w-7 h-7">
              <AvatarImage src={post.author.avatar} alt={post.author.name} />
              <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <span className="font-medium text-sm text-foreground truncate">{post.author.name}</span>
          </div>
          <ShareButton title={`Post by ${post.author.name}`} text={post.content} />
        </div>
      </div>

      <div className="max-w-2xl mx-auto">
        {/* Desktop Back Button */}
        <div className="hidden md:block px-4 pt-4">
          <Link
            to="/community"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('communityPost.backToCommunity')}
          </Link>
        </div>

        {/* Post Card */}
        <div className="bg-card md:mx-4 md:mt-4 md:rounded-xl md:border md:border-border">
          {/* Post Content */}
          <article className="px-4 pt-4">
            {/* Author - Desktop only (mobile shows in header) */}
            <div className="hidden md:flex items-center gap-3 mb-4">
              <Avatar className="w-11 h-11">
                <AvatarImage src={post.author.avatar} alt={post.author.name} />
                <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-foreground">{post.author.name}</span>
                  {post.author.isVolunteer && (
                    <span className="px-2 py-0.5 text-xs font-medium bg-primary/10 text-primary rounded-full">
                      Volunteer
                    </span>
                  )}
                </div>
                <span className="text-sm text-muted-foreground">{post.timeAgo}</span>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="p-2 hover:bg-muted rounded-full transition-colors"
                    aria-label={t('community.more', 'More')}
                  >
                    <MoreHorizontal className="w-5 h-5 text-muted-foreground" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  <DropdownMenuItem onClick={() => setReportOpen(true)}>
                    <Flag className="mr-2 h-4 w-4 text-muted-foreground" />
                    {t('report.reportConcern', 'Report concern')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Mobile author info */}
            <div className="md:hidden mb-3">
              <span className="text-xs text-muted-foreground">{post.timeAgo}</span>
            </div>

            {/* Content */}
            <p
              className={cn(
                'text-foreground leading-relaxed text-sm',
                postId === rulesPostId && 'whitespace-pre-line'
              )}
            >
              {post.content}
            </p>
          </article>

          {/* Post Image */}
          {post.image && (
            <div className="mt-4">
              <img
                src={post.image}
                alt="Post"
                className="w-full aspect-video object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          )}

          {/* Inline Actions */}
          <div className="px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsLiked(!isLiked)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all',
                  isLiked
                    ? 'text-primary bg-primary/10'
                    : 'text-muted-foreground hover:bg-muted'
                )}
              >
                <ThumbsUp className={cn('w-5 h-5', isLiked && 'fill-current')} />
                <span className="text-sm font-medium">{post.likes + (isLiked ? 1 : 0)}</span>
              </button>
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-muted-foreground hover:bg-muted transition-all">
                <MessageSquare className="w-5 h-5" />
                <span className="text-sm font-medium">{comments.length}</span>
              </button>
            </div>
            <button
              onClick={() => setIsSaved(!isSaved)}
              className={cn(
                'p-2 rounded-full transition-all',
                isSaved
                  ? 'text-warning bg-warning/10'
                  : 'text-muted-foreground hover:bg-muted'
              )}
            >
              <Bookmark className={cn('w-5 h-5', isSaved && 'fill-current')} />
            </button>
          </div>
        </div>

        {/* Comments Section */}
        <div className="bg-card md:mx-4 md:rounded-xl md:border md:border-border">
          <div className="px-4 pt-3 pb-1">
            <span className="text-xs font-medium text-muted-foreground">{t('communityPost.comments')} ({comments.length})</span>
          </div>
          <div className="px-4">
          {isLoading ? (
            <div className="space-y-3 py-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex gap-3 animate-pulse">
                  <div className="w-9 h-9 rounded-full bg-muted shrink-0" />
                  <div className="flex-1">
                    <div className="inline-block bg-muted rounded-2xl px-4 py-3 w-3/4">
                      <div className="h-3 w-20 bg-muted-foreground/10 rounded mb-2" />
                      <div className="h-3 w-full bg-muted-foreground/10 rounded" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : comments.length > 0 ? (
            <div className="pb-2">
              {/* TODO: Implement comments when Convex comments are ready */}
              <div className="py-8 text-center text-muted-foreground">
                <p className="text-sm">{t('communityPost.noCommentsYet')}</p>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-muted-foreground">
              <p className="text-sm">{t('communityPost.noCommentsYet')}</p>
            </div>
          )}
          </div>
        </div>
      </div>

      {/* Sticky Bottom Comment Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl border-t border-border/50">
        <div className="mx-auto w-full max-w-2xl px-3 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
          <div className="rounded-2xl border border-border/70 bg-card shadow-sm overflow-hidden">
            {/* Reply indicator */}
            {replyingTo && (
              <div className="px-4 py-2 bg-muted/50 flex items-center justify-between border-b border-border/50">
                <span className="text-xs text-muted-foreground">
                  {t('communityPost.replyTo')} <span className="font-medium text-foreground">{replyingTo.name}</span>
                </span>
                <button
                  onClick={() => setReplyingTo(null)}
                  className="p-1 hover:bg-muted rounded-full"
                >
                  <X className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
              </div>
            )}

            {/* Selected image preview */}
            {selectedImage && (
              <div className="px-4 py-2 bg-muted/30 border-b border-border/50">
                <div className="relative inline-block">
                  <img
                    src={selectedImage}
                    alt="Selected"
                    className="h-16 w-auto rounded-lg object-cover"
                  />
                  <button
                    onClick={() => setSelectedImage(null)}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-foreground text-background rounded-full flex items-center justify-center"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )}

            {/* Input area */}
            <div className="px-3 py-2 flex items-center gap-2">
              <Avatar className="w-8 h-8 shrink-0">
                <AvatarImage src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200" />
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
              
              <div className="flex-1 flex items-center gap-1.5 bg-muted/50 rounded-full pl-4 pr-1">
                <input
                  ref={commentInputRef}
                  type="text"
                  placeholder={replyingTo ? t('communityPost.replyToName', { name: replyingTo.name }) : t('communityPost.writeComment')}
                  className="flex-1 py-2 text-[16px] leading-normal bg-transparent border-0 focus:outline-none placeholder:text-muted-foreground"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmitComment();
                    }
                  }}
                />
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageSelect}
                />
                
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-background/50 transition-colors"
                >
                  <ImagePlus className="w-5 h-5" />
                </button>
              </div>
              
              <button
                onClick={handleSubmitComment}
                disabled={!newComment.trim() && !selectedImage}
                className={cn(
                  'w-9 h-9 rounded-full flex items-center justify-center transition-all shrink-0',
                  newComment.trim() || selectedImage
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                )}
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <Sheet open={reportOpen} onOpenChange={setReportOpen}>
        <SheetContent side="bottom" className="rounded-t-2xl px-4 pb-[calc(env(safe-area-inset-bottom)+1rem)]">
          <SheetHeader className="text-left">
            <SheetTitle className="flex items-center gap-2">
              <Flag className="h-5 w-5 text-muted-foreground" />
              {t('report.reportConcern', 'Report concern')}
            </SheetTitle>
            <SheetDescription>
              {t(
                'community.reportComingSoon',
                'Reporting community posts is coming soon. For now, you can report cases from the case page.'
              )}
            </SheetDescription>
          </SheetHeader>

          <div className="mt-4 rounded-xl border border-border/60 bg-card/40 p-3 text-sm text-muted-foreground">
            <div className="font-semibold text-foreground">{t('community.reportWhyTitle', 'Why this matters')}</div>
            <div className="mt-1">
              {t('community.reportWhyBody', 'We use reports to stop scams and keep the community safe.')}
            </div>
          </div>

          <SheetFooter className="mt-4">
            <Button variant="outline" onClick={() => setReportOpen(false)}>
              {t('actions.close', 'Close')}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default CommunityPostPage;
