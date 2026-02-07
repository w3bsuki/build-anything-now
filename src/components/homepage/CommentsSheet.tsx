import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { Send, Loader2, X, MessageCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import { api } from '../../../convex/_generated/api';
import { Id } from '../../../convex/_generated/dataModel';

interface CommentsSheetProps {
  isOpen: boolean;
  onClose: () => void;
  caseId: Id<"cases">;
  caseTitle: string;
}

export function CommentsSheet({ isOpen, onClose, caseId, caseTitle }: CommentsSheetProps) {
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Fetch comments
  const commentsData = useQuery(
    api.social.getComments,
    isOpen ? { caseId, limit: 50 } : "skip"
  );
  
  // Mutations
  const addComment = useMutation(api.social.addComment);
  
  // Focus input when drawer opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const content = newComment.trim();
    if (!content || isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      await addComment({
        caseId,
        content,
      });
      setNewComment('');
      toast({
        title: 'Comment added',
        description: 'Your comment has been posted.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Please sign in to comment',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const formatTime = (timestamp: number) => {
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
  };
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };
  
  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className="max-h-[85vh]">
        <DrawerHeader className="border-b border-border/50 pb-3">
          <div className="flex items-center justify-between">
            <DrawerTitle className="text-base font-semibold">
              Comments
            </DrawerTitle>
            <DrawerClose asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <X className="h-4 w-4" />
              </Button>
            </DrawerClose>
          </div>
          <p className="text-xs text-muted-foreground line-clamp-1 text-left">
            {caseTitle}
          </p>
        </DrawerHeader>
        
        {/* Comments List */}
        <ScrollArea className="flex-1 h-[50vh] px-4">
          {commentsData === undefined ? (
            // Loading skeleton
            <div className="py-4 space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex gap-3">
                  <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : commentsData.comments.length === 0 ? (
            // Empty state
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <MessageCircle className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-foreground mb-1">No comments yet</h3>
              <p className="text-sm text-muted-foreground">
                Be the first to share your thoughts!
              </p>
            </div>
          ) : (
            // Comments list
            <div className="py-4 space-y-4">
              {commentsData.comments.map((comment) => (
                <div key={comment.id} className="flex gap-3 group">
                  <Avatar className="w-8 h-8 flex-shrink-0">
                    <AvatarImage src={comment.user.avatar ?? undefined} />
                    <AvatarFallback className="text-xs bg-primary/10 text-primary">
                      {getInitials(comment.user.name)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2">
                      <span className="text-sm font-semibold text-foreground">
                        {comment.user.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatTime(comment.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm text-foreground/90 break-words">
                      {comment.content}
                    </p>
                  </div>
                </div>
              ))}
              
              {/* Load more indicator */}
              {commentsData.nextCursor && (
                <div className="text-center py-2">
                  <Button variant="ghost" size="sm" className="text-xs text-muted-foreground">
                    Load more comments
                  </Button>
                </div>
              )}
            </div>
          )}
        </ScrollArea>
        
        {/* Comment Input */}
        <div className="border-t border-border/50 p-4 pb-safe">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              ref={inputRef}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 h-10 text-sm"
              maxLength={1000}
              disabled={isSubmitting}
            />
            <Button
              type="submit"
              size="icon"
              className="h-10 w-10 flex-shrink-0"
              disabled={!newComment.trim() || isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </form>
          
          {newComment.length > 800 && (
            <p className={cn(
              "text-xs mt-1",
              newComment.length > 950 ? "text-destructive" : "text-muted-foreground"
            )}>
              {1000 - newComment.length} characters remaining
            </p>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
