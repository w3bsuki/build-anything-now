import { Send, X } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

interface CommentComposerProps {
  value: string;
  isSubmitting: boolean;
  isLocked: boolean;
  replyingTo: { id: string; name: string } | null;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onCancelReply: () => void;
}

export function CommentComposer({
  value,
  isSubmitting,
  isLocked,
  replyingTo,
  onChange,
  onSubmit,
  onCancelReply,
}: CommentComposerProps) {
  if (isLocked) {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background/95 px-3 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur-md">
        <div className="mx-auto max-w-2xl rounded-2xl border border-border/60 bg-surface-elevated shadow-xs px-3 py-2 text-sm text-muted-foreground">
          This thread is locked. New replies are disabled.
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background/95 px-3 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur-md">
      <div className="mx-auto max-w-2xl rounded-2xl border border-border/60 bg-surface-elevated shadow-xs p-2">
        {replyingTo ? (
          <div className="mb-2 flex items-center justify-between rounded-xl border border-border bg-background px-3 py-2 text-xs text-muted-foreground">
            <span>
              Replying to <span className="font-semibold text-foreground">{replyingTo.name}</span>
            </span>
            <button
              type="button"
              onClick={onCancelReply}
              className="inline-flex size-8 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-colors active:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring-strong"
              aria-label="Cancel reply"
            >
              <X className="size-4" />
            </button>
          </div>
        ) : null}

        <div className="flex items-end gap-2">
          <Textarea
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder={replyingTo ? `Write a reply to ${replyingTo.name}` : "Write a reply"}
            className="min-h-24 rounded-xl bg-background text-base"
          />
          <button
            type="button"
            onClick={onSubmit}
            disabled={isSubmitting || value.trim().length === 0}
            className="inline-flex size-11 items-center justify-center rounded-full border border-border bg-primary text-primary-foreground transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring-strong"
            aria-label="Send reply"
          >
            <Send className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
