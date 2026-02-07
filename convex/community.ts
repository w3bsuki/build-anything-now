import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import { requireUser, optionalUser } from "./lib/auth";
import type { Doc, Id } from "./_generated/dataModel";

const CATEGORY_VALUES = [
  "urgent_help",
  "case_update",
  "adoption",
  "advice",
  "general",
  "announcements",
] as const;
const THREAD_RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const THREAD_RATE_LIMIT_MAX = 3;
const COMMENT_RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000;
const COMMENT_RATE_LIMIT_MAX = 15;
const REPORT_RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const REPORT_RATE_LIMIT_MAX = 6;

type ForumBoard = "rescue" | "community";
type ForumCategory = (typeof CATEGORY_VALUES)[number];
type ForumSort = "local_recent" | "newest" | "top";
type ReactionTarget = "post" | "comment";
type ReactionType = "upvote";

type ThreadDoc = Doc<"communityPosts">;
type CommentDoc = Doc<"communityComments">;
type QueryLikeCtx = Pick<QueryCtx, "db">;
type MutationLikeCtx = Pick<MutationCtx, "db">;
type CommentAuthorView = {
  id: Id<"users"> | null;
  name: string;
  avatar: string | null;
  city: string | null;
  badge: "mod" | "clinic" | "partner" | "volunteer" | null;
};
type CommentView = {
  id: Id<"communityComments">;
  postId: Id<"communityPosts">;
  parentCommentId: Id<"communityComments"> | null;
  content: string;
  isDeleted: boolean;
  reactionCount: number;
  replyCount: number;
  createdAt: number;
  editedAt: number | null;
  timeAgo: string;
  viewerReacted: boolean;
  author: CommentAuthorView;
  replies: CommentView[];
};

function isForumBoard(value: string | undefined | null): value is ForumBoard {
  return value === "rescue" || value === "community";
}

function isForumCategory(value: string | undefined | null): value is ForumCategory {
  return CATEGORY_VALUES.includes(value as ForumCategory);
}

function normalizeCategoryByBoard(board: ForumBoard, category: string | undefined | null): ForumCategory {
  if (isForumCategory(category)) {
    if (board === "rescue") {
      if (
        category === "urgent_help" ||
        category === "case_update" ||
        category === "adoption" ||
        category === "advice"
      ) {
        return category;
      }
      return "advice";
    }
    if (category === "general" || category === "advice" || category === "announcements") {
      return category;
    }
    return "general";
  }

  return board === "rescue" ? "urgent_help" : "general";
}

function normalizeBoard(post: ThreadDoc): ForumBoard {
  if (isForumBoard(post.board)) {
    return post.board;
  }
  if (post.caseId) return "rescue";
  if (post.isRules) return "community";
  return "community";
}

function normalizeCategory(post: ThreadDoc): ForumCategory {
  const board = normalizeBoard(post);
  if (isForumCategory(post.category)) {
    return normalizeCategoryByBoard(board, post.category);
  }

  if (post.isRules) return "announcements";
  if (post.caseId) return "case_update";
  return board === "rescue" ? "urgent_help" : "general";
}

function sanitizeCityTag(value: string | undefined | null): string | undefined {
  if (!value) return undefined;
  const normalized = value.trim();
  if (!normalized) return undefined;
  return normalized.slice(0, 80);
}

function normalizeTitle(value: string | undefined | null, content: string): string {
  const input = value?.trim();
  if (input) return input.slice(0, 140);

  const oneLine = content.replace(/\s+/g, " ").trim();
  if (!oneLine) return "Untitled thread";
  return oneLine.length > 90 ? `${oneLine.slice(0, 90)}...` : oneLine;
}

function normalizeContent(value: string): string {
  const content = value.trim();
  if (!content) throw new Error("Thread body is required");
  if (content.length > 5000) throw new Error("Thread body is too long (max 5000 characters)");
  return content;
}

function normalizeTimeAgo(timestamp: number): string {
  const delta = Date.now() - timestamp;
  const minutes = Math.floor(delta / 60000);
  const hours = Math.floor(delta / 3600000);
  const days = Math.floor(delta / 86400000);

  if (minutes < 1) return "now";
  if (minutes < 60) return `${minutes}m`;
  if (hours < 24) return `${hours}h`;
  if (days < 7) return `${days}d`;
  return new Date(timestamp).toLocaleDateString();
}

