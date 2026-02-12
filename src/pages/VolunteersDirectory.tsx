import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useQuery } from "convex/react";
import { ArrowLeft, MapPin, Star } from "lucide-react";
import { api } from "../../convex/_generated/api";
import { PageShell } from "@/components/layout/PageShell";
import { PageSection } from "@/components/layout/PageSection";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type VolunteerCapability = "transport" | "fostering" | "rescue" | "events" | "social_media" | "medical" | "general";
type AvailabilityFilter = "default" | "available" | "busy" | "offline" | "all";

const capabilityValues: VolunteerCapability[] = [
  "transport",
  "fostering",
  "rescue",
  "events",
  "social_media",
  "medical",
  "general",
];

const availabilityValues: AvailabilityFilter[] = ["default", "available", "busy", "offline", "all"];

const availabilityBadgeTone: Record<Exclude<AvailabilityFilter, "default" | "all">, string> = {
  available: "border-success/30 bg-success/10 text-success",
  busy: "border-warning/30 bg-warning/10 text-warning",
  offline: "border-border/60 bg-surface-sunken text-muted-foreground",
};

const VolunteersDirectory = () => {
  const { t } = useTranslation();
  const [city, setCity] = useState("");
  const [capability, setCapability] = useState<VolunteerCapability | "all">("all");
  const [availability, setAvailability] = useState<AvailabilityFilter>("default");

  const cityFilter = city.trim();
  const queryArgs = useMemo(
    () => ({
      city: cityFilter.length > 0 ? cityFilter : undefined,
      capability: capability === "all" ? undefined : capability,
      availability: availability === "default" ? undefined : availability,
      limit: 80,
    }),
    [availability, capability, cityFilter],
  );

  const volunteers = useQuery(api.volunteers.listDirectory, queryArgs);

  return (
    <PageShell>
      <div className="sticky top-0 z-40 border-b border-nav-border/70 bg-nav-surface/95 backdrop-blur-md md:hidden">
        <div className="flex h-14 items-center gap-3 px-3">
          <Link
            to="/partners?segment=volunteers"
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-border/60 bg-surface-sunken/85 transition-colors active:bg-surface-sunken"
            aria-label={t("common.back", "Back")}
          >
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </Link>
          <h1 className="flex-1 truncate text-sm font-medium text-foreground">
            {t("volunteersDirectory.title", "Volunteer directory")}
          </h1>
        </div>
      </div>

      <PageSection className="py-4">
        <div className="rounded-2xl border border-border/60 bg-surface-elevated p-4 shadow-xs">
          <SectionHeader
            title={t("volunteersDirectory.filters", "Filters")}
            description={t("volunteersDirectory.filtersHint", "Match by city, capability, and availability.")}
            className="mb-4"
            titleClassName="text-base"
          />

          <div className="space-y-4">
            <div>
              <label htmlFor="volunteer-city" className="mb-2 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {t("volunteersDirectory.cityLabel", "City")}
              </label>
              <Input
                id="volunteer-city"
                value={city}
                onChange={(event) => setCity(event.target.value)}
                placeholder={t("volunteersDirectory.cityPlaceholder", "e.g. Sofia")}
                className="h-11 text-base"
              />
            </div>

            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {t("volunteersDirectory.capabilityLabel", "Capability")}
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setCapability("all")}
                  className={cn(
                    "h-11 rounded-xl border px-3 text-sm font-medium transition-colors",
                    capability === "all"
                      ? "border-primary/35 bg-primary/10 text-primary"
                      : "border-border/70 bg-surface text-foreground hover:bg-surface-sunken",
                  )}
                >
                  {t("volunteersDirectory.allCapabilities", "All")}
                </button>

                {capabilityValues.map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setCapability(value)}
                    className={cn(
                      "h-11 rounded-xl border px-3 text-sm font-medium transition-colors",
                      capability === value
                        ? "border-primary/35 bg-primary/10 text-primary"
                        : "border-border/70 bg-surface text-foreground hover:bg-surface-sunken",
                    )}
                  >
                    {t(`volunteers.capabilities.${value}`)}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {t("volunteersDirectory.availabilityLabel", "Availability")}
              </p>
              <div className="flex flex-wrap gap-2">
                {availabilityValues.map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setAvailability(value)}
                    className={cn(
                      "h-11 rounded-xl border px-3 text-sm font-medium transition-colors",
                      availability === value
                        ? "border-primary/35 bg-primary/10 text-primary"
                        : "border-border/70 bg-surface text-foreground hover:bg-surface-sunken",
                    )}
                  >
                    {t(`volunteers.availabilityFilters.${value}`)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </PageSection>

      <PageSection className="pt-0">
        <SectionHeader
          title={t("volunteersDirectory.title", "Volunteer directory")}
          count={volunteers === undefined ? undefined : volunteers.length}
          description={t("volunteersDirectory.description", "City-level only. No precise home location is shown.")}
        />

        {volunteers === undefined ? (
          <div className="space-y-3">
            {[0, 1, 2].map((item) => (
              <div key={item} className="rounded-2xl border border-border/60 bg-surface-elevated p-4 shadow-xs">
                <Skeleton className="mb-3 h-5 w-1/3" />
                <Skeleton className="mb-2 h-4 w-2/3" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : volunteers.length === 0 ? (
          <div className="rounded-2xl border border-border/60 bg-surface-elevated p-6 text-center shadow-xs">
            <p className="font-medium text-foreground">{t("volunteersDirectory.emptyTitle", "No volunteers found")}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {t("volunteersDirectory.emptyBody", "Try changing filters or invite volunteers to opt in.")}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {volunteers.map((volunteer) => (
              <Link
                key={volunteer._id}
                to={`/volunteers/${volunteer._id}`}
                className="block rounded-2xl border border-border/60 bg-surface-elevated p-4 shadow-xs transition-colors hover:bg-surface-overlay"
              >
                <div className="flex items-start gap-3">
                  {volunteer.avatar ? (
                    <img
                      src={volunteer.avatar}
                      alt={volunteer.name}
                      className="h-11 w-11 rounded-full border border-border/60 object-cover"
                    />
                  ) : (
                    <div className="flex h-11 w-11 items-center justify-center rounded-full border border-border/60 bg-surface-sunken text-sm font-semibold text-muted-foreground">
                      {volunteer.name.slice(0, 1).toUpperCase()}
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-semibold text-foreground">{volunteer.name}</p>
                      {volunteer.isTopVolunteer ? (
                        <span className="inline-flex items-center gap-1 rounded-full border border-warning/30 bg-warning/10 px-2 py-0.5 text-[11px] font-semibold text-warning">
                          <Star className="h-3 w-3 fill-current" />
                          {t("partners.topVolunteer", "Top Volunteer")}
                        </span>
                      ) : null}
                    </div>

                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" />
                        {volunteer.city ?? t("volunteersDirectory.cityUnknown", "City unknown")}
                      </span>
                      <span
                        className={cn(
                          "inline-flex rounded-full border px-2 py-0.5 font-medium",
                          availabilityBadgeTone[volunteer.availability],
                        )}
                      >
                        {t(`volunteers.availability.${volunteer.availability}`)}
                      </span>
                    </div>
                  </div>
                </div>

                <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">{volunteer.bio}</p>

                <div className="mt-3 flex flex-wrap gap-1.5">
                  {volunteer.capabilities.length > 0 ? (
                    volunteer.capabilities.slice(0, 3).map((entry) => (
                      <span
                        key={entry}
                        className="inline-flex rounded-full border border-border/70 bg-surface-sunken px-2 py-1 text-[11px] font-medium text-foreground/90"
                      >
                        {t(`volunteers.capabilities.${entry}`)}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-muted-foreground">{t("volunteersDirectory.noCapabilities", "Capabilities pending")}</span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </PageSection>
    </PageShell>
  );
};

export default VolunteersDirectory;
