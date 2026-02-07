import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Bell, HeartHandshake, User } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CommunityBottomNav } from "@/components/CommunityBottomNav";
import { cn } from "@/lib/utils";

const STATIC_COMMUNITY_CHILD_ROUTES = new Set(["", "followed", "messages", "members", "activity"]);

function isCommunityThreadDetailPath(pathname: string) {
  if (!pathname.startsWith("/community")) return false;
  const trimmed = pathname.replace(/^\/community\/?/, "");
  if (!trimmed) return false;

  const firstSegment = trimmed.split("/")[0];
  return !STATIC_COMMUNITY_CHILD_ROUTES.has(firstSegment);
}

export function CommunityMobileShellLayout() {
  const { t } = useTranslation();
  const location = useLocation();
  const unreadCounts = useQuery(api.home.getUnreadCounts, {});
  const unreadNotifications = unreadCounts?.notifications ?? 0;
  const hideMobileShell = isCommunityThreadDetailPath(location.pathname);

  return (
    <>
      {!hideMobileShell ? (
        <header className="md:hidden sticky top-0 z-50 border-b border-nav-border/70 bg-nav-surface/95 pt-[env(safe-area-inset-top)] backdrop-blur-xl">
          <div className="mx-auto flex h-14 w-full max-w-3xl items-center justify-between px-4">
            <NavLink
              to="/"
              className="inline-flex items-center gap-2 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring-strong focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              aria-label={t("nav.home", "Home")}
            >
              <HeartHandshake className="size-5 text-primary" strokeWidth={2} />
              <h1 className="text-lg font-bold tracking-tight text-foreground">{t("nav.community", "Community")}</h1>
            </NavLink>

            <div className="flex items-center -mr-1 -space-x-1">
              <Button
                variant="iconHeader"
                size="iconTouch"
                className="relative"
                asChild
              >
                <NavLink to="/notifications">
                  <Bell
                    className={cn(
                      location.pathname === "/notifications" ? "text-primary" : undefined
                    )}
                  />
                  {unreadNotifications > 0 ? (
                    <Badge
                      className="absolute top-1 right-1 size-4 justify-center rounded-full p-0 text-xs font-semibold leading-none ring-1 ring-background"
                    >
                      {unreadNotifications > 9 ? "9+" : unreadNotifications}
                    </Badge>
                  ) : null}
                </NavLink>
              </Button>
              <Button
                variant="iconHeader"
                size="iconTouch"
                asChild
              >
                <NavLink to="/account">
                  <User
                    className={cn(
                      location.pathname === "/account" ? "text-primary" : undefined
                    )}
                  />
                </NavLink>
              </Button>
            </div>
          </div>
        </header>
      ) : null}

      <Outlet />

      {!hideMobileShell ? <CommunityBottomNav /> : null}
    </>
  );
}