function normalizeUserCity(user: Doc<"users"> | null): string | null {
  if (!user) return null;
  const raw = user.volunteerCity || user.city;
  if (!raw) return null;
  const normalized = raw.trim();
  return normalized || null;
}

function normalizeCityKey(city: string | null | undefined): string | null {
  if (!city) return null;
  return city.trim().toLowerCase();
}

function getAuthorBadge(user: Doc<"users"> | null): "mod" | "clinic" | "partner" | "volunteer" | null {
  if (!user) return null;
  if (user.role === "admin") return "mod";
  if (user.role === "clinic") return "clinic";
  if (user.verificationLevel === "partner") return "partner";
  if (user.role === "volunteer") return "volunteer";
  return null;
}

async function getThreadViewerReacted(
  ctx: QueryLikeCtx,
  postId: Id<"communityPosts">,
  viewerId: Id<"users"> | null
) {
  if (!viewerId) return false;
  const existing = await ctx.db
    .query("communityReactions")
    .withIndex("by_unique_reaction", (q) =>
      q.eq("targetType", "post").eq("targetId", String(postId)).eq("userId", viewerId).eq("reactionType", "upvote")
    )
    .unique();
  return !!existing;
}

async function getCommentViewerReacted(
  ctx: QueryLikeCtx,
  commentId: Id<"communityComments">,
  viewerId: Id<"users"> | null
) {
  if (!viewerId) return false;
  const existing = await ctx.db
    .query("communityReactions")
    .withIndex("by_unique_reaction", (q) =>
      q.eq("targetType", "comment").eq("targetId", String(commentId)).eq("userId", viewerId).eq("reactionType", "upvote")
    )
    .unique();
  return !!existing;
}

async function mapThread(
  ctx: QueryLikeCtx,
  post: ThreadDoc,
  viewerId: Id<"users"> | null
) {
  const author = await ctx.db.get(post.userId);
  const cityTag = sanitizeCityTag(post.cityTag);
  const board = normalizeBoard(post);
  const category = normalizeCategory(post);
  const createdAt = post.createdAt;
  const lastActivityAt = post.lastActivityAt ?? post.createdAt;

  const viewerReacted = await getThreadViewerReacted(ctx, post._id, viewerId);

  return {
    id: post._id,
    board,
    category,
    title: normalizeTitle(post.title, post.content),
    content: post.content,
    preview: post.content.replace(/\s+/g, " ").trim(),
    image: post.image ?? null,
    cityTag: cityTag ?? null,
    caseId: post.caseId ?? null,
    isPinned: post.isPinned,
    isLocked: post.isLocked ?? false,
    isDeleted: post.isDeleted ?? false,
    reactionCount: post.likes,
    replyCount: post.commentsCount,
    createdAt,
    lastActivityAt,
    timeAgo: normalizeTimeAgo(lastActivityAt),
    viewerReacted,
    author: {
      id: author?._id ?? null,
      name: author?.displayName || author?.name || "Unknown",
      avatar: author?.avatar ?? null,
      city: normalizeUserCity(author),
      badge: getAuthorBadge(author),
    },
  };
}

async function recalcReplyCount(
  ctx: MutationLikeCtx,
  postId: Id<"communityPosts">
) {
  const comments = await ctx.db
    .query("communityComments")
    .withIndex("by_post_created", (q) => q.eq("postId", postId))
    .collect();
  const count = comments.filter((comment) => !comment.isDeleted).length;
  await ctx.db.patch(postId, { commentsCount: count, lastActivityAt: Date.now() });
}

function ensureThreadAccess(post: ThreadDoc | null): asserts post is ThreadDoc {
  if (!post || post.isDeleted) {
    throw new Error("Thread not found");
  }
}

function buildCityOptions(posts: ThreadDoc[], board: ForumBoard) {
  const cityMap = new Map<string, { city: string; count: number }>();
  for (const post of posts) {
    if (normalizeBoard(post) !== board) continue;
    if (post.isDeleted) continue;
    const tag = sanitizeCityTag(post.cityTag);
    if (!tag) continue;
    const key = tag.toLowerCase();
    const previous = cityMap.get(key);
    if (previous) {
      previous.count += 1;
    } else {
      cityMap.set(key, { city: tag, count: 1 });
    }
  }

  return [...cityMap.values()].sort((a, b) => b.count - a.count || a.city.localeCompare(b.city)).slice(0, 8);
}

