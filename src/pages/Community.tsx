import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Search, SlidersHorizontal } from "lucide-react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { ForumFilters } from "@/components/community/forum-filters";
import { ThreadListItem } from "@/components/community/thread-list-item";
import { CATEGORY_OPTIONS, REPORT_REASON_OPTIONS, SORT_OPTIONS } from "@/components/community/forum-config";
import { useForumBackendMode } from "@/hooks/useForumBackendMode";
import type { ForumBoard, ForumCategory, ForumReportPayload, ForumSort, ForumThread } from "@/types";

const DRAFT_STORAGE_KEY = "pawtreon.community.thread-draft.v1";

type ThreadDraft = {
  board: ForumBoard;
  category: ForumCategory;
  title: string;
  body: string;
  cityTag: string;
  caseId: string;
  externalSourceUrl: string;
};

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

const DEFAULT_DRAFT: ThreadDraft = {
  board: "rescue",
  category: "urgent_help",
  title: "",
  body: "",
  cityTag: "",
  caseId: "",
  externalSourceUrl: "",
};

const AVATAR_PREVIEW_NAMES = [
  "Alex",
  "Mila",
  "Niki",
  "Petya",
  "Raya",
  "Teo",
  "Dani",
  "Elena",
  "Kris",
  "Lina",
  "Boris",
  "Viki",
  "Iva",
  "Misho",
  "Ani",
  "Georgi",
  "Marta",
  "Stefan",
  "Valya",
  "Koko",
  "Zara",
  "Toni",
  "Maya",
  "Pavel",
  "Rosi",
  "Simeon",
  "Emi",
  "Kristin",
  "Sava",
  "Dora",
  "Nora",
  "Plamen",
];
const AVATAR_RAIL_LIMIT = 24;

