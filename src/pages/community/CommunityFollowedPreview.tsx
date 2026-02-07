import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Users } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CommunityFollowedPreview() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-8 md:pt-16">
      <div className="mx-auto w-full max-w-3xl px-4 py-4">
        <div className="rounded-3xl border border-border bg-card p-5">
          <div className="inline-flex size-12 items-center justify-center rounded-2xl border border-border bg-chip-bg text-primary">
            <Users className="size-5" />
          </div>
          <h2 className="mt-3 text-lg font-semibold text-foreground">
            {t("community.followedPreviewTitle", "Following feed is coming next")}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {t(
              "community.followedPreviewBody",
              "Stage 1 ships the forum shell first. In Stage 2 this tab will show threads from creators you follow."
            )}
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            <Button variant="outline" asChild className="min-h-11 rounded-xl text-sm font-semibold">
              <Link to="/community">{t("community.backToFeed", "Back to feed")}</Link>
            </Button>
            <Button asChild className="min-h-11 rounded-xl text-sm font-semibold">
              <Link to="/community?compose=1">{t("community.startThread", "Start a thread")}</Link>
            </Button>
            <Button variant="outline" asChild className="min-h-11 rounded-xl text-sm font-semibold">
              <Link to="/community/activity">{t("community.openActivity", "Open activity")}</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
