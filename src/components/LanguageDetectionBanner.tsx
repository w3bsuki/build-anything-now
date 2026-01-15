import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { Globe, X, ChevronDown, Check, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

const STORAGE_KEY = 'pawsy_language_prompt_dismissed';
const COUNTRY_LANGUAGE_MAP: Record<string, string> = {
  BG: 'bg', // Bulgaria
  UA: 'uk', // Ukraine
  RU: 'ru', // Russia
  DE: 'de', // Germany
  AT: 'de', // Austria
  CH: 'de', // Switzerland (German)
};

const COUNTRY_NAMES: Record<string, Record<string, string>> = {
  BG: { en: 'Bulgaria', bg: 'България' },
  UA: { en: 'Ukraine', uk: 'Україна' },
  RU: { en: 'Russia', ru: 'Россия' },
  DE: { en: 'Germany', de: 'Deutschland' },
  AT: { en: 'Austria', de: 'Österreich' },
  CH: { en: 'Switzerland', de: 'Schweiz' },
};

const supportedLanguages = ['bg', 'uk', 'ru', 'de', 'en'] as const;

export function LanguageDetectionBanner() {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const [detectedCountry, setDetectedCountry] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);

  // Hide on presentation, partner, and auth pages
  const isPresentation = location.pathname === '/presentation' || 
                        location.pathname === '/partner' ||
                        location.pathname.startsWith('/sign-in') ||
                        location.pathname.startsWith('/sign-up');

  useEffect(() => {
    // Check if user already dismissed the prompt
    const dismissed = localStorage.getItem(STORAGE_KEY);
    if (dismissed) {
      setIsLoading(false);
      return;
    }

    // Check if user already has a language preference set
    const savedLanguage = localStorage.getItem('i18nextLng');
    if (savedLanguage && savedLanguage !== 'en') {
      // User already chose a language, don't show banner
      setIsLoading(false);
      return;
    }

    // Detect user's country via IP geolocation
    detectCountry();
  }, []);

  const detectCountry = async () => {
    try {
      // Using ipapi.co (free tier, HTTPS, 1000 req/day)
      const response = await fetch('https://ipapi.co/json/');
      const data: { country_code: string } = await response.json();
      
      const countryCode = data.country_code;
      const suggestedLang = COUNTRY_LANGUAGE_MAP[countryCode];
      
      // Show banner if we detected a supported country (even if current lang matches)
      if (suggestedLang) {
        setDetectedCountry(countryCode);
        setIsVisible(true);
      }
    } catch (error) {
      console.warn('Could not detect location:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLanguageSelect = (langCode: string) => {
    i18n.changeLanguage(langCode);
    handleDismiss();
  };

  const handleDismiss = () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setIsVisible(false);
    setShowDropdown(false);
  };

  if (isLoading || !isVisible || !detectedCountry || isPresentation) {
    return null;
  }

  const suggestedLang = COUNTRY_LANGUAGE_MAP[detectedCountry];
  const countryName = COUNTRY_NAMES[detectedCountry]?.[i18n.language] || 
                      COUNTRY_NAMES[detectedCountry]?.en || 
                      detectedCountry;

  return (
    <>
      <div className="fixed top-14 md:top-14 left-0 right-0 z-40 animate-in slide-in-from-top duration-300">
        <div className="bg-primary/95 backdrop-blur-sm text-primary-foreground px-4 py-2.5">
          <div className="container mx-auto flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <Globe className="w-4 h-4 shrink-0" />
              <p className="text-sm truncate">
                {t('languageBanner.selectLanguage')}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-full text-sm font-medium transition-colors"
              >
                <span>{t(`languages.${suggestedLang}`)}</span>
                <ChevronDown className={cn("w-3.5 h-3.5 transition-transform", showDropdown && "rotate-180")} />
              </button>
              <button
                onClick={handleDismiss}
                className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors"
                aria-label={t('actions.cancel')}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Language Dropdown */}
      {showDropdown && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowDropdown(false)}
          />
          <div className="fixed top-28 md:top-32 right-4 z-50 bg-card rounded-xl shadow-lg border border-border overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 min-w-44">
            {supportedLanguages.map((langCode) => {
              const isSuggested = langCode === suggestedLang;
              const isActive = langCode === i18n.language;
              
              return (
                <button
                  key={langCode}
                  onClick={() => handleLanguageSelect(langCode)}
                  className={cn(
                    "w-full px-4 py-3 flex items-center justify-between text-left hover:bg-muted/50 transition-colors text-sm",
                    isActive && "bg-primary/5"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "font-medium",
                      isActive ? "text-primary" : "text-foreground"
                    )}>
                      {t(`languages.${langCode}`)}
                    </span>
                    {isSuggested && !isActive && (
                      <span className="flex items-center gap-1 text-xs px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                        <Sparkles className="w-2.5 h-2.5" />
                        {t('languageBanner.suggested')}
                      </span>
                    )}
                  </div>
                  {isActive && <Check className="w-4 h-4 text-primary" />}
                </button>
              );
            })}
          </div>
        </>
      )}
    </>
  );
}