function normalizeFilterSort(value: ForumSort | undefined): ForumSort {
  if (value === "newest" || value === "top" || value === "local_recent") return value;
  return "local_recent";
}

async function assertThreadRateLimit(ctx: MutationCtx, userId: Id<"users">) {
  const now = Date.now();
  const recent = (
    await ctx.db
      .query("communityPosts")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect()
  ).filter((post) => !post.isDeleted && now - post.createdAt <= THREAD_RATE_LIMIT_WINDOW_MS).length;

  if (recent >= THREAD_RATE_LIMIT_MAX) {
    throw new Error("You're posting too quickly. Please wait a few minutes before creating another thread.");
  }
}

async function assertCommentRateLimit(ctx: MutationCtx, userId: Id<"users">) {
  const now = Date.now();
  const recent = (
    await ctx.db
      .query("communityComments")
      .withIndex("by_author", (q) => q.eq("authorId", userId))
      .collect()
  ).filter((comment) => !comment.isDeleted && now - comment.createdAt <= COMMENT_RATE_LIMIT_WINDOW_MS).length;

  if (recent >= COMMENT_RATE_LIMIT_MAX) {
    throw new Error("You're replying too quickly. Please wait a moment and try again.");
  }
}

async function assertReportRateLimit(ctx: MutationCtx, userId: Id<"users">) {
  const now = Date.now();
  const recent = (
    await ctx.db
      .query("communityReports")
      .withIndex("by_reporter", (q) => q.eq("reporterId", userId))
      .collect()
  ).filter((report) => now - report.createdAt <= REPORT_RATE_LIMIT_WINDOW_MS).length;

  if (recent >= REPORT_RATE_LIMIT_MAX) {
    throw new Error("Too many reports in a short time. Please wait before submitting another report.");
  }
}

export const listThreads = query({
  args: {
    board: v.optional(v.union(v.literal("rescue"), v.literal("community"))),
    category: v.optional(v.union(
      v.literal("urgent_help"),
      v.literal("case_update"),
      v.literal("adoption"),
      v.literal("advice"),
      v.literal("general"),
      v.literal("announcements"),
      v.literal("all"),
    )),
    city: v.optional(v.string()),
    sort: v.optional(v.union(v.literal("local_recent"), v.literal("newest"), v.literal("top"))),
    search: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const viewer = await optionalUser(ctx);
    const viewerCity = normalizeUserCity(viewer);
    const viewerCityKey = normalizeCityKey(viewerCity);

    const board: ForumBoard = args.board ?? "rescue";
    const sort = normalizeFilterSort(args.sort);
    const limit = Math.min(Math.max(args.limit ?? 40, 1), 100);
    const search = args.search?.trim().toLowerCase() ?? "";
    const cityFilter = args.city?.trim() || "all";
    const cityFilterKey = normalizeCityKey(cityFilter);
    const requestedCategory = args.category ?? "all";

    const posts = await ctx.db.query("communityPosts").withIndex("by_created").order("desc").take(300);
    const cityOptions = buildCityOptions(posts, board);

    let filtered = posts.filter((post) => {
      if (post.isDeleted) return false;
      if (normalizeBoard(post) !== board) return false;

      if (requestedCategory !== "all") {
        const category = normalizeCategory(post);
        if (category !== requestedCategory) return false;
      }

      if (search) {
        const title = normalizeTitle(post.title, post.content).toLowerCase();
        const content = post.content.toLowerCase();
        const cityTag = (post.cityTag ?? "").toLowerCase();
        if (!title.includes(search) && !content.includes(search) && !cityTag.includes(search)) {
          return false;
        }
      }

      const cityTagKey = normalizeCityKey(post.cityTag);
      if (cityFilter.toLowerCase() === "nearby") {
        if (!viewerCityKey) return true;
        return cityTagKey === viewerCityKey;
      }
      if (cityFilter.toLowerCase() !== "all" && cityFilterKey) {
        return cityTagKey === cityFilterKey;
      }
      return true;
    });

    const currentTs = Date.now();
    filtered = filtered.sort((a, b) => {
      const aPinned = a.isPinned ? 1 : 0;
      const bPinned = b.isPinned ? 1 : 0;
      if (aPinned !== bPinned) return bPinned - aPinned;

      if (sort === "newest") {
        return b.createdAt - a.createdAt;
      }

      if (sort === "top") {
        const scoreA = a.likes + a.commentsCount * 2;
        const scoreB = b.likes + b.commentsCount * 2;
        if (scoreA !== scoreB) return scoreB - scoreA;
        return (b.lastActivityAt ?? b.createdAt) - (a.lastActivityAt ?? a.createdAt);
      }

      // local_recent (default)
      const aCityKey = normalizeCityKey(a.cityTag);
      const bCityKey = normalizeCityKey(b.cityTag);
      const aLocalScore = viewerCityKey && aCityKey === viewerCityKey ? 1 : 0;
      const bLocalScore = viewerCityKey && bCityKey === viewerCityKey ? 1 : 0;
      if (aLocalScore !== bLocalScore) return bLocalScore - aLocalScore;

      const aActivity = a.lastActivityAt ?? a.createdAt;
      const bActivity = b.lastActivityAt ?? b.createdAt;
      const aStalePenalty = currentTs - aActivity > 21 * 24 * 60 * 60 * 1000 ? 1 : 0;
      const bStalePenalty = currentTs - bActivity > 21 * 24 * 60 * 60 * 1000 ? 1 : 0;
      if (aStalePenalty !== bStalePenalty) return aStalePenalty - bStalePenalty;

      return bActivity - aActivity;
    });

    const limited = filtered.slice(0, limit);
    const threads = await Promise.all(limited.map((post) => mapThread(ctx, post, viewer?._id ?? null)));

    return {
      threads,
      meta: {
        viewerCity,
        cityOptions,
        total: filtered.length,
        board,
        sort,
      },
    };
  },
});

