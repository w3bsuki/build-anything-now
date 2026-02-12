import { useMemo, useState } from "react";
import { ExternalLink, Link2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import type { ExternalSourcePreview } from "@/types";

interface ExternalLinkCardProps {
  source: ExternalSourcePreview;
  className?: string;
}

function fallbackInitials(domain: string) {
  const cleanDomain = domain.replace(/^www\./, "").trim();
  if (!cleanDomain) return "EX";
  return cleanDomain.replace(/[^a-zA-Z0-9]/g, "").slice(0, 2).toUpperCase() || "EX";
}

export function ExternalLinkCard({ source, className }: ExternalLinkCardProps) {
  const { t } = useTranslation();
  const [imageFailed, setImageFailed] = useState(false);

  const platformLabel = useMemo(
    () =>
      t(`externalSources.platform.${source.platform}`, {
        defaultValue: source.platform,
      }),
    [source.platform, t]
  );

  return (
    <a
      href={source.url}
      target="_blank"
      rel="noopener noreferrer nofollow"
      className={cn(
        "group block rounded-2xl border border-border/60 bg-surface-elevated shadow-xs transition-colors hover:bg-surface-sunken/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring-strong focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        className
      )}
      aria-label={t("externalSources.openLinkAria", {
        title: source.title,
        domain: source.domain,
        defaultValue: "Open source link",
      })}
    >
      <div className="flex min-h-16 items-center gap-3 p-3">
        <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-border/70 bg-surface-sunken">
          {!imageFailed && source.thumbnailUrl ? (
            <img
              src={source.thumbnailUrl}
              alt=""
              className="h-full w-full object-cover"
              onError={() => setImageFailed(true)}
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-foreground">
              {fallbackInitials(source.domain)}
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-muted-foreground">{platformLabel}</p>
          <p className="mt-0.5 line-clamp-2 text-sm font-semibold text-foreground">{source.title}</p>
          <div className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground">
            <Link2 className="size-3.5" />
            <span className="truncate">{source.domain}</span>
          </div>
        </div>

        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border/70 bg-background text-muted-foreground transition-colors group-hover:text-foreground">
          <ExternalLink className="size-4" />
        </span>
      </div>
    </a>
  );
}
