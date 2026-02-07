import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CommunityMessagesPreview() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-8 md:pt-16">
      <div className="mx-auto w-full max-w-3xl px-4 py-4">
        <div className="rounded-3xl border border-border bg-card p-5">
          <div className="inline-flex size-12 items-center justify-center rounded-2xl border border-border bg-chip-bg text-primary">
            <MessageSquare className="size-5" />
          </div>
          <h2 className="mt-3 text-lg font-semibold text-foreground">
            {t("community.messagesPreviewTitle", "Community inbox preview")}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {t(
              "community.messagesPreviewBody",
              "This tab is a staged preview. In Stage 2 it will show your forum conversations and unread threads."
            )}
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            <Button variant="outline" asChild className="min-h-11 rounded-xl text-sm font-semibold">
              <Link to="/community">{t("community.backToFeed", "Back to feed")}</Link>
            </Button>
            <Button asChild className="min-h-11 rounded-xl text-sm font-semibold">
              <Link to="/community?compose=1">{t("community.startThread", "Start a thread")}</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