export const getThread = query({
  args: { id: v.id("communityPosts") },
  handler: async (ctx, args) => {
    const viewer = await optionalUser(ctx);
    const post = await ctx.db.get(args.id);
    if (!post || post.isDeleted) return null;
    return mapThread(ctx, post, viewer?._id ?? null);
  },
});

export const createThread = mutation({
  args: {
    board: v.union(v.literal("rescue"), v.literal("community")),
    category: v.union(
      v.literal("urgent_help"),
      v.literal("case_update"),
      v.literal("adoption"),
      v.literal("advice"),
      v.literal("general"),
      v.literal("announcements"),
    ),
    title: v.string(),
    content: v.string(),
    cityTag: v.optional(v.string()),
    caseId: v.optional(v.string()),
    image: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const content = normalizeContent(args.content);
    await assertThreadRateLimit(ctx, user._id);
    const title = normalizeTitle(args.title, content);
    const board = args.board;
    const category = normalizeCategoryByBoard(board, args.category);
    const cityTag = sanitizeCityTag(args.cityTag) ?? normalizeUserCity(user) ?? undefined;
    let caseId: Id<"cases"> | undefined;
    if (args.caseId) {
      const candidate = args.caseId as Id<"cases">;
      const caseDoc = await ctx.db.get(candidate);
      if (!caseDoc) {
        throw new Error("Linked case not found");
      }
      caseId = candidate;
    }
    const now = Date.now();

    const id = await ctx.db.insert("communityPosts", {
      userId: user._id,
      title,
      content,
      image: args.image,
      caseId,
      board,
      category,
      cityTag,
      lastActivityAt: now,
      isLocked: false,
      isDeleted: false,
      editedAt: undefined,
      isPinned: false,
      isRules: false,
      likes: 0,
      commentsCount: 0,
      createdAt: now,
    });

    await ctx.db.insert("auditLogs", {
      actorId: user._id,
      entityType: "community_post",
      entityId: String(id),
      action: "community.thread.created",
      details: `board=${board};category=${category}`,
      createdAt: now,
    });

    return id;
  },
});

