import { useCallback, useEffect, useRef, useState } from 'react';
import { X, Search, Clock, TrendingUp, MapPin } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch: (query: string) => void;
}

const RECENT_SEARCHES_STORAGE_KEY = 'pawtreon:recent-searches';
const MAX_RECENT_SEARCHES = 6;

const defaultRecentSearches = [
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
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    if (typeof window === 'undefined') {
      return defaultRecentSearches;
    }

    const stored = window.localStorage.getItem(RECENT_SEARCHES_STORAGE_KEY);
    if (!stored) {
      return defaultRecentSearches;
    }

    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.every((item) => typeof item === 'string')) {
        return parsed.slice(0, MAX_RECENT_SEARCHES);
      }
    } catch {
      window.localStorage.removeItem(RECENT_SEARCHES_STORAGE_KEY);
    }

    return defaultRecentSearches;
  });
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClose = useCallback(() => {
    setQuery('');
    onClose();
  }, [onClose]);

  const persistRecentSearches = useCallback((values: string[]) => {
    setRecentSearches(values);
    if (values.length === 0) {
      window.localStorage.removeItem(RECENT_SEARCHES_STORAGE_KEY);
      return;
    }
    window.localStorage.setItem(RECENT_SEARCHES_STORAGE_KEY, JSON.stringify(values));
  }, []);

  const addRecentSearch = useCallback((term: string) => {
    const normalized = term.trim();
    if (!normalized) return;

    setRecentSearches((prev) => {
      const next = [normalized, ...prev.filter((existing) => existing.toLowerCase() !== normalized.toLowerCase())]
        .slice(0, MAX_RECENT_SEARCHES);
      window.localStorage.setItem(RECENT_SEARCHES_STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  // Focus input when overlay opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
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
      const normalized = query.trim();
      addRecentSearch(normalized);
      onSearch(normalized);
      handleClose();
    }
  };

  const handleQuickSearch = (term: string) => {
    addRecentSearch(term);
    onSearch(term);
    handleClose();
  };

  const handleClearRecent = () => {
    persistRecentSearches([]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-background/95 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Content */}
      <div className="relative h-full flex flex-col">
        {/* Search Header */}
        <div
          className="flex items-center gap-3 p-4"
          style={{ paddingTop: 'calc(env(safe-area-inset-top) + 16px)' }}
        >
          <form onSubmit={handleSubmit} className="flex-1 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('home.searchPlaceholder', 'Search cases, users, locations...')}
              className="w-full rounded-full border border-search-border bg-search-bg pl-10 pr-4 py-2.5 text-base text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring-strong focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            />
          </form>
          <button
            type="button"
            onClick={handleClose}
            className="inline-flex size-11 items-center justify-center rounded-full border border-border/60 bg-surface text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring-strong focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            aria-label={t('actions.close', 'Close')}
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
                <button
                  type="button"
                  onClick={handleClearRecent}
                  className="text-xs text-primary font-medium rounded-md px-2 py-1 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring-strong focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  {t('search.clearAll', 'Clear All')}
                </button>
              </div>
              <div className="space-y-1">
                {recentSearches.map((term) => (
                  <button
                    type="button"
                    key={term}
                    onClick={() => handleQuickSearch(term)}
                    className="flex min-h-11 w-full items-center gap-3 rounded-lg p-2.5 text-left transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring-strong focus-visible:ring-offset-2 focus-visible:ring-offset-background"
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
                  type="button"
                  key={term}
                  onClick={() => handleQuickSearch(term)}
                  className="flex min-h-11 w-full items-center gap-3 rounded-lg p-2.5 text-left transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring-strong focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  <TrendingUp className="w-4 h-4 text-primary flex-shrink-0" />
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
                  type="button"
                  key={loc.id}
                  onClick={() => handleQuickSearch(loc.label)}
                  className="flex min-h-11 w-full items-center gap-3 rounded-lg p-2.5 text-left transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring-strong focus-visible:ring-offset-2 focus-visible:ring-offset-background"
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
