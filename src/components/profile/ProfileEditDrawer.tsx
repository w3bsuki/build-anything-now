import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
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
    _id: string;
    displayName?: string;
    name: string;
    bio?: string;
    isPublic?: boolean;
  } | null | undefined;
}

export function ProfileEditDrawer({ open, onOpenChange, currentUser }: ProfileEditDrawerProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const updateProfile = useMutation(api.users.updateProfile);

  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // Sync form state with currentUser when drawer opens
  useEffect(() => {
    if (open && currentUser) {
      setDisplayName(currentUser.displayName || currentUser.name || '');
      setBio(currentUser.bio || '');
      setIsPublic(currentUser.isPublic ?? true);
    }
  }, [open, currentUser]);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await updateProfile({
        displayName: displayName.trim() || undefined,
        bio: bio.trim() || undefined,
        isPublic,
      });
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
