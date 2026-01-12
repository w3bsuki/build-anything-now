import { useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { mockCommunityPosts, mockPostComments } from '@/data/mockData';
import { ShareButton } from '@/components/ShareButton';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useSimulatedLoading } from '@/hooks/useSimulatedLoading';
import {
  ArrowLeft,
  ThumbsUp,
  MessageSquare,
  MoreHorizontal,
  Send,
  Bookmark,
  ImagePlus,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { PostComment } from '@/types';

const CommunityPostPage = () => {
  const { postId } = useParams();
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<{ id: string; name: string } | null>(null);
  const [likedComments, setLikedComments] = useState<Set<string>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);
  const commentInputRef = useRef<HTMLInputElement>(null);
  const isLoading = useSimulatedLoading(400);

  const post = mockCommunityPosts.find((p) => p.id === postId);
  const comments = mockPostComments.filter((c) => c.postId === postId);

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Post not found</h1>
          <Link to="/community" className="text-primary hover:underline">
            Go back to community
          </Link>
        </div>
      </div>
    );
  }

  const handleLikeComment = (commentId: string) => {
    setLikedComments((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(commentId)) {
        newSet.delete(commentId);
      } else {
        newSet.add(commentId);
      }
      return newSet;
    });
  };

  const handleSubmitComment = () => {
    if (!newComment.trim() && !selectedImage) return;
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

  const handleReplyClick = (commentId: string, authorName: string) => {
    setReplyingTo({ id: commentId, name: authorName });
    commentInputRef.current?.focus();
  };

  const renderComment = (comment: PostComment, isReply = false) => {
    const isCommentLiked = likedComments.has(comment.id);

    return (
      <div
        key={comment.id}
        className={cn(
          'group',
          isReply ? 'ml-12 mt-3' : 'py-3'
        )}
      >
        <div className="flex gap-3">
          <Avatar className={cn(isReply ? 'w-7 h-7' : 'w-9 h-9')}>
            <AvatarImage src={comment.author.avatar} alt={comment.author.name} />
            <AvatarFallback>{comment.author.name.charAt(0)}</AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="inline-block bg-muted/60 rounded-2xl px-3.5 py-2.5">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="font-semibold text-sm text-foreground">
                  {comment.author.name}
                </span>
                {comment.author.isVolunteer && (
                  <span className="px-1.5 py-0.5 text-[9px] font-medium bg-primary/10 text-primary rounded-full">
                    Volunteer
                  </span>
                )}
              </div>
              <p className="text-sm text-foreground leading-relaxed">{comment.content}</p>
            </div>

            <div className="flex items-center gap-3 mt-1.5 px-1">
              <span className="text-[11px] text-muted-foreground">{comment.timeAgo}</span>
              <button
                onClick={() => handleLikeComment(comment.id)}
                className={cn(
                  'text-[11px] font-medium transition-colors',
                  isCommentLiked ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                Like{isCommentLiked && 'd'} {comment.likes + (isCommentLiked ? 1 : 0) > 0 && `· ${comment.likes + (isCommentLiked ? 1 : 0)}`}
              </button>
              {!isReply && (
                <button
                  onClick={() => handleReplyClick(comment.id, comment.author.name)}
                  className="text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Reply
                </button>
              )}
            </div>

            {comment.replies && comment.replies.length > 0 && (
              <div className="mt-1">
                {comment.replies.map((reply) => renderComment(reply, true))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen pb-20 md:pb-20 md:pt-16 bg-background">
      {/* Mobile Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border md:hidden">
        <div className="flex items-center gap-3 px-4 py-2.5">
          <Link
            to="/community"
            className="w-9 h-9 rounded-full bg-muted/80 flex items-center justify-center"
          >
            <ArrowLeft className="w-4 h-4 text-foreground" />
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
            Back to community
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
              <button className="p-2 hover:bg-muted rounded-full transition-colors">
                <MoreHorizontal className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            {/* Mobile author info */}
            <div className="md:hidden mb-3">
              <span className="text-xs text-muted-foreground">{post.timeAgo}</span>
            </div>

            {/* Content */}
            <p className="text-foreground leading-relaxed text-[15px]">{post.content}</p>
          </article>

          {/* Post Image */}
          {post.image && (
            <div className="mt-4">
              <img
                src={post.image}
                alt="Post"
                className="w-full aspect-video object-cover"
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
                <ThumbsUp className={cn('w-[18px] h-[18px]', isLiked && 'fill-current')} />
                <span className="text-sm font-medium">{post.likes + (isLiked ? 1 : 0)}</span>
              </button>
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-muted-foreground hover:bg-muted transition-all">
                <MessageSquare className="w-[18px] h-[18px]" />
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
            <span className="text-xs font-medium text-muted-foreground">Comments ({comments.length})</span>
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
              {comments.map((comment) => renderComment(comment))}
            </div>
          ) : (
            <div className="py-8 text-center text-muted-foreground">
              <p className="text-sm">No comments yet</p>
            </div>
          )}
          </div>
        </div>
      </div>

      {/* Sticky Bottom Comment Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50 md:bottom-0">
        {/* Reply indicator */}
        {replyingTo && (
          <div className="px-4 py-2 bg-muted/50 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              Replying to <span className="font-medium text-foreground">{replyingTo.name}</span>
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
          <div className="px-4 py-2 bg-muted/30">
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
          
          <div className="flex-1 flex items-center gap-2 bg-muted rounded-full px-1 py-1">
            <input
              ref={commentInputRef}
              type="text"
              placeholder={replyingTo ? `Reply to ${replyingTo.name}...` : "Write a comment..."}
              className="flex-1 px-3 py-1.5 text-sm bg-transparent border-0 focus:outline-none placeholder:text-muted-foreground"
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
  );
};

export default CommunityPostPage;
