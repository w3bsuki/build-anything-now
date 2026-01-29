import { useCallback, useEffect, useRef, useState } from 'react';
import { X, Search, Clock, TrendingUp, MapPin } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch: (query: string) => void;
}

// Mock data - replace with real data later
const recentSearches = [
  'injured cat sofia',
  'stray dogs plovdiv',
  '@petlover99',
];

const trendingSearches = [
  'winter shelter',
  'critical surgery',
  'varna beach strays',
];

const locationFilters = [
  { id: 'nearby', label: 'Near me (5km)', icon: MapPin },
  { id: 'sofia', label: 'Sofia' },
  { id: 'plovdiv', label: 'Plovdiv' },
  { id: 'varna', label: 'Varna' },
];

export function SearchOverlay({ isOpen, onClose, onSearch }: SearchOverlayProps) {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClose = useCallback(() => {
    setQuery('');
    onClose();
  }, [onClose]);

  // Focus input when overlay opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      // Small delay to allow animation
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, handleClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
      handleClose();
    }
  };

  const handleQuickSearch = (term: string) => {
    onSearch(term);
    handleClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-background/95 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Content */}
      <div className="relative h-full flex flex-col animate-in slide-in-from-bottom-4 duration-200">
        {/* Search Header */}
        <div className="flex items-center gap-3 p-4 pt-[calc(env(safe-area-inset-top)+16px)]">
          <form onSubmit={handleSubmit} className="flex-1 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('home.searchPlaceholder', 'Search cases, users, locations...')}
              className="w-full rounded-full bg-muted pl-10 pr-4 py-2.5 text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </form>
          <button
            onClick={handleClose}
            className="p-2 rounded-full hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Content */}
        <div className="flex-1 overflow-y-auto px-4 pb-safe">
          {/* Recent Searches */}
          {recentSearches.length > 0 && (
            <section className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-foreground">
                  {t('search.recent', 'Recent Searches')}
                </h3>
                <button className="text-xs text-primary font-medium">
                  {t('search.clearAll', 'Clear All')}
                </button>
              </div>
              <div className="space-y-1">
                {recentSearches.map((term) => (
                  <button
                    key={term}
                    onClick={() => handleQuickSearch(term)}
                    className="flex items-center gap-3 w-full p-2.5 rounded-lg hover:bg-muted transition-colors text-left"
                  >
                    <Clock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-sm">{term}</span>
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* Trending */}
          <section className="mb-6">
            <h3 className="text-sm font-semibold text-foreground mb-2">
              {t('search.trending', 'Trending')}
            </h3>
            <div className="space-y-1">
              {trendingSearches.map((term) => (
                <button
                  key={term}
                  onClick={() => handleQuickSearch(term)}
                  className="flex items-center gap-3 w-full p-2.5 rounded-lg hover:bg-muted transition-colors text-left"
                >
                  <TrendingUp className="w-4 h-4 text-orange-500 flex-shrink-0" />
                  <span className="text-sm">{term}</span>
                </button>
              ))}
            </div>
          </section>

          {/* Location Filters */}
          <section>
            <h3 className="text-sm font-semibold text-foreground mb-2">
              {t('search.filterByLocation', 'Filter by Location')}
            </h3>
            <div className="space-y-1">
              {locationFilters.map((loc) => (
                <button
                  key={loc.id}
                  onClick={() => handleQuickSearch(loc.label)}
                  className="flex items-center gap-3 w-full p-2.5 rounded-lg hover:bg-muted transition-colors text-left"
                >
                  <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-sm">{loc.label}</span>
                </button>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