export const lockThread = mutation({
  args: {
    id: v.id("communityPosts"),
    locked: v.boolean(),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    if (user.role !== "admin") {
      throw new Error("Admin access required");
    }

    const post = await ctx.db.get(args.id);
    ensureThreadAccess(post);

    await ctx.db.patch(post._id, {
      isLocked: args.locked,
      lastActivityAt: Date.now(),
    });

    await ctx.db.insert("auditLogs", {
      actorId: user._id,
      entityType: "community_post",
      entityId: String(post._id),
      action: args.locked ? "community.thread.locked" : "community.thread.unlocked",
      createdAt: Date.now(),
    });
  },
});

export const listComments = query({
  args: {
    postId: v.id("communityPosts"),
  },
  handler: async (ctx, args) => {
    const viewer = await optionalUser(ctx);
    const post = await ctx.db.get(args.postId);
    if (!post || post.isDeleted) {
      return [];
    }

    const allComments = await ctx.db
      .query("communityComments")
      .withIndex("by_post_created", (q) => q.eq("postId", args.postId))
      .collect();

    const topLevel = allComments
      .filter((comment) => !comment.parentCommentId)
      .sort((a, b) => a.createdAt - b.createdAt);

    const formatComment = async (comment: CommentDoc, includeReplies: boolean): Promise<CommentView> => {
      const author = await ctx.db.get(comment.authorId);
      const viewerReacted = await getCommentViewerReacted(ctx, comment._id, viewer?._id ?? null);
      const children = includeReplies
        ? allComments
            .filter((entry) => entry.parentCommentId && String(entry.parentCommentId) === String(comment._id))
            .sort((a, b) => a.createdAt - b.createdAt)
        : [];

      return {
        id: comment._id,
        postId: comment.postId,
        parentCommentId: comment.parentCommentId ?? null,
        content: comment.isDeleted ? "[deleted]" : comment.content,
        isDeleted: comment.isDeleted,
        reactionCount: comment.reactionCount,
        replyCount: children.length,
        createdAt: comment.createdAt,
        editedAt: comment.editedAt ?? null,
        timeAgo: normalizeTimeAgo(comment.createdAt),
        viewerReacted,
        author: {
          id: author?._id ?? null,
          name: author?.displayName || author?.name || "Unknown",
          avatar: author?.avatar ?? null,
          city: normalizeUserCity(author),
          badge: getAuthorBadge(author),
        },
        replies: await Promise.all(children.map((child) => formatComment(child, false))),
      };
    };

    return Promise.all(topLevel.map((comment) => formatComment(comment, true)));
  },
});

export const createComment = mutation({
  args: {
    postId: v.id("communityPosts"),
    content: v.string(),
    parentCommentId: v.optional(v.id("communityComments")),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const post = await ctx.db.get(args.postId);
    ensureThreadAccess(post);
    await assertCommentRateLimit(ctx, user._id);

    if (post.isLocked) {
      throw new Error("Thread is locked");
    }

    const content = args.content.trim();
    if (!content) throw new Error("Reply text is required");
    if (content.length > 2000) throw new Error("Reply is too long (max 2000 characters)");

    if (args.parentCommentId) {
      const parent = await ctx.db.get(args.parentCommentId);
      if (!parent || parent.postId !== args.postId || parent.isDeleted) {
        throw new Error("Parent reply not found");
      }
      if (parent.parentCommentId) {
        throw new Error("Only one nested reply level is allowed");
      }
    }

    const id = await ctx.db.insert("communityComments", {
      postId: args.postId,
      authorId: user._id,
      parentCommentId: args.parentCommentId,
      content,
      isDeleted: false,
      reactionCount: 0,
      replyCount: 0,
      createdAt: Date.now(),
      editedAt: undefined,
    });

    if (args.parentCommentId) {
      const parent = await ctx.db.get(args.parentCommentId);
      if (parent) {
        await ctx.db.patch(parent._id, { replyCount: (parent.replyCount ?? 0) + 1 });
      }
    }

    await recalcReplyCount(ctx, args.postId);

    await ctx.db.insert("auditLogs", {
      actorId: user._id,
      entityType: "community_comment",
      entityId: String(id),
      action: "community.comment.created",
      details: `postId=${String(args.postId)}`,
      createdAt: Date.now(),
    });

    return id;
  },
});

