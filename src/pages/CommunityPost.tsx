import { useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Lock, Unlock } from "lucide-react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { useToast } from "@/components/ui/use-toast";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { CommentComposer } from "@/components/community/comment-composer";
import { CommentThread } from "@/components/community/comment-thread";
import { ThreadDetailHeader } from "@/components/community/thread-detail-header";
import { REPORT_REASON_OPTIONS } from "@/components/community/forum-config";
import { ExternalLinkCard } from "@/components/common/ExternalLinkCard";
import { useForumBackendMode } from "@/hooks/useForumBackendMode";
import type { ForumComment, ForumReportPayload, ForumThread } from "@/types";

type LegacyCommunityPost = {
  _id: string;
  content: string;
  image?: string;
  likes: number;
  commentsCount: number;
  createdAt: number;
  author?: {
    id?: string | null;
    name?: string;
    avatar?: string | null;
    isVolunteer?: boolean;
  };
  timeAgo?: string;
};

export default function CommunityPost() {
  const { t } = useTranslation();
  const { postId } = useParams();
  const { toast } = useToast();
  const backendMode = useForumBackendMode();

  const [composerValue, setComposerValue] = useState("");
  const [replyingTo, setReplyingTo] = useState<{ id: string; name: string } | null>(null);
  const [submittingComment, setSubmittingComment] = useState(false);

  const [reportOpen, setReportOpen] = useState(false);
  const [reportTarget, setReportTarget] = useState<Pick<ForumReportPayload, "targetId" | "targetType"> | null>(null);
  const [reportReason, setReportReason] = useState<ForumReportPayload["reason"]>("spam");
  const [reportDetails, setReportDetails] = useState("");
  const [submittingReport, setSubmittingReport] = useState(false);
  const [togglingLock, setTogglingLock] = useState(false);

  const threadId = postId as Id<"communityPosts"> | undefined;
  const threadV2: ForumThread | null | undefined = useQuery(
    api.community.getThread,
    backendMode === "v2" && threadId ? { id: threadId } : "skip"
  ) as ForumThread | null | undefined;
  const threadLegacy: LegacyCommunityPost | null | undefined = useQuery(
    api.community.get,
    backendMode === "legacy" && threadId ? { id: threadId } : "skip"
  ) as LegacyCommunityPost | null | undefined;
  const commentsV2: ForumComment[] | undefined = useQuery(
    api.community.listComments,
    backendMode === "v2" && threadId ? { postId: threadId } : "skip"
  ) as ForumComment[] | undefined;
  const currentUser = useQuery(api.users.me);

  const createComment = useMutation(api.community.createComment);
  const deleteComment = useMutation(api.community.deleteComment);
  const toggleReaction = useMutation(api.community.toggleReaction);
  const likeLegacyThread = useMutation(api.community.like);
  const reportContent = useMutation(api.community.reportContent);
  const lockThread = useMutation(api.community.lockThread);

  const thread: ForumThread | null | undefined = useMemo(() => {
    if (backendMode === "v2") return threadV2;
    if (backendMode === "legacy") {
      if (threadLegacy === null) return null;
      if (threadLegacy === undefined) return undefined;
      return mapLegacyPostToThread(threadLegacy);
    }
    return undefined;
  }, [backendMode, threadLegacy, threadV2]);
  const comments = backendMode === "v2" ? commentsV2 : [];

  const canModerate = backendMode === "v2" && currentUser?.role === "admin";

  const openReport = (targetType: "post" | "comment", targetId: string) => {
    if (backendMode !== "v2") {
      toast({
        title: "Reporting unavailable in compatibility mode",
        description: "Publish the community v2 Convex functions to enable reporting.",
      });
      return;
    }

    setReportTarget({ targetType, targetId });
    setReportReason("spam");
    setReportDetails("");
    setReportOpen(true);
  };

  const handleSubmitComment = async () => {
    if (backendMode !== "v2") {
      toast({
        title: "Replies unavailable in compatibility mode",
        description: "Publish community v2 backend functions to enable replies.",
      });
      return;
    }

    if (!thread) return;
    if (!composerValue.trim()) return;

    setSubmittingComment(true);
    try {
      await createComment({
        postId: thread.id as Id<"communityPosts">,
        content: composerValue.trim(),
        parentCommentId: replyingTo ? (replyingTo.id as Id<"communityComments">) : undefined,
      });

      setComposerValue("");
      setReplyingTo(null);
    } catch (error) {
      toast({
        title: "Could not post reply",
        description: error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleToggleThreadReaction = async (targetThread: ForumThread) => {
    try {
      if (backendMode === "v2") {
        await toggleReaction({
          targetType: "post",
          targetId: targetThread.id,
        });
      } else {
        await likeLegacyThread({ id: targetThread.id as Id<"communityPosts"> });
      }
    } catch (error) {
      toast({
        title: "Could not update reaction",
        description: error instanceof Error ? error.message : "Please try again.",
      });
    }
  };

  const handleToggleCommentReaction = async (comment: ForumComment) => {
    if (backendMode !== "v2") return;

    try {
      await toggleReaction({
        targetType: "comment",
        targetId: comment.id,
      });
    } catch (error) {
      toast({
        title: "Could not update reaction",
        description: error instanceof Error ? error.message : "Please try again.",
      });
    }
  };

  const handleDeleteComment = async (comment: ForumComment) => {
    if (backendMode !== "v2") return;

    try {
      await deleteComment({
        commentId: comment.id as Id<"communityComments">,
      });
      if (replyingTo?.id === comment.id) {
        setReplyingTo(null);
      }
    } catch (error) {
      toast({
        title: "Could not delete reply",
        description: error instanceof Error ? error.message : "Please try again.",
      });
    }
  };

  const handleSubmitReport = async () => {
    if (!reportTarget || backendMode !== "v2") return;

    setSubmittingReport(true);
    try {
      await reportContent({
        targetType: reportTarget.targetType,
        targetId: reportTarget.targetId,
        reason: reportReason,
        details: reportDetails.trim() || undefined,
      });
      setReportOpen(false);
      toast({ title: "Report submitted. Thank you." });
    } catch (error) {
      toast({
        title: "Could not submit report",
        description: error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setSubmittingReport(false);
    }
  };

  const handleToggleLock = async () => {
    if (!thread || !canModerate || backendMode !== "v2") return;

    setTogglingLock(true);
    try {
      await lockThread({
        id: thread.id as Id<"communityPosts">,
        locked: !thread.isLocked,
      });
      toast({ title: thread.isLocked ? "Thread unlocked" : "Thread locked" });
    } catch (error) {
      toast({
        title: "Could not update lock state",
        description: error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setTogglingLock(false);
    }
  };

  if (!threadId) {
    return (
      <div className="min-h-screen bg-background pb-24 md:pt-16">
        <div className="mx-auto w-full max-w-3xl px-4 py-6">
          <div className="rounded-2xl border border-border/60 bg-surface-elevated shadow-xs p-6 text-center">
            <p className="text-sm text-muted-foreground">Thread not found.</p>
            <Link
              to="/community"
              className="mt-3 inline-flex min-h-11 items-center justify-center rounded-xl border border-border bg-background px-4 text-sm font-semibold text-foreground active:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring-strong"
            >
              Back to community
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (backendMode === "checking" || thread === undefined) {
    return (
      <div className="min-h-screen bg-background pb-24 md:pt-16">
        <div className="mx-auto w-full max-w-3xl px-4 py-4">
          <div className="space-y-3">
            <div className="h-52 animate-pulse rounded-2xl border border-border/60 bg-surface-elevated shadow-xs" />
            <div className="h-28 animate-pulse rounded-2xl border border-border/60 bg-surface-elevated shadow-xs" />
            <div className="h-28 animate-pulse rounded-2xl border border-border/60 bg-surface-elevated shadow-xs" />
          </div>
        </div>
      </div>
    );
  }

  if (thread === null) {
    return (
      <div className="min-h-screen bg-background pb-24 md:pt-16">
        <div className="mx-auto w-full max-w-3xl px-4 py-6">
          <div className="rounded-2xl border border-border/60 bg-surface-elevated shadow-xs p-6 text-center">
            <p className="text-sm text-muted-foreground">Thread not found or unavailable.</p>
            <Link
              to="/community"
              className="mt-3 inline-flex min-h-11 items-center justify-center rounded-xl border border-border bg-background px-4 text-sm font-semibold text-foreground active:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring-strong"
            >
              Back to community
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-44 md:pb-8 md:pt-16">
      <div className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-md md:hidden">
        <div className="mx-auto flex h-14 max-w-3xl items-center gap-2 px-3">
          <Link
            to="/community"
            className="inline-flex size-11 items-center justify-center rounded-full border border-border bg-card text-foreground active:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring-strong"
            aria-label="Back to community"
          >
            <ArrowLeft className="size-5" />
          </Link>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-foreground">Thread</p>
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-3xl px-4 py-4">
        <div className="space-y-3">
          {backendMode === "legacy" ? (
            <div className="rounded-2xl border border-border/60 bg-surface-elevated shadow-xs px-3 py-2 text-xs text-muted-foreground">
              Compatibility mode active: forum replies, reports, and moderation will unlock after publishing community v2 functions.
            </div>
          ) : null}

          <div className="hidden md:block">
            <Link
              to="/community"
              className="inline-flex min-h-11 items-center gap-2 rounded-2xl border border-border/60 bg-surface-elevated shadow-xs px-3 text-sm font-semibold text-foreground active:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring-strong"
            >
              <ArrowLeft className="size-4" />
              Back to community
            </Link>
          </div>

          <ThreadDetailHeader
            thread={thread}
            onToggleReaction={handleToggleThreadReaction}
            onReport={(targetThread) => openReport("post", targetThread.id)}
          />

          {thread.image ? (
            <div className="overflow-hidden rounded-2xl border border-border/60 bg-surface-elevated shadow-xs">
              <img src={thread.image} alt={thread.title} className="max-h-[420px] w-full object-cover" />
            </div>
          ) : null}

          {thread.caseId ? (
            <div className="rounded-2xl border border-border/60 bg-surface-elevated shadow-xs p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Linked case</p>
              <Link
                to={`/case/${thread.caseId}`}
                className="mt-2 inline-flex min-h-11 items-center rounded-xl border border-border bg-background px-3 text-sm font-semibold text-foreground active:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring-strong"
              >
                Open case
              </Link>
            </div>
          ) : null}

          {thread.externalSource ? (
            <div className="rounded-2xl border border-border/60 bg-surface-elevated shadow-xs p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {t("externalSources.sourceAttribution", "Source attribution")}
              </p>
              <ExternalLinkCard source={thread.externalSource} className="mt-2" />
            </div>
          ) : null}

          {canModerate ? (
            <div className="rounded-2xl border border-border/60 bg-surface-elevated shadow-xs p-3">
              <button
                type="button"
                onClick={handleToggleLock}
                disabled={togglingLock}
                className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-border bg-background px-3 text-sm font-semibold text-foreground transition-colors active:bg-muted disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring-strong"
              >
                {thread.isLocked ? <Unlock className="size-4" /> : <Lock className="size-4" />}
                {togglingLock ? "Saving..." : thread.isLocked ? "Unlock thread" : "Lock thread"}
              </button>
            </div>
          ) : null}

          {backendMode === "v2" && comments === undefined ? (
            <div className="space-y-2">
              <div className="h-24 animate-pulse rounded-2xl border border-border/60 bg-surface-elevated shadow-xs" />
              <div className="h-24 animate-pulse rounded-2xl border border-border/60 bg-surface-elevated shadow-xs" />
            </div>
          ) : backendMode === "v2" ? (
            <CommentThread
              comments={comments ?? []}
              canModerate={canModerate}
              currentUserId={currentUser?._id ?? null}
              onReply={(comment) => {
                if (comment.isDeleted) return;
                setReplyingTo({ id: comment.id, name: comment.author.name });
              }}
              onToggleReaction={handleToggleCommentReaction}
              onReport={(comment) => openReport("comment", comment.id)}
              onDelete={handleDeleteComment}
            />
          ) : (
            <section className="rounded-2xl border border-border/60 bg-surface-elevated shadow-xs p-4 text-sm text-muted-foreground">
              Replies will appear here after the community v2 backend is published.
            </section>
          )}
        </div>
      </div>

      {backendMode === "v2" ? (
        <CommentComposer
          value={composerValue}
          isSubmitting={submittingComment}
          isLocked={thread.isLocked}
          replyingTo={replyingTo}
          onChange={setComposerValue}
          onSubmit={handleSubmitComment}
          onCancelReply={() => setReplyingTo(null)}
        />
      ) : (
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background/95 px-3 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur-md">
          <div className="mx-auto max-w-2xl rounded-2xl border border-border/60 bg-surface-elevated shadow-xs px-3 py-2 text-sm text-muted-foreground">
            Community v2 publish is pending. Replies are temporarily disabled.
          </div>
        </div>
      )}

      <Sheet open={reportOpen} onOpenChange={setReportOpen}>
        <SheetContent
          side="bottom"
          className="rounded-t-2xl px-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] md:mx-auto md:max-w-xl"
        >
          <SheetHeader className="text-left">
            <SheetTitle>Report content</SheetTitle>
            <SheetDescription>Help us keep the forum safe and trustworthy.</SheetDescription>
          </SheetHeader>

          <div className="mt-4 space-y-2">
            {REPORT_REASON_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setReportReason(option.value)}
                className={`inline-flex min-h-11 w-full items-center rounded-xl border px-3 text-left text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring-strong ${
                  reportReason === option.value
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-foreground active:bg-muted"
                }`}
              >
                {option.label}
              </button>
            ))}
            <Textarea
              value={reportDetails}
              onChange={(event) => setReportDetails(event.target.value)}
              placeholder="Optional details"
              className="min-h-24"
            />
          </div>

          <SheetFooter className="mt-4">
            <button
              type="button"
              onClick={handleSubmitReport}
              disabled={submittingReport || reportTarget === null || backendMode !== "v2"}
              className="inline-flex min-h-11 w-full items-center justify-center rounded-xl border border-border bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring-strong"
            >
              {submittingReport ? "Submitting..." : "Submit report"}
            </button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}

function mapLegacyPostToThread(post: LegacyCommunityPost): ForumThread {
  const content = (post.content || "").trim();
  const [firstLine, ...rest] = content.split(/\r?\n/);
  const title = (firstLine || "Community thread").trim().slice(0, 140) || "Community thread";
  const previewSource = rest.join(" ").trim() || content;
  const preview = previewSource.replace(/\s+/g, " ").slice(0, 220);
  const createdAt = typeof post.createdAt === "number" ? post.createdAt : Date.now();

  return {
    id: post._id,
    board: "community",
    category: "general",
    title,
    content,
    preview,
    image: post.image ?? null,
    cityTag: null,
    caseId: null,
    isPinned: false,
    isLocked: false,
    isDeleted: false,
    reactionCount: post.likes ?? 0,
    replyCount: post.commentsCount ?? 0,
    createdAt,
    lastActivityAt: createdAt,
    timeAgo: post.timeAgo || "recent",
    viewerReacted: false,
    author: {
      id: post.author?.id ?? null,
      name: post.author?.name || "Community member",
      avatar: post.author?.avatar ?? null,
      city: null,
      badge: post.author?.isVolunteer ? "volunteer" : null,
    },
  };
}
