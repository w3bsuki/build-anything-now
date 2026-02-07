import { Flag, MessageSquare, Pin, ShieldCheck, ThumbsUp } from "lucide-react";
import { Link } from "react-router-dom";
import type { ForumThread } from "@/types";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ThreadListItemProps {
  thread: ForumThread;
  onToggleReaction: (thread: ForumThread) => void;
  onReport: (thread: ForumThread) => void;
}

export function ThreadListItem({ thread, onToggleReaction, onReport }: ThreadListItemProps) {
  const authorInitial = getAuthorInitials(thread.author.name);

  return (
    <article className="rounded-3xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <Avatar className="size-12 shrink-0 border border-border bg-muted">
          <AvatarImage src={thread.author.avatar ?? undefined} alt={thread.author.name} />
          <AvatarFallback className="text-sm font-semibold text-foreground">{authorInitial}</AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
            <span className="rounded-full border border-border bg-background px-2.5 py-1 font-medium text-foreground">
              {formatCategory(thread.category)}
            </span>
            {thread.cityTag ? <span>{thread.cityTag}</span> : null}
            <span>•</span>
            <span>{thread.timeAgo}</span>
            {thread.isPinned ? (
              <span className="inline-flex items-center gap-1">
                <Pin className="size-3" />
                Pinned
              </span>
            ) : null}
            {thread.isLocked ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-border bg-muted px-2 py-0.5 text-[11px] font-semibold text-foreground">
                Locked
              </span>
            ) : null}
          </div>

          <Link
            to={`/community/${thread.id}`}
            className="mt-2 block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring-strong focus-visible:ring-offset-2 focus-visible:ring-offset-card"
            aria-label={`Open thread ${thread.title}`}
          >
            <h3 className="line-clamp-2 text-lg font-semibold leading-tight text-foreground">{thread.title}</h3>
            <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-muted-foreground">{thread.preview}</p>
          </Link>

          <div className="mt-1 flex flex-wrap items-center gap-2 text-sm">
            <span className="font-medium text-foreground">{thread.author.name}</span>
            {thread.author.badge ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-border bg-chip-bg px-2 py-0.5 font-medium text-foreground">
                <ShieldCheck className="size-3" />
                {formatBadge(thread.author.badge)}
              </span>
            ) : null}
          </div>
        </div>

        <button
          type="button"
          onClick={() => onReport(thread)}
          className="inline-flex size-11 shrink-0 items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition-colors active:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring-strong"
          aria-label="Report thread"
        >
          <Flag className="size-4" />
        </button>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 border-t border-border/80 pt-3">
        <button
          type="button"
          onClick={() => onToggleReaction(thread)}
          className={cn(
            "inline-flex min-h-11 items-center justify-center gap-1.5 rounded-full border px-3 text-sm font-medium transition-colors",
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
        <Link
          to={`/community/${thread.id}`}
          className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-full border border-border bg-background px-3 text-sm font-medium text-foreground transition-colors active:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring-strong focus-visible:ring-offset-2 focus-visible:ring-offset-card"
          aria-label="Open replies"
        >
          <MessageSquare className="size-4" />
          {thread.replyCount}
        </Link>
      </div>
    </article>
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

function getAuthorInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "P";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
}
