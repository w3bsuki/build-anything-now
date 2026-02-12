import { Flag, Lock, MessageSquare, ShieldCheck, ThumbsUp } from "lucide-react";
import type { ForumThread } from "@/types";
import { cn } from "@/lib/utils";

interface ThreadDetailHeaderProps {
  thread: ForumThread;
  onToggleReaction: (thread: ForumThread) => void;
  onReport: (thread: ForumThread) => void;
}

export function ThreadDetailHeader({ thread, onToggleReaction, onReport }: ThreadDetailHeaderProps) {
  return (
    <section className="rounded-2xl border border-border/60 bg-surface-elevated shadow-xs p-4">
      <div className="flex items-start gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span className="rounded-full border border-border bg-background px-2 py-0.5 font-medium text-foreground">
              {formatCategory(thread.category)}
            </span>
            {thread.cityTag ? <span>{thread.cityTag}</span> : null}
            <span>•</span>
            <span>{thread.timeAgo}</span>
            {thread.isLocked ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 font-semibold text-foreground">
                <Lock className="size-3" />
                Locked
              </span>
            ) : null}
          </div>

          <h1 className="mt-2 text-xl font-semibold leading-tight text-foreground">{thread.title}</h1>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-foreground">{thread.content}</p>

          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
            <span className="font-medium text-foreground">{thread.author.name}</span>
            {thread.author.badge ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 font-medium text-primary">
                <ShieldCheck className="size-3" />
                {formatBadge(thread.author.badge)}
              </span>
            ) : null}
            {thread.author.city ? <span className="text-muted-foreground">{thread.author.city}</span> : null}
          </div>
        </div>

        <button
          type="button"
          onClick={() => onReport(thread)}
          className="inline-flex size-11 items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition-colors active:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring-strong"
          aria-label="Report thread"
        >
          <Flag className="size-4" />
        </button>
      </div>

      <div className="mt-4 flex items-center gap-2 border-t border-border pt-3">
        <button
          type="button"
          onClick={() => onToggleReaction(thread)}
          className={cn(
            "inline-flex min-h-11 items-center gap-1.5 rounded-full border px-3 text-sm font-medium transition-colors",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring-strong focus-visible:ring-offset-2 focus-visible:ring-offset-card",
            thread.viewerReacted
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-background text-foreground active:bg-muted"
          )}
          aria-label="React to thread"
        >
          <ThumbsUp className="size-4" />
          {thread.reactionCount}
        </button>

        <div className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-border bg-background px-3 text-sm font-medium text-foreground">
          <MessageSquare className="size-4" />
          {thread.replyCount}
        </div>
      </div>
    </section>
  );
}

function formatBadge(badge: NonNullable<ForumThread["author"]["badge"]>) {
  if (badge === "mod") return "Moderator";
  if (badge === "clinic") return "Clinic";
  if (badge === "partner") return "Partner";
  return "Volunteer";
}

function formatCategory(category: ForumThread["category"]) {
  if (category === "urgent_help") return "Urgent Help";
  if (category === "case_update") return "Case Update";
  if (category === "adoption") return "Adoption";
  if (category === "announcements") return "Announcements";
  if (category === "advice") return "Advice";
  return "General";
}
