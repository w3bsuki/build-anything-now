import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useMutation, useQuery } from 'convex/react';
import { ArrowLeft, Bell, Mail, Globe, DollarSign, Smartphone, Heart, ChevronRight, User, Shield, HelpCircle, FileText, Check, HandHeart, MapPin } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { toast } from '@/components/ui/use-toast';
import { api } from '../../convex/_generated/api';

const supportedLanguages = ['en', 'bg', 'uk', 'ru', 'de'] as const;

const currencies = [
  { code: 'EUR', labelKey: 'currencies.EUR' },
  { code: 'BGN', labelKey: 'currencies.BGN' },
  { code: 'USD', labelKey: 'currencies.USD' },
];

type VolunteerAvailability = 'available' | 'busy' | 'offline';
type VolunteerCapability = 'transport' | 'fostering' | 'rescue' | 'events' | 'social_media' | 'medical' | 'general';

const volunteerAvailabilityValues: VolunteerAvailability[] = ['available', 'busy', 'offline'];
const volunteerCapabilityValues: VolunteerCapability[] = ['transport', 'fostering', 'rescue', 'events', 'social_media', 'medical', 'general'];

const Settings = () => {
  const { t, i18n } = useTranslation();
  const me = useQuery(api.users.me);
  const settings = useQuery(api.settings.getSettings);
  const updateSettings = useMutation(api.settings.update);
  const createDataExport = useMutation(api.gdpr.createDataExport);
  const createVolunteerProfile = useMutation(api.volunteers.create);
  const updateVolunteerAvailability = useMutation(api.volunteers.updateAvailability);
  const updateVolunteerCapabilities = useMutation(api.volunteers.updateCapabilities);
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  const [showCurrencySelector, setShowCurrencySelector] = useState(false);
  const [volunteerAvailability, setVolunteerAvailability] = useState<VolunteerAvailability>('offline');
  const [volunteerCapabilities, setVolunteerCapabilities] = useState<VolunteerCapability[]>([]);
  const [isSavingVolunteerSettings, setIsSavingVolunteerSettings] = useState(false);
  const [isExportingData, setIsExportingData] = useState(false);

  useEffect(() => {
    if (!settings) return;
    if (settings.language && i18n.language !== settings.language) {
      void i18n.changeLanguage(settings.language);
    }
  }, [settings, i18n]);

  const isVolunteerUser = me?.role === 'volunteer' || me?.userType === 'volunteer';

  useEffect(() => {
    if (!me || !isVolunteerUser) return;

    const availability = me.volunteerAvailability;
    setVolunteerAvailability(
      availability === 'available' || availability === 'busy' || availability === 'offline'
        ? availability
        : 'offline'
    );

    const nextCapabilities = (me.volunteerCapabilities ?? []).filter((value): value is VolunteerCapability =>
      volunteerCapabilityValues.includes(value as VolunteerCapability),
    );
    setVolunteerCapabilities(Array.from(new Set(nextCapabilities)));
  }, [isVolunteerUser, me]);

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

  const ensureVolunteerProfile = async () => {
    try {
      await createVolunteerProfile({
        bio: me?.bio?.trim() || t('volunteers.settings.defaultBio', 'Volunteer ready to help nearby cases.'),
        location: me?.volunteerCity || me?.city || '',
      });
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  };

  const applyAvailabilityMutation = async (next: VolunteerAvailability) => {
    try {
      await updateVolunteerAvailability({ availability: next });
      return;
    } catch (error) {
      if (!(error as Error).message.includes('Volunteer profile not found')) {
        throw error;
      }
    }

    const created = await ensureVolunteerProfile();
    if (!created) {
      throw new Error('Failed to create volunteer profile');
    }

    await updateVolunteerAvailability({ availability: next });
  };

  const applyCapabilitiesMutation = async (nextCapabilities: VolunteerCapability[]) => {
    try {
      await updateVolunteerCapabilities({ capabilities: nextCapabilities });
      return;
    } catch (error) {
      if (!(error as Error).message.includes('Volunteer profile not found')) {
        throw error;
      }
    }

    const created = await ensureVolunteerProfile();
    if (!created) {
      throw new Error('Failed to create volunteer profile');
    }

    await updateVolunteerCapabilities({ capabilities: nextCapabilities });
  };

  const saveAvailability = async (next: VolunteerAvailability) => {
    if (!isVolunteerUser || next === volunteerAvailability) return;

    const previous = volunteerAvailability;
    setVolunteerAvailability(next);
    setIsSavingVolunteerSettings(true);

    try {
      await applyAvailabilityMutation(next);
    } catch (error) {
      console.error(error);
      setVolunteerAvailability(previous);
      toast({
        title: t('common.error', 'Error'),
        description: t('volunteers.settings.saveFailed', 'Could not save volunteer settings. Please try again.'),
        variant: 'destructive',
      });
    } finally {
      setIsSavingVolunteerSettings(false);
    }
  };

  const toggleCapability = async (capability: VolunteerCapability) => {
    if (!isVolunteerUser || isSavingVolunteerSettings) return;

    const nextCapabilities = volunteerCapabilities.includes(capability)
      ? volunteerCapabilities.filter((item) => item !== capability)
      : [...volunteerCapabilities, capability];

    setVolunteerCapabilities(nextCapabilities);
    setIsSavingVolunteerSettings(true);

    try {
      await applyCapabilitiesMutation(nextCapabilities);
    } catch (error) {
      console.error(error);
      setVolunteerCapabilities(volunteerCapabilities);
      toast({
        title: t('common.error', 'Error'),
        description: t('volunteers.settings.saveFailed', 'Could not save volunteer settings. Please try again.'),
        variant: 'destructive',
      });
    } finally {
      setIsSavingVolunteerSettings(false);
    }
  };

  const handleDataExport = async () => {
    if (isExportingData) return;
    setIsExportingData(true);

    try {
      const payload = await createDataExport({});
      const blob = new Blob([JSON.stringify(payload, null, 2)], {
        type: 'application/json',
      });
      const exportUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = exportUrl;
      link.download = `pawtreon-data-export-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(exportUrl);

      toast({
        title: t('settings.dataExportReady'),
        description: t('settings.dataExportReadyDesc'),
      });
    } catch (error) {
      console.error(error);
      toast({
        title: t('common.error', 'Error'),
        description: t('settings.dataExportFailed'),
        variant: 'destructive',
      });
    } finally {
      setIsExportingData(false);
    }
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

      {isVolunteerUser && (
        <section className="py-4">
          <div className="container mx-auto px-4">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
              <HandHeart className="h-4 w-4" />
              {t('volunteers.settings.title', 'Volunteer coordination')}
            </h2>

            <div className="overflow-hidden rounded-2xl border border-border/60 bg-surface-elevated shadow-xs">
              <div className="border-b border-border p-4">
                <p className="font-medium text-foreground">{t('volunteers.settings.availabilityTitle', 'Availability status')}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {t('volunteers.settings.availabilityHint', 'Default is offline. Your city is visible only when you opt in.')}
                </p>

                <div className="mt-3 flex flex-wrap gap-2">
                  {volunteerAvailabilityValues.map((value) => (
                    <button
                      key={value}
                      type="button"
                      disabled={isSavingVolunteerSettings}
                      onClick={() => void saveAvailability(value)}
                      className={cn(
                        'h-11 rounded-xl border px-3 text-sm font-medium transition-colors',
                        volunteerAvailability === value
                          ? 'border-primary/35 bg-primary/10 text-primary'
                          : 'border-border/70 bg-surface text-foreground hover:bg-surface-sunken',
                      )}
                    >
                      {t(`volunteers.availability.${value}`)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-4">
                <p className="font-medium text-foreground">{t('volunteers.settings.capabilitiesTitle', 'Capabilities')}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {t('volunteers.settings.capabilitiesHint', 'Select all ways you can help nearby cases.')}
                </p>

                <div className="mt-3 flex flex-wrap gap-2">
                  {volunteerCapabilityValues.map((value) => (
                    <button
                      key={value}
                      type="button"
                      disabled={isSavingVolunteerSettings}
                      onClick={() => void toggleCapability(value)}
                      className={cn(
                        'h-11 rounded-xl border px-3 text-sm font-medium transition-colors',
                        volunteerCapabilities.includes(value)
                          ? 'border-primary/35 bg-primary/10 text-primary'
                          : 'border-border/70 bg-surface text-foreground hover:bg-surface-sunken',
                      )}
                    >
                      {t(`volunteers.capabilities.${value}`)}
                    </button>
                  ))}
                </div>

                <Link
                  to="/volunteers"
                  className="mt-4 inline-flex h-11 items-center gap-2 rounded-xl border border-border/70 bg-surface px-3 text-sm font-medium text-foreground transition-colors hover:bg-surface-sunken"
                >
                  <MapPin className="h-4 w-4" />
                  {t('volunteers.settings.openDirectory', 'Open volunteer directory')}
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

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

            <Link
              to="/subscriptions"
              className="w-full p-4 flex items-center justify-between border-b border-border hover:bg-surface-sunken/70 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Heart className="w-5 h-5 text-muted-foreground" />
                <div className="text-left">
                  <p className="font-medium text-foreground">{t('settings.manageSubscriptions')}</p>
                  <p className="text-xs text-muted-foreground">{t('settings.manageSubscriptionsDesc')}</p>
                </div>
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

            <button
              type="button"
              onClick={() => void handleDataExport()}
              disabled={isExportingData}
              className={cn(
                "w-full p-4 flex items-center justify-between border-t border-border transition-colors",
                isExportingData ? "cursor-wait opacity-80" : "hover:bg-surface-sunken/70",
              )}
            >
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-muted-foreground" />
                <div className="text-left">
                  <p className="font-medium text-foreground">{t('settings.downloadData')}</p>
                  <p className="text-xs text-muted-foreground">{t('settings.downloadDataDesc')}</p>
                </div>
              </div>
              <span className="text-xs text-muted-foreground">
                {isExportingData ? t('settings.downloadingData') : t('settings.downloadDataAction')}
              </span>
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
            className="fixed inset-0 bg-overlay-dim backdrop-blur-sm z-40"
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
            className="fixed inset-0 bg-overlay-dim backdrop-blur-sm z-40"
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