export const deleteComment = mutation({
  args: {
    commentId: v.id("communityComments"),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const comment = await ctx.db.get(args.commentId);
    if (!comment) throw new Error("Reply not found");

    const isAdmin = user.role === "admin";
    if (comment.authorId !== user._id && !isAdmin) {
      throw new Error("Not authorized to delete this reply");
    }

    if (comment.isDeleted) return;

    await ctx.db.patch(comment._id, {
      isDeleted: true,
      content: "[deleted]",
      editedAt: Date.now(),
    });

    await recalcReplyCount(ctx, comment.postId);

    await ctx.db.insert("auditLogs", {
      actorId: user._id,
      entityType: "community_comment",
      entityId: String(comment._id),
      action: "community.comment.deleted",
      createdAt: Date.now(),
    });
  },
});

export const toggleReaction = mutation({
  args: {
    targetType: v.union(v.literal("post"), v.literal("comment")),
    targetId: v.string(),
    reactionType: v.optional(v.union(v.literal("upvote"))),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const reactionType: ReactionType = args.reactionType ?? "upvote";
    const targetType: ReactionTarget = args.targetType;

    if (targetType === "post") {
      const postId = args.targetId as Id<"communityPosts">;
      const post = await ctx.db.get(postId);
      ensureThreadAccess(post);
    } else {
      const commentId = args.targetId as Id<"communityComments">;
      const comment = await ctx.db.get(commentId);
      if (!comment || comment.isDeleted) throw new Error("Reply not found");
    }

    const existing = await ctx.db
      .query("communityReactions")
      .withIndex("by_unique_reaction", (q) =>
        q
          .eq("targetType", targetType)
          .eq("targetId", args.targetId)
          .eq("userId", user._id)
          .eq("reactionType", reactionType)
      )
      .unique();

    if (existing) {
      await ctx.db.delete(existing._id);
      if (targetType === "post") {
        const postId = args.targetId as Id<"communityPosts">;
        const post = await ctx.db.get(postId);
        if (post) {
          await ctx.db.patch(postId, { likes: Math.max(0, post.likes - 1) });
          return { reacted: false, count: Math.max(0, post.likes - 1) };
        }
      } else {
        const commentId = args.targetId as Id<"communityComments">;
        const comment = await ctx.db.get(commentId);
        if (comment) {
          const count = Math.max(0, comment.reactionCount - 1);
          await ctx.db.patch(commentId, { reactionCount: count });
          return { reacted: false, count };
        }
      }
      return { reacted: false, count: 0 };
    }

    await ctx.db.insert("communityReactions", {
      targetType,
      targetId: args.targetId,
      userId: user._id,
      reactionType,
      createdAt: Date.now(),
    });

    if (targetType === "post") {
      const postId = args.targetId as Id<"communityPosts">;
      const post = await ctx.db.get(postId);
      if (post) {
        const count = post.likes + 1;
        await ctx.db.patch(postId, { likes: count, lastActivityAt: Date.now() });
        return { reacted: true, count };
      }
    } else {
      const commentId = args.targetId as Id<"communityComments">;
      const comment = await ctx.db.get(commentId);
      if (comment) {
        const count = comment.reactionCount + 1;
        await ctx.db.patch(commentId, { reactionCount: count });
        return { reacted: true, count };
      }
    }

    return { reacted: true, count: 1 };
  },
});

