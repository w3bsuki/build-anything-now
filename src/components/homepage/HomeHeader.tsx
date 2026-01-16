import { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Bell, User, HeartHandshake, Heart } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

// TODO: Replace with real data from Convex
const unreadNotifications = 2;

export function HomeHeader() {
  const { t } = useTranslation();

  return (
    <header className="md:hidden sticky top-0 z-50 bg-background/95 backdrop-blur-md pt-[env(safe-area-inset-top)]">
      <div className="flex items-center justify-between h-12 px-4">
        {/* Logo */}
        <NavLink to="/" className="flex items-center gap-2">
          <HeartHandshake className="w-5 h-5 text-primary" strokeWidth={2} />
          <span className="font-bold text-lg tracking-tight text-foreground">Pawtreon</span>
        </NavLink>

        {/* Actions - Notifications + Profile */}
        <div className="flex items-center gap-1">
          <NavLink
            to="/notifications"
            className="relative size-9 flex items-center justify-center"
          >
            <Bell className="size-[22px] text-foreground/70" strokeWidth={1.75} />
            {unreadNotifications > 0 && (
              <Badge className="absolute -top-1 -right-1 h-4 min-w-4 justify-center rounded-full px-1 text-[10px] font-semibold shadow-sm ring-2 ring-background">
                {unreadNotifications > 9 ? '9+' : unreadNotifications}
              </Badge>
            )}
          </NavLink>
          <NavLink
            to="/profile"
            className="size-9 flex items-center justify-center"
          >
            <User className="size-[22px] text-foreground/70" strokeWidth={1.75} />
          </NavLink>
        </div>
      </div>
    </header>
  );
}
