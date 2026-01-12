import { Link } from 'react-router-dom';
import { ArrowLeft, Settings as SettingsIcon, Bell, Mail, Globe, DollarSign, Smartphone, Heart, ChevronRight, User, Shield, HelpCircle, FileText } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

// Mock data - will be replaced with Convex data
const mockSettings = {
  emailNotifications: true,
  pushNotifications: true,
  donationReminders: true,
  marketingEmails: false,
  language: 'en',
  currency: 'BGN',
};

const languages = [
  { code: 'en', label: 'English' },
  { code: 'bg', label: 'Bulgarian' },
];

const currencies = [
  { code: 'BGN', label: 'Bulgarian Lev (BGN)' },
  { code: 'EUR', label: 'Euro (EUR)' },
  { code: 'USD', label: 'US Dollar (USD)' },
];

const Settings = () => {
  // TODO: Replace with useQuery(api.settings.getMySettings)
  const settings = mockSettings;

  const handleToggle = (key: string, value: boolean) => {
    // TODO: Implement with useMutation(api.settings.update)
    console.log('Toggle', key, value);
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
            <h1 className="text-lg font-semibold text-foreground">Settings</h1>
            <p className="text-xs text-muted-foreground">Manage your preferences</p>
          </div>
        </div>
      </div>

      {/* Notifications Section */}
      <section className="py-4">
        <div className="container mx-auto px-4">
          <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <Bell className="w-4 h-4" />
            Notifications
          </h2>
          
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="p-4 flex items-center justify-between border-b border-border">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-muted-foreground" />
                <div>
                  <Label htmlFor="email-notifications" className="font-medium cursor-pointer">
                    Email Notifications
                  </Label>
                  <p className="text-xs text-muted-foreground">Receive updates via email</p>
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
                    Push Notifications
                  </Label>
                  <p className="text-xs text-muted-foreground">Get notified on your device</p>
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
                    Donation Reminders
                  </Label>
                  <p className="text-xs text-muted-foreground">Monthly giving reminders</p>
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
                    Marketing Emails
                  </Label>
                  <p className="text-xs text-muted-foreground">News and special campaigns</p>
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
            Preferences
          </h2>
          
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <button className="w-full p-4 flex items-center justify-between border-b border-border hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-muted-foreground" />
                <div className="text-left">
                  <p className="font-medium text-foreground">Language</p>
                  <p className="text-xs text-muted-foreground">
                    {languages.find(l => l.code === settings.language)?.label}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
            
            <button className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3">
                <DollarSign className="w-5 h-5 text-muted-foreground" />
                <div className="text-left">
                  <p className="font-medium text-foreground">Currency</p>
                  <p className="text-xs text-muted-foreground">
                    {currencies.find(c => c.code === settings.currency)?.label}
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
            Account
          </h2>
          
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <Link 
              to="/profile/edit"
              className="w-full p-4 flex items-center justify-between border-b border-border hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-muted-foreground" />
                <span className="font-medium text-foreground">Edit Profile</span>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </Link>
            
            <button className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-muted-foreground" />
                <span className="font-medium text-foreground">Privacy & Security</span>
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
            Support
          </h2>
          
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <button className="w-full p-4 flex items-center justify-between border-b border-border hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3">
                <HelpCircle className="w-5 h-5 text-muted-foreground" />
                <span className="font-medium text-foreground">Help Center</span>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
            
            <button className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-muted-foreground" />
                <span className="font-medium text-foreground">Terms & Privacy</span>
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
            Pawsy v1.0.0
          </p>
        </div>
      </section>
    </div>
  );
};

export default Settings;
