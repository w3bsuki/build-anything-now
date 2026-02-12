import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useMutation, useQuery } from 'convex/react';
import { ArrowLeft, Bell, Mail, Globe, DollarSign, Smartphone, Heart, ChevronRight, User, Shield, HelpCircle, FileText, Check } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { api } from '../../convex/_generated/api';

const supportedLanguages = ['en', 'bg', 'uk', 'ru', 'de'] as const;

const currencies = [
  { code: 'EUR', labelKey: 'currencies.EUR' },
  { code: 'BGN', labelKey: 'currencies.BGN' },
  { code: 'USD', labelKey: 'currencies.USD' },
];

const Settings = () => {
  const { t, i18n } = useTranslation();
  const settings = useQuery(api.settings.getSettings);
  const updateSettings = useMutation(api.settings.update);
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  const [showCurrencySelector, setShowCurrencySelector] = useState(false);

  useEffect(() => {
    if (!settings) return;
    if (settings.language && i18n.language !== settings.language) {
      void i18n.changeLanguage(settings.language);
    }
  }, [settings, i18n]);

  const handleToggle = async (key: 'emailNotifications' | 'pushNotifications' | 'donationReminders' | 'marketingEmails', value: boolean) => {
    await updateSettings({ [key]: value });
  };

  const handleLanguageChange = async (langCode: string) => {
    await i18n.changeLanguage(langCode);
    await updateSettings({ language: langCode });
    setShowLanguageSelector(false);
  };

  const handleCurrencyChange = async (currencyCode: string) => {
    await updateSettings({ currency: currencyCode });
    setShowCurrencySelector(false);
  };

  if (settings === undefined) {
    return (
      <div className="min-h-screen bg-background pb-20 md:pb-8 md:pt-16">
        <div className="sticky top-0 md:top-14 z-40 bg-nav-surface/95 backdrop-blur-md border-b border-nav-border/70">
          <div className="flex items-center gap-3 px-4 py-3">
            <Link
              to="/account"
              className="w-9 h-9 flex items-center justify-center rounded-full bg-surface-sunken hover:bg-surface-sunken/90 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </Link>
            <div className="flex-1">
              <h1 className="text-lg font-semibold text-foreground">{t('settings.title')}</h1>
              <p className="text-xs text-muted-foreground">{t('common.loading', 'Loading…')}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 md:pb-8 md:pt-16">
      {/* Header */}
      <div className="sticky top-0 md:top-14 z-40 bg-nav-surface/95 backdrop-blur-md border-b border-nav-border/70">
        <div className="flex items-center gap-3 px-4 py-3">
          <Link
            to="/account"
            className="w-9 h-9 flex items-center justify-center rounded-full bg-surface-sunken hover:bg-surface-sunken/90 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </Link>
          <div className="flex-1">
            <h1 className="text-lg font-semibold text-foreground">{t('settings.title')}</h1>
            <p className="text-xs text-muted-foreground">{t('settings.subtitle')}</p>
          </div>
        </div>
      </div>

      {/* Notifications Section */}
      <section className="py-4">
        <div className="container mx-auto px-4">
          <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <Bell className="w-4 h-4" />
            {t('settings.notifications')}
          </h2>
          
          <div className="bg-surface-elevated rounded-2xl border border-border/60 shadow-xs overflow-hidden">
            <div className="p-4 flex items-center justify-between border-b border-border">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-muted-foreground" />
                <div>
                  <Label htmlFor="email-notifications" className="font-medium cursor-pointer">
                    {t('settings.emailNotifications')}
                  </Label>
                  <p className="text-xs text-muted-foreground">{t('settings.emailNotificationsDesc')}</p>
                </div>
              </div>
              <Switch
                id="email-notifications"
                checked={settings.emailNotifications}
                onCheckedChange={(checked) => void handleToggle('emailNotifications', checked)}
              />
            </div>
            
            <div className="p-4 flex items-center justify-between border-b border-border">
              <div className="flex items-center gap-3">
                <Smartphone className="w-5 h-5 text-muted-foreground" />
                <div>
                  <Label htmlFor="push-notifications" className="font-medium cursor-pointer">
                    {t('settings.pushNotifications')}
                  </Label>
                  <p className="text-xs text-muted-foreground">{t('settings.pushNotificationsDesc')}</p>
                </div>
              </div>
              <Switch
                id="push-notifications"
                checked={settings.pushNotifications}
                onCheckedChange={(checked) => void handleToggle('pushNotifications', checked)}
              />
            </div>
            
            <div className="p-4 flex items-center justify-between border-b border-border">
              <div className="flex items-center gap-3">
                <Heart className="w-5 h-5 text-muted-foreground" />
                <div>
                  <Label htmlFor="donation-reminders" className="font-medium cursor-pointer">
                    {t('settings.donationReminders')}
                  </Label>
                  <p className="text-xs text-muted-foreground">{t('settings.donationRemindersDesc')}</p>
                </div>
              </div>
              <Switch
                id="donation-reminders"
                checked={settings.donationReminders}
                onCheckedChange={(checked) => void handleToggle('donationReminders', checked)}
              />
            </div>
            
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-muted-foreground" />
                <div>
                  <Label htmlFor="marketing-emails" className="font-medium cursor-pointer">
                    {t('settings.marketingEmails')}
                  </Label>
                  <p className="text-xs text-muted-foreground">{t('settings.marketingEmailsDesc')}</p>
                </div>
              </div>
              <Switch
                id="marketing-emails"
                checked={settings.marketingEmails}
                onCheckedChange={(checked) => void handleToggle('marketingEmails', checked)}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Preferences Section */}
      <section className="py-4">
        <div className="container mx-auto px-4">
          <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <Globe className="w-4 h-4" />
            {t('settings.preferences')}
          </h2>
          
          <div className="bg-surface-elevated rounded-2xl border border-border/60 shadow-xs overflow-hidden">
            <button 
              onClick={() => setShowLanguageSelector(true)}
              className="w-full p-4 flex items-center justify-between border-b border-border hover:bg-surface-sunken/70 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-muted-foreground" />
                <div className="text-left">
                  <p className="font-medium text-foreground">{t('settings.language')}</p>
                  <p className="text-xs text-muted-foreground">
                    {t(`languages.${i18n.language}`)}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
            
            <button 
              onClick={() => setShowCurrencySelector(true)}
              className="w-full p-4 flex items-center justify-between hover:bg-surface-sunken/70 transition-colors"
            >
              <div className="flex items-center gap-3">
                <DollarSign className="w-5 h-5 text-muted-foreground" />
                <div className="text-left">
                  <p className="font-medium text-foreground">{t('settings.currency')}</p>
                  <p className="text-xs text-muted-foreground">
                    {currencies.find(c => c.code === settings.currency)?.labelKey && t(currencies.find(c => c.code === settings.currency)!.labelKey)}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </div>
      </section>

      {/* Account Section */}
      <section className="py-4">
        <div className="container mx-auto px-4">
          <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <User className="w-4 h-4" />
            {t('settings.account')}
          </h2>
          
          <div className="bg-surface-elevated rounded-2xl border border-border/60 shadow-xs overflow-hidden">
            <Link 
              to="/profile/edit"
              className="w-full p-4 flex items-center justify-between border-b border-border hover:bg-surface-sunken/70 transition-colors"
            >
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-muted-foreground" />
                <span className="font-medium text-foreground">{t('settings.editProfile')}</span>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </Link>
            
            <button className="w-full p-4 flex items-center justify-between hover:bg-surface-sunken/70 transition-colors">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-muted-foreground" />
                <span className="font-medium text-foreground">{t('settings.privacySecurity')}</span>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </div>
      </section>

      {/* Support Section */}
      <section className="py-4">
        <div className="container mx-auto px-4">
          <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <HelpCircle className="w-4 h-4" />
            {t('settings.support')}
          </h2>
          
          <div className="bg-surface-elevated rounded-2xl border border-border/60 shadow-xs overflow-hidden">
            <button
              type="button"
              disabled
              aria-disabled="true"
              className="w-full p-4 flex items-center justify-between border-b border-border opacity-70 cursor-not-allowed"
            >
              <div className="flex items-center gap-3">
                <HelpCircle className="w-5 h-5 text-muted-foreground" />
                <span className="font-medium text-foreground">{t('settings.helpCenter')}</span>
              </div>
              <span className="text-xs text-muted-foreground">{t('common.comingSoon', 'Coming soon')}</span>
            </button>
            
            <button
              type="button"
              disabled
              aria-disabled="true"
              className="w-full p-4 flex items-center justify-between opacity-70 cursor-not-allowed"
            >
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-muted-foreground" />
                <span className="font-medium text-foreground">{t('settings.termsPrivacy')}</span>
              </div>
              <span className="text-xs text-muted-foreground">{t('common.comingSoon', 'Coming soon')}</span>
            </button>
          </div>
        </div>
      </section>

      {/* App Version */}
      <section className="py-4">
        <div className="container mx-auto px-4 text-center">
          <p className="text-xs text-muted-foreground">
            {t('settings.appVersion')}
          </p>
        </div>
      </section>

      {/* Language Selector Modal */}
      {showLanguageSelector && (
        <>
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            onClick={() => setShowLanguageSelector(false)}
          />
          <div className="fixed bottom-0 left-0 right-0 z-50 bg-card rounded-t-3xl p-6 pb-8 animate-in slide-in-from-bottom duration-200 md:bottom-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-2xl md:max-w-sm md:w-full">
            <div className="w-12 h-1 bg-muted rounded-full mx-auto mb-6 md:hidden" />
            <h3 className="text-lg font-semibold text-foreground mb-4 text-center">{t('settings.language')}</h3>
            <div className="space-y-2">
              {supportedLanguages.map((langCode) => (
                <button
                  key={langCode}
                  onClick={() => handleLanguageChange(langCode)}
                  className={cn(
                    "w-full p-4 flex items-center justify-between rounded-xl transition-colors",
                    i18n.language === langCode 
                      ? "bg-primary/10 border border-primary/30" 
                      : "bg-muted/50 hover:bg-muted"
                  )}
                >
                  <span className={cn(
                    "font-medium",
                    i18n.language === langCode ? "text-primary" : "text-foreground"
                  )}>
                    {t(`languages.${langCode}`)}
                  </span>
                  {i18n.language === langCode && (
                    <Check className="w-5 h-5 text-primary" />
                  )}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowLanguageSelector(false)}
              className="w-full mt-4 p-3 text-muted-foreground font-medium hover:bg-muted rounded-xl transition-colors"
            >
              {t('actions.cancel')}
            </button>
          </div>
        </>
      )}

      {/* Currency Selector Modal */}
      {showCurrencySelector && (
        <>
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            onClick={() => setShowCurrencySelector(false)}
          />
          <div className="fixed bottom-0 left-0 right-0 z-50 bg-card rounded-t-3xl p-6 pb-8 animate-in slide-in-from-bottom duration-200 md:bottom-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-2xl md:max-w-sm md:w-full">
            <div className="w-12 h-1 bg-muted rounded-full mx-auto mb-6 md:hidden" />
            <h3 className="text-lg font-semibold text-foreground mb-4 text-center">{t('settings.currency')}</h3>
            <div className="space-y-2">
              {currencies.map((currency) => (
                <button
                  key={currency.code}
                  onClick={() => handleCurrencyChange(currency.code)}
                  className={cn(
                    "w-full p-4 flex items-center justify-between rounded-xl transition-colors",
                    settings.currency === currency.code 
                      ? "bg-primary/10 border border-primary/30" 
                      : "bg-muted/50 hover:bg-muted"
                  )}
                >
                  <span className={cn(
                    "font-medium",
                    settings.currency === currency.code ? "text-primary" : "text-foreground"
                  )}>
                    {t(currency.labelKey)}
                  </span>
                  {settings.currency === currency.code && (
                    <Check className="w-5 h-5 text-primary" />
                  )}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowCurrencySelector(false)}
              className="w-full mt-4 p-3 text-muted-foreground font-medium hover:bg-muted rounded-xl transition-colors"
            >
              {t('actions.cancel')}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Settings;
