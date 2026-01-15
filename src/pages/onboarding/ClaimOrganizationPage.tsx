import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { useQuery, useMutation, useConvexAuth } from 'convex/react';
import { useTranslation } from 'react-i18next';
import { 
  Search, 
  Building2, 
  MapPin, 
  ArrowLeft, 
  ArrowRight, 
  Check,
  BadgeCheck,
  Clock,
  Plus,
  Phone,
  Mail,
  User,
  ChevronRight,
  Loader2
} from 'lucide-react';
import { api } from '../../../convex/_generated/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from '@/lib/utils';
import { Id } from '../../../convex/_generated/dataModel';

interface ClaimFormData {
  clinicId: Id<"clinics"> | null;
  clinicName: string;
  claimerRole: string;
  claimerEmail: string;
  claimerPhone: string;
  additionalInfo: string;
}

export default function ClaimOrganizationPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isSignedIn, isLoaded } = useAuth();
  const { isAuthenticated, isLoading: isConvexLoading } = useConvexAuth();
  
  const completeOnboarding = useMutation(api.users.completeOnboarding);
  const submitClaim = useMutation(api.clinics.submitClaim);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showClaimDialog, setShowClaimDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [claimSuccess, setClaimSuccess] = useState(false);
  
  const [formData, setFormData] = useState<ClaimFormData>({
    clinicId: null,
    clinicName: '',
    claimerRole: '',
    claimerEmail: '',
    claimerPhone: '',
    additionalInfo: '',
  });

  // Search clinics as user types - hook must be called before any returns
  const searchResults = useQuery(
    api.clinics.searchForClaim, 
    searchQuery.length >= 2 ? { searchText: searchQuery } : "skip"
  );
  const isSearching = searchQuery.length >= 2 && searchResults === undefined;

  // Redirect to sign-in if not authenticated
  if (isLoaded && !isSignedIn) {
    navigate('/sign-in', { replace: true });
    return null;
  }

  const handleClaimClick = (clinic: NonNullable<typeof searchResults>[number]) => {
    setFormData(prev => ({
      ...prev,
      clinicId: clinic._id,
      clinicName: clinic.name,
    }));
    setShowClaimDialog(true);
  };

  const handleSubmitClaim = async () => {
    if (!formData.clinicId || !formData.claimerRole || !formData.claimerEmail || !isAuthenticated) return;
    
    setIsSubmitting(true);
    
    try {
      await submitClaim({
        clinicId: formData.clinicId,
        claimerRole: formData.claimerRole,
        claimerEmail: formData.claimerEmail,
        claimerPhone: formData.claimerPhone || undefined,
        additionalInfo: formData.additionalInfo || undefined,
      });
      
      // Complete onboarding as organization
      await completeOnboarding({ userType: 'organization' });
      
      setClaimSuccess(true);
      
      // Navigate to home after short delay
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (error) {
      console.error('Failed to submit claim:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = async () => {
    if (!isAuthenticated) return;
    setIsSubmitting(true);
    try {
      await completeOnboarding({ userType: 'organization' });
      navigate('/');
    } catch (error) {
      console.error('Failed to complete onboarding:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const roles = [
    { value: 'owner', label: t('onboarding.claim.roles.owner', 'Owner') },
    { value: 'manager', label: t('onboarding.claim.roles.manager', 'Manager') },
    { value: 'staff', label: t('onboarding.claim.roles.staff', 'Staff Member') },
    { value: 'representative', label: t('onboarding.claim.roles.representative', 'Official Representative') },
  ];

  // Loading state - wait for both Clerk and Convex
  if (!isLoaded || isConvexLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="relative px-4 pt-6 pb-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/onboarding')}
          className="absolute left-2 top-6 h-9 w-9"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        
        <div className="text-center pt-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 mb-3">
            <Building2 className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-lg font-bold text-foreground mb-1">
            {t('onboarding.claim.title')}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t('onboarding.claim.subtitle')}
          </p>
        </div>
      </div>

      {/* Search Section */}
      <div className="px-4 py-3 max-w-md mx-auto w-full">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder={t('onboarding.claim.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-10 rounded-xl bg-card border-border/50"
          />
          {isSearching && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground animate-spin" />
          )}
        </div>
      </div>

      {/* Search Results */}
      <div className="flex-1 px-4 pb-4 max-w-md mx-auto w-full overflow-y-auto">
        {searchQuery.length < 2 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            <Search className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p>{t('onboarding.claim.searchHint', 'Enter at least 2 characters to search')}</p>
          </div>
        ) : searchResults && searchResults.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-muted-foreground text-sm mb-4">
              {t('onboarding.claim.noResults', 'No clinics found matching your search')}
            </div>
            <Button
              variant="outline"
              onClick={() => navigate('/create-clinic')}
              className="gap-2 h-9 text-sm"
            >
              <Plus className="w-4 h-4" />
              {t('onboarding.claim.registerNew')}
            </Button>
          </div>
        ) : searchResults ? (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground mb-2">
              {t('onboarding.claim.resultsCount', '{{count}} results found', { count: searchResults.length })}
            </p>
            {searchResults.map((clinic) => (
              <div
                key={clinic._id}
                className="bg-card border border-border/50 rounded-xl p-3"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-medium text-sm truncate">{clinic.name}</span>
                      {clinic.isClaimed && (
                        <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 text-xs px-1.5 py-0">
                          <BadgeCheck className="w-3 h-3 mr-0.5" />
                          {t('onboarding.claim.claimed', 'Claimed')}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="w-3 h-3" />
                      <span className="truncate">{clinic.city}, {clinic.address}</span>
                    </div>
                  </div>
                  {!clinic.isClaimed && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleClaimClick(clinic)}
                      className="shrink-0 h-8 text-xs gap-1"
                    >
                      {t('onboarding.claim.claimButton', 'Claim')}
                      <ChevronRight className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
            
            {/* Register new option */}
            <div className="pt-4">
              <div className="relative flex items-center justify-center py-3">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border/40" />
                </div>
                <span className="relative bg-background px-3 text-xs text-muted-foreground">
                  {t('onboarding.claim.or', 'or')}
                </span>
              </div>
              <Button
                variant="outline"
                onClick={() => navigate('/create-clinic')}
                className="w-full gap-2 h-10 text-sm"
              >
                <Plus className="w-4 h-4" />
                {t('onboarding.claim.registerNew')}
              </Button>
            </div>
          </div>
        ) : null}
      </div>

      {/* Skip Button */}
      <div className="sticky bottom-0 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] bg-background/95 backdrop-blur-sm border-t border-border/40">
        <div className="max-w-md mx-auto flex justify-between items-center">
          <Button
            variant="ghost"
            onClick={() => navigate('/onboarding')}
            className="gap-1 h-9 text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('actions.back', 'Back')}
          </Button>
          <Button
            variant="ghost"
            onClick={handleSkip}
            disabled={isSubmitting}
            className="gap-1 h-9 text-sm"
          >
            {t('onboarding.claim.skipButton')}
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
        
        {/* Progress indicator */}
        <div className="flex justify-center gap-1.5 mt-3">
          <div className="w-6 h-1 rounded-full bg-primary" />
          <div className="w-6 h-1 rounded-full bg-primary" />
        </div>
      </div>

      {/* Claim Dialog */}
      <Dialog open={showClaimDialog} onOpenChange={setShowClaimDialog}>
        <DialogContent className="sm:max-w-md mx-4 rounded-xl">
          {claimSuccess ? (
            <div className="text-center py-6">
              <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <Check className="w-7 h-7 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                {t('onboarding.claim.successTitle', 'Claim Submitted!')}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {t('onboarding.claim.successMessage', 'We\'ll review your claim and get back to you soon.')}
              </p>
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>{t('onboarding.claim.redirecting', 'Redirecting...')}</span>
              </div>
            </div>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-base">
                  <Building2 className="w-4 h-4 text-primary" />
                  {t('onboarding.claim.claimTitle', 'Claim')} {formData.clinicName}
                </DialogTitle>
                <DialogDescription className="text-sm">
                  {t('onboarding.claim.claimDescription', 'Please provide your details to verify ownership.')}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-3 py-3">
                <div className="space-y-1.5">
                  <Label htmlFor="role" className="flex items-center gap-1.5 text-sm">
                    <User className="w-3.5 h-3.5" />
                    {t('onboarding.claim.yourRole', 'Your Role')} *
                  </Label>
                  <Select
                    value={formData.claimerRole}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, claimerRole: value }))}
                  >
                    <SelectTrigger className="h-10 rounded-lg text-sm">
                      <SelectValue placeholder={t('onboarding.claim.selectRole', 'Select your role')} />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((role) => (
                        <SelectItem key={role.value} value={role.value}>
                          {role.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="email" className="flex items-center gap-1.5 text-sm">
                    <Mail className="w-3.5 h-3.5" />
                    {t('onboarding.claim.contactEmail', 'Contact Email')} *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.claimerEmail}
                    onChange={(e) => setFormData(prev => ({ ...prev, claimerEmail: e.target.value }))}
                    placeholder="you@organization.com"
                    className="h-10 rounded-lg text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="phone" className="flex items-center gap-1.5 text-sm">
                    <Phone className="w-3.5 h-3.5" />
                    {t('onboarding.claim.phone', 'Phone')} ({t('common.optional', 'Optional')})
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.claimerPhone}
                    onChange={(e) => setFormData(prev => ({ ...prev, claimerPhone: e.target.value }))}
                    placeholder="+359 ..."
                    className="h-10 rounded-lg text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="info" className="text-sm">
                    {t('onboarding.claim.additionalInfo', 'Additional Information')} ({t('common.optional', 'Optional')})
                  </Label>
                  <Textarea
                    id="info"
                    value={formData.additionalInfo}
                    onChange={(e) => setFormData(prev => ({ ...prev, additionalInfo: e.target.value }))}
                    placeholder={t('onboarding.claim.additionalInfoPlaceholder', 'Any additional details that can help verify your claim...')}
                    className="rounded-lg resize-none text-sm"
                    rows={2}
                  />
                </div>
              </div>

              <div className="flex gap-2.5 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setShowClaimDialog(false)}
                  className="flex-1 h-10 rounded-lg text-sm"
                >
                  {t('actions.cancel', 'Cancel')}
                </Button>
                <Button
                  onClick={handleSubmitClaim}
                  disabled={!formData.claimerRole || !formData.claimerEmail || isSubmitting}
                  className="flex-1 h-10 rounded-lg gap-2 text-sm"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {t('actions.submitting', 'Submitting...')}
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      {t('onboarding.claim.submitClaim', 'Submit Claim')}
                    </>
                  )}
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
