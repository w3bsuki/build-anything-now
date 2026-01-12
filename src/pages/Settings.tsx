import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Bell, Mail, Globe, DollarSign, Smartphone, Heart, ChevronRight, User, Shield, HelpCircle, FileText, Check } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

// Mock data - will be replaced with Convex data
const mockSettings = {
  emailNotifications: true,
  pushNotifications: true,
  donationReminders: true,
  marketingEmails: false,
  currency: 'BGN',
};

const supportedLanguages = ['en', 'bg', 'uk', 'ru', 'de'] as const;

const currencies = [
  { code: 'BGN', labelKey: 'currencies.BGN' },
  { code: 'EUR', labelKey: 'currencies.EUR' },
  { code: 'USD', labelKey: 'currencies.USD' },
];

const Settings = () => {
  const { t, i18n } = useTranslation();
  const [settings, setSettings] = useState(mockSettings);
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  const [showCurrencySelector, setShowCurrencySelector] = useState(false);

  const handleToggle = (key: string, value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    // TODO: Implement with useMutation(api.settings.update)
    console.log('Toggle', key, value);
  };

  const handleLanguageChange = (langCode: string) => {
    i18n.changeLanguage(langCode);
    setShowLanguageSelector(false);
  };

  const handleCurrencyChange = (currencyCode: string) => {
    setSettings(prev => ({ ...prev, currency: currencyCode }));
    setShowCurrencySelector(false);
    // TODO: Implement with useMutation(api.settings.update)
  };

  return (
    <div className="min-h-screen pb-20 md:pb-8 md:pt-16">
      {/* Header */}
      <div className="sticky top-0 md:top-14 z-40 bg-card/95 backdrop-blur-md border-b border-border">
        <div className="flex items-center gap-3 px-4 py-3">
          <Link
            to="/profile"
            className="w-9 h-9 flex items-center justify-center rounded-full bg-muted hover:bg-muted/80 transition-colors"
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
          
          <div className="bg-card rounded-xl border border-border overflow-hidden">
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
                onCheckedChange={(checked) => handleToggle('emailNotifications', checked)}
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
                onCheckedChange={(checked) => handleToggle('pushNotifications', checked)}
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
                onCheckedChange={(checked) => handleToggle('donationReminders', checked)}
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
                onCheckedChange={(checked) => handleToggle('marketingEmails', checked)}
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
          
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <button 
              onClick={() => setShowLanguageSelector(true)}
              className="w-full p-4 flex items-center justify-between border-b border-border hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-muted-foreground" />
                <div className="text-left">
                  <p className="font-medium text-foreground">{t('settings.language')}</p>
                  <p className="text-xs text-muted-foreground">
                    {t(`languages.${i18n.language}` as any)}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
            
            <button 
              onClick={() => setShowCurrencySelector(true)}
              className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <DollarSign className="w-5 h-5 text-muted-foreground" />
                <div className="text-left">
                  <p className="font-medium text-foreground">{t('settings.currency')}</p>
                  <p className="text-xs text-muted-foreground">
                    {t(currencies.find(c => c.code === settings.currency)?.labelKey as any)}
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
          
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <Link 
              to="/profile/edit"
              className="w-full p-4 flex items-center justify-between border-b border-border hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-muted-foreground" />
                <span className="font-medium text-foreground">{t('settings.editProfile')}</span>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </Link>
            
            <button className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
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
          
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <button className="w-full p-4 flex items-center justify-between border-b border-border hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3">
                <HelpCircle className="w-5 h-5 text-muted-foreground" />
                <span className="font-medium text-foreground">{t('settings.helpCenter')}</span>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
            
            <button className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-muted-foreground" />
                <span className="font-medium text-foreground">{t('settings.termsPrivacy')}</span>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
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
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]"
            onClick={() => setShowLanguageSelector(false)}
          />
          <div className="fixed bottom-0 left-0 right-0 z-[70] bg-card rounded-t-3xl p-6 pb-8 animate-in slide-in-from-bottom duration-200 md:bottom-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-2xl md:max-w-sm md:w-full">
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
                    {t(`languages.${langCode}` as any)}
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
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]"
            onClick={() => setShowCurrencySelector(false)}
          />
          <div className="fixed bottom-0 left-0 right-0 z-[70] bg-card rounded-t-3xl p-6 pb-8 animate-in slide-in-from-bottom duration-200 md:bottom-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-2xl md:max-w-sm md:w-full">
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
                    {t(currency.labelKey as any)}
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
