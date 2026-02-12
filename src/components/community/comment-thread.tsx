import { Flag, MessageCircleReply, ShieldCheck, ThumbsUp, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import type { ForumComment } from "@/types";
import { cn } from "@/lib/utils";

interface CommentThreadProps {
  comments: ForumComment[];
  canModerate: boolean;
  currentUserId: string | null;
  onReply: (comment: ForumComment) => void;
  onToggleReaction: (comment: ForumComment) => void;
  onReport: (comment: ForumComment) => void;
  onDelete: (comment: ForumComment) => void;
}

const INITIAL_VISIBLE_REPLIES = 2;

export function CommentThread({
  comments,
  canModerate,
  currentUserId,
  onReply,
  onToggleReaction,
  onReport,
  onDelete,
}: CommentThreadProps) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const empty = useMemo(() => comments.length === 0, [comments.length]);

  if (empty) {
    return (
      <section className="rounded-2xl border border-border/60 bg-surface-elevated shadow-xs p-4 text-sm text-muted-foreground">
        No replies yet. Be the first to help.
      </section>
    );
  }

  return (
    <section className="space-y-3">
      {comments.map((comment) => {
        const showAllReplies = expanded[comment.id];
        const visibleReplies = showAllReplies ? comment.replies : comment.replies.slice(0, INITIAL_VISIBLE_REPLIES);
        const hiddenCount = Math.max(0, comment.replies.length - visibleReplies.length);

        return (
          <article key={comment.id} className="rounded-2xl border border-border/60 bg-surface-elevated shadow-xs p-3">
            <CommentRow
              comment={comment}
              canModerate={canModerate}
              currentUserId={currentUserId}
              onReply={onReply}
              onToggleReaction={onToggleReaction}
              onReport={onReport}
              onDelete={onDelete}
            />

            {comment.replies.length > 0 ? (
              <div className="mt-3 border-l border-border pl-3">
                <div className="space-y-2">
                  {visibleReplies.map((reply) => (
                    <CommentRow
                      key={reply.id}
                      comment={reply}
                      compact
                      canModerate={canModerate}
                      currentUserId={currentUserId}
                      onReply={onReply}
                      onToggleReaction={onToggleReaction}
                      onReport={onReport}
                      onDelete={onDelete}
                    />
                  ))}
                </div>
                {hiddenCount > 0 ? (
                  <button
                    type="button"
                    onClick={() => setExpanded((previous) => ({ ...previous, [comment.id]: true }))}
                    className="mt-2 inline-flex min-h-11 items-center rounded-xl border border-border bg-background px-3 text-sm font-medium text-foreground transition-colors active:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring-strong"
                  >
                    View {hiddenCount} more repl{hiddenCount === 1 ? "y" : "ies"}
                  </button>
                ) : null}
              </div>
            ) : null}
          </article>
        );
      })}
    </section>
  );
}

function CommentRow({
  comment,
  compact = false,
  canModerate,
  currentUserId,
  onReply,
  onToggleReaction,
  onReport,
  onDelete,
}: {
  comment: ForumComment;
  compact?: boolean;
  canModerate: boolean;
  currentUserId: string | null;
  onReply: (comment: ForumComment) => void;
  onToggleReaction: (comment: ForumComment) => void;
  onReport: (comment: ForumComment) => void;
  onDelete: (comment: ForumComment) => void;
}) {
  const canDelete = canModerate || (currentUserId !== null && comment.author.id === currentUserId);
  const canInteract = !comment.isDeleted;
  return (
    <div className={cn("rounded-xl border border-border bg-background p-2.5", compact && "border-border/70")}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="font-medium text-foreground">{comment.author.name}</span>
            {comment.author.badge ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 font-medium text-primary">
                <ShieldCheck className="size-3" />
                {formatBadge(comment.author.badge)}
              </span>
            ) : null}
            <span>•</span>
            <span>{comment.timeAgo}</span>
            {comment.editedAt ? <span>• edited</span> : null}
          </div>
          <p className="mt-1 whitespace-pre-wrap text-sm text-foreground">{comment.content}</p>
        </div>
        <div className="flex items-center gap-1">
          {canInteract ? (
            <button
              type="button"
              onClick={() => onReport(comment)}
              className="inline-flex size-11 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-colors active:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring-strong"
              aria-label="Report reply"
            >
              <Flag className="size-4" />
            </button>
          ) : null}
          {canDelete && canInteract ? (
            <button
              type="button"
              onClick={() => onDelete(comment)}
              className="inline-flex size-11 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-colors active:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring-strong"
              aria-label="Delete reply"
            >
              <Trash2 className="size-4" />
            </button>
          ) : null}
        </div>
      </div>

      <div className="mt-2 flex items-center gap-2">
        <button
          type="button"
          onClick={() => onToggleReaction(comment)}
          disabled={!canInteract}
          className={cn(
            "inline-flex min-h-11 items-center gap-1.5 rounded-full border px-3 text-xs font-semibold transition-colors",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring-strong disabled:opacity-50",
            comment.viewerReacted
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-card text-foreground active:bg-muted"
          )}
          aria-label="React to reply"
        >
          <ThumbsUp className="size-3.5" />
          {comment.reactionCount}
        </button>
        {!compact && canInteract ? (
          <button
            type="button"
            onClick={() => onReply(comment)}
            className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-border bg-card px-3 text-xs font-semibold text-foreground transition-colors active:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring-strong"
            aria-label="Reply"
          >
            <MessageCircleReply className="size-3.5" />
            Reply
          </button>
        ) : null}
      </div>
    </div>
  );
}

function formatBadge(badge: NonNullable<ForumComment["author"]["badge"]>) {
  if (badge === "mod") return "Moderator";
  if (badge === "clinic") return "Clinic";
  if (badge === "partner") return "Partner";
  return "Volunteer";
}
