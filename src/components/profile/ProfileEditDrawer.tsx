import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import type { Id } from '../../../convex/_generated/dataModel';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface ProfileEditDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentUser: {
    _id: Id<"users">;
    displayName?: string | null;
    name: string;
    bio?: string | null;
    isPublic?: boolean | null;
    capabilities?: string[] | null;
  } | null | undefined;
}

const CAPABILITY_OPTIONS = [
  { id: 'donor', label: 'Donor' },
  { id: 'volunteer', label: 'Volunteer' },
  { id: 'rescuer', label: 'Rescuer' },
  { id: 'clinic_partner', label: 'Clinic Partner' },
  { id: 'ngo_partner', label: 'NGO Partner' },
  { id: 'store_partner', label: 'Store Partner' },
];

export function ProfileEditDrawer({ open, onOpenChange, currentUser }: ProfileEditDrawerProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const updateProfile = useMutation(api.users.updateProfile);
  const updateCapabilities = useMutation(api.users.updateCapabilities);

  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [selectedCapabilities, setSelectedCapabilities] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Sync form state with currentUser when drawer opens
  useEffect(() => {
    if (open && currentUser) {
      setDisplayName(currentUser.displayName || currentUser.name || '');
      setBio(currentUser.bio || '');
      setIsPublic(currentUser.isPublic ?? true);
      setSelectedCapabilities(currentUser.capabilities ?? []);
    }
  }, [open, currentUser]);

  const toggleCapability = (capability: string) => {
    setSelectedCapabilities((prev) => (
      prev.includes(capability)
        ? prev.filter((c) => c !== capability)
        : [...prev, capability]
    ));
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        updateProfile({
          displayName: displayName.trim() || undefined,
          bio: bio.trim() || undefined,
          isPublic,
        }),
        updateCapabilities({
          capabilities: selectedCapabilities,
        }),
      ]);
      toast({
        title: t('profile.profileUpdated'),
        description: t('profile.profileUpdatedDesc'),
      });
      onOpenChange(false);
    } catch (error) {
      toast({
        title: t('common.error'),
        description: error instanceof Error ? error.message : t('common.unknownError'),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const bioCharCount = bio.length;
  const maxBioChars = 280;

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader>
            <DrawerTitle>{t('profile.editProfile')}</DrawerTitle>
            <DrawerDescription>{t('profile.editProfileDesc')}</DrawerDescription>
          </DrawerHeader>
          
          <div className="p-4 pb-0 space-y-4">
            {/* Display Name */}
            <div className="space-y-2">
              <Label htmlFor="displayName">{t('profile.displayName')}</Label>
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder={t('profile.displayNamePlaceholder')}
                maxLength={50}
              />
              <p className="text-xs text-muted-foreground">
                {t('profile.displayNameHint')}
              </p>
            </div>

            {/* Bio */}
            <div className="space-y-2">
              <Label htmlFor="bio">{t('profile.bio')}</Label>
              <Textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder={t('profile.bioPlaceholder')}
                maxLength={maxBioChars}
                rows={3}
                className="resize-none"
              />
              <p className={`text-xs ${bioCharCount > maxBioChars * 0.9 ? 'text-warning' : 'text-muted-foreground'}`}>
                {bioCharCount}/{maxBioChars}
              </p>
            </div>

            {/* Public Profile Toggle */}
            <div className="flex items-center justify-between py-2">
              <div className="space-y-0.5">
                <Label htmlFor="publicProfile">{t('profile.publicProfile')}</Label>
                <p className="text-xs text-muted-foreground">
                  {t('profile.publicProfileHint')}
                </p>
              </div>
              <Switch
                id="publicProfile"
                checked={isPublic}
                onCheckedChange={setIsPublic}
              />
            </div>

            {/* Capabilities */}
            <div className="space-y-2">
              <Label>{t('profile.capabilities', 'Capabilities')}</Label>
              <p className="text-xs text-muted-foreground">
                {t('profile.capabilitiesHint', 'Select all ways you participate in Pawtreon.')}
              </p>
              <div className="flex flex-wrap gap-2">
                {CAPABILITY_OPTIONS.map((option) => {
                  const selected = selectedCapabilities.includes(option.id);
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => toggleCapability(option.id)}
                      className={`px-3 py-1.5 rounded-full border text-xs font-medium transition-colors ${selected ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted/60 text-foreground border-border hover:bg-muted'}`}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <DrawerFooter>
            <Button onClick={handleSave} disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('common.save')}
            </Button>
            <DrawerClose asChild>
              <Button variant="outline">{t('common.cancel')}</Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