export const reportContent = mutation({
  args: {
    targetType: v.union(v.literal("post"), v.literal("comment")),
    targetId: v.string(),
    reason: v.union(
      v.literal("spam"),
      v.literal("harassment"),
      v.literal("misinformation"),
      v.literal("scam"),
      v.literal("animal_welfare"),
      v.literal("other"),
    ),
    details: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const details = args.details?.trim();
    if (details && details.length > 2000) {
      throw new Error("Report details are too long (max 2000 characters)");
    }

    if (args.targetType === "post") {
      const post = await ctx.db.get(args.targetId as Id<"communityPosts">);
      ensureThreadAccess(post);
    } else {
      const comment = await ctx.db.get(args.targetId as Id<"communityComments">);
      if (!comment || comment.isDeleted) throw new Error("Reply not found");
    }

    const existingOpen = await ctx.db
      .query("communityReports")
      .withIndex("by_target", (q) => q.eq("targetType", args.targetType).eq("targetId", args.targetId))
      .filter((q) => q.and(q.eq(q.field("reporterId"), user._id), q.eq(q.field("status"), "open")))
      .first();

    if (existingOpen) {
      return existingOpen._id;
    }

    await assertReportRateLimit(ctx, user._id);

    const id = await ctx.db.insert("communityReports", {
      targetType: args.targetType,
      targetId: args.targetId,
      reason: args.reason,
      details: details || undefined,
      reporterId: user._id,
      status: "open",
      createdAt: Date.now(),
    });

    await ctx.db.insert("auditLogs", {
      actorId: user._id,
      entityType: "community_report",
      entityId: String(id),
      action: "community.report.created",
      details: `targetType=${args.targetType};reason=${args.reason}`,
      createdAt: Date.now(),
    });

    return id;
  },
});

function toLegacyPost(thread: Awaited<ReturnType<typeof mapThread>>) {
  return {
    _id: thread.id,
    content: thread.content,
    image: thread.image ?? undefined,
    likes: thread.reactionCount,
    commentsCount: thread.replyCount,
    createdAt: thread.createdAt,
    author: {
      id: thread.author.id,
      name: thread.author.name,
      avatar: thread.author.avatar,
      isVolunteer: thread.author.badge === "volunteer",
    },
    timeAgo: thread.timeAgo,
  };
}

// Backward-compatible wrappers used by older routes.
export const list = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const viewer = await optionalUser(ctx);
    const limit = Math.min(Math.max(args.limit ?? 20, 1), 100);
    const posts = await ctx.db
      .query("communityPosts")
      .withIndex("by_created")
      .order("desc")
      .take(150);

    const communityPosts = posts
      .filter((post) => !post.isDeleted && normalizeBoard(post) === "community")
      .sort((a, b) => (b.lastActivityAt ?? b.createdAt) - (a.lastActivityAt ?? a.createdAt))
      .slice(0, limit);

    const mapped = await Promise.all(communityPosts.map((post) => mapThread(ctx, post, viewer?._id ?? null)));
    return mapped.map(toLegacyPost);
  },
});

export const get = query({
  args: { id: v.id("communityPosts") },
  handler: async (ctx, args) => {
    const viewer = await optionalUser(ctx);
    const post = await ctx.db.get(args.id);
    if (!post || post.isDeleted) return null;
    const thread = await mapThread(ctx, post, viewer?._id ?? null);
    return toLegacyPost(thread);
  },
});

export const create = mutation({
  args: {
    content: v.string(),
    image: v.optional(v.string()),
    caseId: v.optional(v.id("cases")),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const content = normalizeContent(args.content);
    const now = Date.now();
    const board: ForumBoard = args.caseId ? "rescue" : "community";
    const category = args.caseId ? "case_update" : "general";

    const id = await ctx.db.insert("communityPosts", {
      userId: user._id,
      title: normalizeTitle(undefined, content),
      content,
      image: args.image,
      caseId: args.caseId,
      board,
      category,
      cityTag: normalizeUserCity(user) ?? undefined,
      lastActivityAt: now,
      isLocked: false,
      isDeleted: false,
      editedAt: undefined,
      isPinned: false,
      isRules: false,
      likes: 0,
      commentsCount: 0,
      createdAt: now,
    });

    return id;
  },
});

export const like = mutation({
  args: { id: v.id("communityPosts") },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const existing = await ctx.db
      .query("communityReactions")
      .withIndex("by_unique_reaction", (q) =>
        q.eq("targetType", "post").eq("targetId", String(args.id)).eq("userId", user._id).eq("reactionType", "upvote")
      )
      .unique();

    const post = await ctx.db.get(args.id);
    ensureThreadAccess(post);

    if (existing) {
      return { reacted: true, count: post.likes };
    }

    await ctx.db.insert("communityReactions", {
      targetType: "post",
      targetId: String(args.id),
      userId: user._id,
      reactionType: "upvote",
      createdAt: Date.now(),
    });
    await ctx.db.patch(args.id, { likes: post.likes + 1, lastActivityAt: Date.now() });
    return { reacted: true, count: post.likes + 1 };
  },
});
