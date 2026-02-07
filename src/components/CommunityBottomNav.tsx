import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Newspaper, PenSquare, Users, MessageSquare, Heart } from "lucide-react";
import { cn } from "@/lib/utils";

const communityNavItems = [
  { path: "/community", labelKey: "community.feedTab", icon: Newspaper, exact: true },
  { path: "/community/followed", labelKey: "community.followedTab", icon: Heart },
  { path: "create-thread", labelKey: "community.newThread", icon: PenSquare, isCreate: true },
  { path: "/community/messages", labelKey: "community.messagesTab", icon: MessageSquare },
  { path: "/community/members", labelKey: "community.groupsTab", icon: Users },
];

export function CommunityBottomNav() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 px-3 pb-[calc(env(safe-area-inset-bottom)+0.3rem)]">
      <div className="mx-auto w-full max-w-3xl">
        <div className="glass-ultra nav-shadow flex h-16 items-center rounded-[1.25rem] border border-nav-border/70 px-1.5">
          {communityNavItems.map((item) => {
            const isActive = item.exact
              ? location.pathname === item.path
              : location.pathname === item.path || location.pathname.startsWith(item.path + "/");
            const Icon = item.icon;

            if (item.isCreate) {
              return (
                <button
                  key={item.path}
                  type="button"
                  onClick={() => navigate("/community?compose=1")}
                  className="inline-flex min-w-0 flex-1 items-center justify-center rounded-xl py-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring-strong focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  aria-label={t(item.labelKey, "New Thread")}
                >
                  <span className="inline-flex size-11 items-center justify-center rounded-full border border-background bg-primary text-primary-foreground shadow-sm">
                    <Icon className="size-5" strokeWidth={2.5} />
                  </span>
                </button>
              );
            }

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className="group inline-flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-xl py-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring-strong focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                <span
                  className={cn(
                    "inline-flex size-8 items-center justify-center rounded-full transition-colors",
                    isActive
                      ? "bg-chip-bg text-foreground"
                      : "text-muted-foreground group-active:bg-muted"
                  )}
                >
                  <Icon className="size-[18px]" strokeWidth={isActive ? 2 : 1.8} />
                </span>
                <span
                  className={cn(
                    "max-w-full whitespace-nowrap px-0.5 text-[10px] leading-tight transition-colors",
                    isActive ? "text-foreground font-semibold" : "text-muted-foreground font-medium"
                  )}
                >
                  {t(item.labelKey)}
                </span>
              </NavLink>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
