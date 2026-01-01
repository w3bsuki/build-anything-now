import { cn } from '@/lib/utils';
import { Heart, Megaphone, Building2 } from 'lucide-react';

interface ContentTabsProps {
  activeTab: 'cases' | 'campaigns' | 'partners';
  onTabChange: (tab: 'cases' | 'campaigns' | 'partners') => void;
}

const tabs = [
  { id: 'cases' as const, label: 'Rescue Cases', icon: Heart },
  { id: 'campaigns' as const, label: 'Campaigns', icon: Megaphone },
  { id: 'partners' as const, label: 'Partners', icon: Building2 },
];

export const ContentTabs = ({ activeTab, onTabChange }: ContentTabsProps) => {
  return (
    <div className="flex border-b border-border">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-medium transition-colors relative",
              activeTab === tab.id
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon className="w-4 h-4" />
            <span className="hidden sm:inline">{tab.label}</span>
            <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
            {activeTab === tab.id && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
            )}
          </button>
        );
      })}
    </div>
  );
};
