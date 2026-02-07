import { PlusCircle } from "lucide-react";
import type { ForumBoard } from "@/types";
import { BOARD_OPTIONS } from "./forum-config";
import { cn } from "@/lib/utils";

interface ForumHeaderProps {
  board: ForumBoard;
  threadCount: number;
  compact?: boolean;
  onBoardChange: (board: ForumBoard) => void;
  onOpenComposer?: () => void;
  showComposerButton?: boolean;
  showComposerOnMobile?: boolean;
}

export function ForumHeader({
  board,
  threadCount,
  compact = false,
  onBoardChange,
  onOpenComposer,
  showComposerButton = true,
  showComposerOnMobile = true,
}: ForumHeaderProps) {
  return (
    <section className={cn("rounded-3xl border border-border bg-card", compact ? "p-3" : "p-4")}>
      <div className="flex items-center justify-between gap-3">
        <div className="inline-flex rounded-2xl border border-border bg-chip-bg p-1">
          {BOARD_OPTIONS.map((option) => {
            const isActive = option.value === board;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => onBoardChange(option.value)}
                className={cn(
                  "rounded-xl transition-colors",
                  compact ? "min-h-9 min-w-24 px-3 text-sm font-semibold" : "min-h-11 min-w-24 px-3 text-sm font-semibold",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring-strong focus-visible:ring-offset-2 focus-visible:ring-offset-card",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "bg-transparent text-muted-foreground active:bg-background"
                )}
              >
                {option.label}
              </button>
            );
          })}
        </div>

        {showComposerButton ? (
          <button
            type="button"
            onClick={onOpenComposer}
            disabled={!onOpenComposer}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-xl border border-border bg-background text-foreground transition-colors active:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring-strong focus-visible:ring-offset-2 focus-visible:ring-offset-card disabled:pointer-events-none disabled:opacity-60",
              compact ? "min-h-9 px-2.5 text-sm font-semibold" : "min-h-11 px-3 text-sm font-semibold",
              !showComposerOnMobile && "hidden md:inline-flex"
            )}
          >
            <PlusCircle className={compact ? "size-3.5" : "size-4"} />
            New Thread
          </button>
        ) : null}
      </div>

      <p className={cn("mt-2 text-muted-foreground", compact ? "text-xs" : "text-sm")}>{threadCount} threads</p>
    </section>
  );
}