export default function Community() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();
  const backendMode = useForumBackendMode();

  const [board, setBoard] = useState<ForumBoard>("rescue");
  const [category, setCategory] = useState<"all" | ForumCategory>("all");
  const [cityFilter, setCityFilter] = useState("all");
  const [sort, setSort] = useState<ForumSort>("local_recent");
  const [search, setSearch] = useState("");

  const [composerOpen, setComposerOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [submittingThread, setSubmittingThread] = useState(false);
  const [draft, setDraft] = useState<ThreadDraft>(DEFAULT_DRAFT);

  const [reportOpen, setReportOpen] = useState(false);
  const [reportTarget, setReportTarget] = useState<Pick<ForumReportPayload, "targetId" | "targetType"> | null>(null);
  const [reportReason, setReportReason] = useState<ForumReportPayload["reason"]>("spam");
  const [reportDetails, setReportDetails] = useState("");
  const [submittingReport, setSubmittingReport] = useState(false);

  const createThread = useMutation(api.community.createThread);
  const createLegacyThread = useMutation(api.community.create);
  const toggleReaction = useMutation(api.community.toggleReaction);
  const likeLegacyThread = useMutation(api.community.like);
  const reportContent = useMutation(api.community.reportContent);

  const v2Query = useQuery(
    api.community.listThreads,
    backendMode === "v2"
      ? {
          board,
          category,
          city: cityFilter,
          sort,
          search: search.trim() || undefined,
          limit: 60,
        }
      : "skip"
  );

  const legacyQuery = useQuery(
    api.community.list,
    backendMode === "legacy"
      ? {
          limit: 200,
        }
      : "skip"
  ) as LegacyCommunityPost[] | undefined;

  const isLoading =
    backendMode === "checking" || (backendMode === "v2" ? v2Query === undefined : legacyQuery === undefined);

  const threads = useMemo(() => {
    if (backendMode === "v2") {
      return ((v2Query?.threads ?? []) as ForumThread[]).slice();
    }

    const mapped = mapLegacyPosts(legacyQuery ?? [], board);
    return applyLegacyFilters(mapped, {
      category,
      cityFilter,
      search,
      sort,
    });
  }, [backendMode, board, category, cityFilter, legacyQuery, search, sort, v2Query?.threads]);

  const cityOptions = backendMode === "v2" ? v2Query?.meta.cityOptions ?? [] : [];
  const threadCount = backendMode === "v2" ? v2Query?.meta.total ?? threads.length : threads.length;
  const activeFilterCount = Number(category !== "all") + Number(cityFilter !== "all");
  const topAuthors = useMemo(() => {
    const grouped = new Map<string, { id: string; name: string; avatar: string | null; score: number }>();

    for (const thread of threads) {
      const id = thread.author.id ?? thread.author.name;
      const score = Math.max(1, thread.reactionCount + thread.replyCount * 2);
      const existing = grouped.get(id);

      if (existing) {
        existing.score += score;
      } else {
        grouped.set(id, {
          id,
          name: thread.author.name,
          avatar: thread.author.avatar ?? null,
          score,
        });
      }
    }

    return Array.from(grouped.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, AVATAR_RAIL_LIMIT);
  }, [threads]);

  const avatarRailUsers = useMemo(() => {
    const base = [...topAuthors];
    const used = new Set(base.map((author) => author.name.toLowerCase()));

    for (const name of AVATAR_PREVIEW_NAMES) {
      if (base.length >= AVATAR_RAIL_LIMIT) break;
      if (used.has(name.toLowerCase())) continue;
      base.push({
        id: `preview-${name.toLowerCase()}`,
        name,
        avatar: null,
        score: 0,
      });
      used.add(name.toLowerCase());
    }

    return base;
  }, [topAuthors]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as Partial<ThreadDraft>;
      if (!parsed || typeof parsed !== "object") return;
      setDraft((previous) => ({
        ...previous,
        ...parsed,
        board: parsed.board === "community" ? "community" : "rescue",
        category: isForumCategory(parsed.category) ? parsed.category : previous.category,
      }));
    } catch {
      // ignore malformed drafts
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
  }, [draft]);

  const handleBoardChange = (nextBoard: ForumBoard) => {
    setBoard(nextBoard);
    setCategory("all");
  };

  useEffect(() => {
    if (searchParams.get("compose") !== "1") return;

    setDraft((previous) => ({
      ...previous,
      board,
      category: pickDefaultCategory(board),
    }));
    setComposerOpen(true);

    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete("compose");
    setSearchParams(nextParams, { replace: true });
  }, [board, searchParams, setSearchParams]);

  const handleCreateThread = async () => {
    if (!draft.title.trim() || !draft.body.trim()) {
      toast({ title: "Title and body are required." });
      return;
    }

    setSubmittingThread(true);
    try {
      let threadId: string;

      if (backendMode === "v2") {
        threadId = await createThread({
          board: draft.board,
          category: draft.category,
          title: draft.title.trim(),
          content: draft.body.trim(),
          cityTag: draft.cityTag.trim() || undefined,
          caseId: draft.caseId.trim() || undefined,
          externalSourceUrl: draft.externalSourceUrl.trim() || undefined,
        });
      } else {
        threadId = await createLegacyThread({
          content: buildLegacyThreadContent(draft),
          externalSourceUrl: draft.externalSourceUrl.trim() || undefined,
        });
      }

      setComposerOpen(false);
      setDraft(DEFAULT_DRAFT);
      localStorage.removeItem(DRAFT_STORAGE_KEY);
      toast({
        title: "Thread published",
        description:
          backendMode === "legacy" ? "Running in compatibility mode until community v2 backend is published." : undefined,
      });
      navigate(`/community/${threadId}`);
    } catch (error) {
      toast({
        title: "Could not publish thread",
        description: error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setSubmittingThread(false);
    }
  };

  const handleThreadReaction = async (thread: ForumThread) => {
    try {
      if (backendMode === "v2") {
        await toggleReaction({
          targetType: "post",
          targetId: thread.id,
        });
      } else {
        await likeLegacyThread({ id: thread.id as Id<"communityPosts"> });
      }
    } catch (error) {
      toast({
        title: "Could not update reaction",
        description: error instanceof Error ? error.message : "Please try again.",
      });
    }
  };

  const handleOpenReport = (thread: ForumThread) => {
    if (backendMode !== "v2") {
      toast({
        title: "Reporting unavailable in compatibility mode",
        description: "Publish the community v2 Convex functions to enable reporting.",
      });
      return;
    }

    setReportTarget({ targetId: thread.id, targetType: "post" });
    setReportReason("spam");
    setReportDetails("");
    setReportOpen(true);
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

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-8 md:pt-16">
      <div className="mx-auto w-full max-w-3xl px-4 py-4">
        <div className="space-y-2">
          <section className="space-y-2">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-foreground/50" />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={`${t("community.searchThreads", "Search threads")} ${threadCount}`}
                className="h-11 w-full rounded-full border border-search-border bg-search-bg pl-10 pr-14 text-base font-normal text-foreground placeholder:text-muted-foreground/70 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring-strong focus-visible:ring-offset-2 focus-visible:ring-offset-background md:text-sm"
              />
              <button
                type="button"
                onClick={() => setFiltersOpen(true)}
                className="absolute right-1.5 top-1/2 inline-flex size-8 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition-colors active:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring-strong"
                aria-label={
                  activeFilterCount > 0
                    ? `${t("clinics.filters", "Filters")} (${activeFilterCount})`
                    : t("clinics.filters", "Filters")
                }
              >
                <SlidersHorizontal className="size-3.5" />
                {activeFilterCount > 0 ? (
                  <span className="absolute -right-0.5 -top-0.5 inline-flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
                    {activeFilterCount}
                  </span>
                ) : null}
              </button>
            </div>

            {avatarRailUsers.length > 0 ? (
              <div className="space-y-2 pb-1">
                <p className="text-xs font-medium text-muted-foreground">{t("community.topUsers", "Top users")}</p>
                <div className="overflow-x-auto">
                  <div className="flex gap-2 pb-0.5">
                    {avatarRailUsers.map((author) => (
                      <Link
                        key={author.id}
                        to="/community/members"
                        className="inline-flex shrink-0 items-center justify-center rounded-full p-0.5 transition-colors active:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring-strong"
                        aria-label={`Open members - ${author.name}`}
                      >
                        <Avatar className="size-12 border border-border bg-muted shadow-sm">
                          <AvatarImage src={author.avatar ?? undefined} alt={author.name} />
                          <AvatarFallback className="text-xs font-semibold text-foreground">
                            {getAuthorInitials(author.name)}
                          </AvatarFallback>
                        </Avatar>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}

            {backendMode === "legacy" ? (
              <p className="text-[11px] text-muted-foreground">
                Compatibility mode: community v2 backend not published yet.
              </p>
            ) : null}
          </section>

          <div className="hidden md:block md:sticky md:top-16 md:z-30 md:rounded-2xl md:bg-background/95 md:py-1 md:backdrop-blur-md">
            <ForumFilters
              board={board}
              cityFilter={cityFilter}
              categoryFilter={category}
              sort={sort}
              cityOptions={cityOptions}
              onCityFilterChange={setCityFilter}
              onCategoryFilterChange={setCategory}
              onSortChange={setSort}
            />
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="h-36 animate-pulse rounded-2xl border border-border/60 bg-surface-elevated shadow-xs" />
              ))}
            </div>
          ) : threads.length === 0 ? (
            <div className="rounded-2xl border border-border/60 bg-surface-elevated shadow-xs p-6 text-center text-sm text-muted-foreground">
              No threads found. Start the first discussion.
            </div>
          ) : (
            <div className="space-y-3">
              {threads.map((thread) => (
                <ThreadListItem
                  key={thread.id}
                  thread={thread}
                  onToggleReaction={handleThreadReaction}
                  onReport={handleOpenReport}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <Sheet open={composerOpen} onOpenChange={setComposerOpen}>
        <SheetContent side="bottom" className="rounded-t-2xl px-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] md:max-w-2xl md:mx-auto">
          <SheetHeader className="text-left">
            <SheetTitle>Create thread</SheetTitle>
            <SheetDescription>Post a rescue or community discussion thread.</SheetDescription>
          </SheetHeader>

          <div className="mt-4 space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <label className="space-y-1">
                <span className="text-xs font-medium text-muted-foreground">Board</span>
                <select
                  value={draft.board}
                  onChange={(event) => {
                    const nextBoard = event.target.value === "community" ? "community" : "rescue";
                    setDraft((previous) => ({
                      ...previous,
                      board: nextBoard,
                      category: pickDefaultCategory(nextBoard),
                    }));
                  }}
                  className="min-h-11 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring-strong"
                >
                  <option value="rescue">Rescue</option>
                  <option value="community">Community</option>
                </select>
              </label>
              <label className="space-y-1">
                <span className="text-xs font-medium text-muted-foreground">Category</span>
                <select
                  value={draft.category}
                  onChange={(event) =>
                    setDraft((previous) => ({
                      ...previous,
                      category: event.target.value as ForumCategory,
                    }))
                  }
                  className="min-h-11 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring-strong"
                >
                  {CATEGORY_OPTIONS[draft.board].map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="space-y-1">
              <Label htmlFor="thread-title">Title</Label>
              <Input
                id="thread-title"
                value={draft.title}
                onChange={(event) => setDraft((previous) => ({ ...previous, title: event.target.value }))}
                placeholder="Thread title"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="thread-body">Body</Label>
              <Textarea
                id="thread-body"
                value={draft.body}
                onChange={(event) => setDraft((previous) => ({ ...previous, body: event.target.value }))}
                placeholder="Describe what you need or want to discuss"
                className="min-h-32"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label htmlFor="thread-city">City tag (optional)</Label>
                <Input
                  id="thread-city"
                  value={draft.cityTag}
                  onChange={(event) => setDraft((previous) => ({ ...previous, cityTag: event.target.value }))}
                  placeholder="Sofia"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="thread-case">Case ID (optional)</Label>
                <Input
                  id="thread-case"
                  value={draft.caseId}
                  onChange={(event) => setDraft((previous) => ({ ...previous, caseId: event.target.value }))}
                  placeholder="k17..."
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="thread-external-source">
                {t("externalSources.fieldLabel", "Source link (optional)")}
              </Label>
              <Input
                id="thread-external-source"
                type="url"
                value={draft.externalSourceUrl}
                onChange={(event) => setDraft((previous) => ({ ...previous, externalSourceUrl: event.target.value }))}
                placeholder={t(
                  "externalSources.fieldPlaceholder",
                  "Paste a Facebook, Instagram, or other public source URL"
                )}
                className="text-base"
              />
            </div>
          </div>

          <SheetFooter className="mt-4">
            <Button
              onClick={handleCreateThread}
              disabled={submittingThread}
              className="min-h-11 w-full rounded-xl text-sm font-semibold"
            >
              {submittingThread ? "Publishing..." : "Publish thread"}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
        <SheetContent
          side="bottom"
          className="rounded-t-2xl px-4 pb-[calc(env(safe-area-inset-bottom)+1rem)]"
        >
          <SheetHeader className="text-left">
            <SheetTitle>{t("clinics.filters", "Filters")}</SheetTitle>
            <SheetDescription>Refine threads by location, category, and sort.</SheetDescription>
          </SheetHeader>
          <div className="mt-4 space-y-4">
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">Board</p>
              <div className="inline-flex items-center rounded-full border border-border bg-chip-bg p-1">
                <button
                  type="button"
                  onClick={() => handleBoardChange("rescue")}
                  className={`inline-flex min-h-9 items-center rounded-full px-3 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring-strong focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                    board === "rescue"
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground active:bg-background"
                  }`}
                >
                  Rescue
                </button>
                <button
                  type="button"
                  onClick={() => handleBoardChange("community")}
                  className={`inline-flex min-h-9 items-center rounded-full px-3 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring-strong focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                    board === "community"
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground active:bg-background"
                  }`}
                >
                  Community
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">Sort</p>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {SORT_OPTIONS.map((option) => {
                  const isActive = sort === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setSort(option.value)}
                      className={`inline-flex min-h-9 items-center whitespace-nowrap rounded-full border px-3 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring-strong ${
                        isActive
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-background text-foreground active:bg-muted"
                      }`}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <ForumFilters
              board={board}
              cityFilter={cityFilter}
              categoryFilter={category}
              sort={sort}
              cityOptions={cityOptions}
              dense
              showSort={false}
              onCityFilterChange={setCityFilter}
              onCategoryFilterChange={setCategory}
              onSortChange={setSort}
            />
          </div>
          <SheetFooter className="mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setFiltersOpen(false)}
              className="min-h-11 w-full rounded-xl text-sm font-semibold"
            >
              Apply
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <Sheet open={reportOpen} onOpenChange={setReportOpen}>
        <SheetContent side="bottom" className="rounded-t-2xl px-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] md:max-w-xl md:mx-auto">
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
            <Button
              onClick={handleSubmitReport}
              disabled={submittingReport || reportTarget === null || backendMode !== "v2"}
              className="min-h-11 w-full rounded-xl text-sm font-semibold"
            >
              {submittingReport ? "Submitting..." : "Submit report"}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}

function getAuthorInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "U";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
}

function isForumCategory(value: unknown): value is ForumCategory {
  return (
    value === "urgent_help" ||
    value === "case_update" ||
    value === "adoption" ||
    value === "advice" ||
    value === "general" ||
    value === "announcements"
  );
}

function pickDefaultCategory(board: ForumBoard): ForumCategory {
  return board === "rescue" ? "urgent_help" : "general";
}

function buildLegacyThreadContent(draft: ThreadDraft) {
  const title = draft.title.trim();
  const body = draft.body.trim();
  const city = draft.cityTag.trim();
  const caseRef = draft.caseId.trim();
  const externalSource = draft.externalSourceUrl.trim();

  const suffix = [
    city ? `City: ${city}` : null,
    caseRef ? `Case: ${caseRef}` : null,
    externalSource ? `Source: ${externalSource}` : null,
    `Board: ${draft.board}`,
    `Category: ${draft.category}`,
  ]
    .filter(Boolean)
    .join(" | ");

  return `${title}\n\n${body}${suffix ? `\n\n${suffix}` : ""}`;
}

function mapLegacyPosts(posts: LegacyCommunityPost[], board: ForumBoard): ForumThread[] {
  return posts.map((post) => {
    const content = (post.content || "").trim();
    const [firstLine, ...rest] = content.split(/\r?\n/);
    const title = (firstLine || "Community thread").trim().slice(0, 140) || "Community thread";
    const previewSource = rest.join(" ").trim() || content;
    const preview = previewSource.replace(/\s+/g, " ").slice(0, 220);
    const createdAt = typeof post.createdAt === "number" ? post.createdAt : Date.now();

    return {
      id: post._id,
      board,
      category: board === "rescue" ? "urgent_help" : "general",
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
    } satisfies ForumThread;
  });
}

function applyLegacyFilters(
  threads: ForumThread[],
  filters: {
    category: "all" | ForumCategory;
    cityFilter: string;
    search: string;
    sort: ForumSort;
  }
) {
  const searchTerm = filters.search.trim().toLowerCase();
  const category = filters.category;

  let filtered = threads.filter((thread) => {
    if (category !== "all" && thread.category !== category) return false;

    if (filters.cityFilter !== "all" && filters.cityFilter !== "nearby") {
      if ((thread.cityTag ?? "").toLowerCase() !== filters.cityFilter.toLowerCase()) return false;
    }

    if (!searchTerm) return true;

    return (
      thread.title.toLowerCase().includes(searchTerm) ||
      thread.content.toLowerCase().includes(searchTerm) ||
      thread.preview.toLowerCase().includes(searchTerm)
    );
  });

  filtered = filtered.sort((a, b) => {
    if (filters.sort === "top") {
      const scoreA = a.reactionCount + a.replyCount * 2;
      const scoreB = b.reactionCount + b.replyCount * 2;
      if (scoreA !== scoreB) return scoreB - scoreA;
      return b.createdAt - a.createdAt;
    }

    return b.createdAt - a.createdAt;
  });

  return filtered;
}
