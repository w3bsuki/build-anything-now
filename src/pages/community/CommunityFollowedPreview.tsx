import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useQuery } from "convex/react";
import { Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "../../../convex/_generated/api";

export default function CommunityFollowedPreview() {
  const { t } = useTranslation();
  const followedFeed = useQuery(api.community.listFollowedThreads, { limit: 40 });
  const threads = followedFeed?.threads ?? [];

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-8 md:pt-16">
      <div className="mx-auto w-full max-w-3xl space-y-3 px-4 py-4">
        <section className="rounded-3xl border border-border bg-card p-5">
          <div className="inline-flex size-12 items-center justify-center rounded-2xl border border-border bg-chip-bg text-primary">
            <Users className="size-5" />
          </div>
          <h2 className="mt-3 text-lg font-semibold text-foreground">
            {t("community.followedTab", "Followed")}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("community.followedSubtitle", "Latest rescue and community posts from creators you follow.")}
          </p>
        </section>

        {followedFeed === undefined ? (
          <section className="rounded-3xl border border-border bg-card p-5 text-sm text-muted-foreground">
            {t("common.loading", "Loading…")}
          </section>
        ) : threads.length === 0 ? (
          <section className="rounded-3xl border border-border bg-card p-5">
            <p className="text-sm text-muted-foreground">
              {t("community.followedEmpty", "Follow creators to see their community posts here.")}
            </p>
          </section>
        ) : (
          <section className="space-y-3">
            {threads.map((thread) => (
              <article key={thread.id} className="rounded-3xl border border-border bg-card p-4 shadow-sm">
                <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
                  <span className="truncate">{thread.author.name}</span>
                  <span>{thread.timeAgo}</span>
                </div>
                <Link to={`/community/${thread.id}`} className="mt-2 block rounded-xl">
                  <h3 className="line-clamp-2 text-base font-semibold text-foreground">{thread.title}</h3>
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{thread.preview}</p>
                </Link>
              </article>
            ))}
          </section>
        )}

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" asChild className="min-h-11 rounded-xl text-sm font-semibold">
            <Link to="/community">{t("community.backToFeed", "Back to feed")}</Link>
          </Button>
          <Button asChild className="min-h-11 rounded-xl text-sm font-semibold">
            <Link to="/community?compose=1">{t("community.startThread", "Start a thread")}</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
