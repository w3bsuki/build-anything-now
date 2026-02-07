import { useState, useEffect } from 'react';
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
  Loader2,
  Stethoscope,
  Scissors,
  GraduationCap,
  Store,
  Home,
  Hotel,
  Pill,
  Package,
  Globe,
  FileText,
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

// ============================================
// TYPES
// ============================================

type BusinessType = 'clinic' | 'grooming' | 'training' | 'pet_store' | 'shelter' | 'pet_sitting' | 'pet_hotel' | 'pharmacy' | 'other';
type FlowStep = 'select-type' | 'search-claim' | 'register-new';

interface ClaimFormData {
  serviceId: Id<"petServices"> | Id<"clinics"> | null;
  serviceName: string;
  claimerRole: string;
  claimerEmail: string;
  claimerPhone: string;
  additionalInfo: string;
}

interface RegisterFormData {
  name: string;
  city: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  description: string;
  services: string[];
}

// ============================================
// CONSTANTS
// ============================================

const BUSINESS_TYPES = [
  { value: 'clinic', label: 'Veterinary Clinic', icon: Stethoscope, emoji: '🩺', color: 'text-success' },
  { value: 'grooming', label: 'Pet Grooming', icon: Scissors, emoji: '✂️', color: 'text-accent' },
  { value: 'training', label: 'Dog Training', icon: GraduationCap, emoji: '🎓', color: 'text-primary' },
  { value: 'pet_store', label: 'Pet Store', icon: Store, emoji: '🛒', color: 'text-warning' },
  { value: 'shelter', label: 'Animal Shelter', icon: Home, emoji: '🏠', color: 'text-destructive' },
  { value: 'pet_sitting', label: 'Pet Sitting / Boarding', icon: Hotel, emoji: '🏨', color: 'text-primary' },
  { value: 'pharmacy', label: 'Pet Pharmacy', icon: Pill, emoji: '💊', color: 'text-destructive' },
  { value: 'other', label: 'Other Services', icon: Package, emoji: '📦', color: 'text-muted-foreground' },
] as const;

const ROLES = [
  { value: 'owner', label: 'Owner' },
  { value: 'manager', label: 'Manager' },
  { value: 'staff', label: 'Staff Member' },
  { value: 'representative', label: 'Official Representative' },
];

// ============================================
// MAIN COMPONENT
// ============================================

export default function ClaimOrganizationPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isSignedIn, isLoaded } = useAuth();
  const { isLoading: isConvexLoading } = useConvexAuth();

  const completeOnboarding = useMutation(api.users.completeOnboarding);
  const submitClinicClaim = useMutation(api.clinics.submitClaim);
  const submitPetServiceClaim = useMutation(api.petServices.submitClaim);
  const registerPetService = useMutation(api.petServices.register);

  // Flow state
  const [step, setStep] = useState<FlowStep>('select-type');
  const [selectedType, setSelectedType] = useState<BusinessType | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showClaimDialog, setShowClaimDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [claimSuccess, setClaimSuccess] = useState(false);
  const [registerSuccess, setRegisterSuccess] = useState(false);

  // Claim form data
  const [claimFormData, setClaimFormData] = useState<ClaimFormData>({
    serviceId: null,
    serviceName: '',
    claimerRole: '',
    claimerEmail: '',
    claimerPhone: '',
    additionalInfo: '',
  });

  // Register form data
  const [registerFormData, setRegisterFormData] = useState<RegisterFormData>({
    name: '',
    city: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    description: '',
    services: [],
  });

  // Search results - use clinics for clinic type, petServices for others
  const clinicSearchResults = useQuery(
    api.clinics.searchForClaim,
    selectedType === 'clinic' && searchQuery.length >= 2 ? { searchText: searchQuery } : "skip"
  );

  const petServiceSearchResults = useQuery(
    api.petServices.searchForClaim,
    selectedType && selectedType !== 'clinic' && searchQuery.length >= 2
      ? { searchText: searchQuery, type: selectedType }
      : "skip"
  );

  const searchResults = selectedType === 'clinic' ? clinicSearchResults : petServiceSearchResults;
  const isSearching = searchQuery.length >= 2 && searchResults === undefined;

  // Redirect to sign-in if not authenticated
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      navigate('/sign-in', { replace: true });
    }
  }, [isLoaded, isSignedIn, navigate]);

  // Loading state
  if (!isLoaded || isConvexLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  // ============================================
  // HANDLERS
  // ============================================

  const handleTypeSelect = (type: BusinessType) => {
    setSelectedType(type);
    setStep('search-claim');
    setSearchQuery('');
  };

  const handleClaimClick = (item: { _id: Id<"petServices"> | Id<"clinics">; name: string }) => {
    setClaimFormData(prev => ({
      ...prev,
      serviceId: item._id,
      serviceName: item.name,
    }));
    setShowClaimDialog(true);
  };

  const handleSubmitClaim = async () => {
    if (!claimFormData.serviceId || !claimFormData.claimerRole || !claimFormData.claimerEmail) return;

    setIsSubmitting(true);

    try {
      if (selectedType === 'clinic') {
        await submitClinicClaim({
          clinicId: claimFormData.serviceId as Id<"clinics">,
          claimerRole: claimFormData.claimerRole,
          claimerEmail: claimFormData.claimerEmail,
          claimerPhone: claimFormData.claimerPhone || undefined,
          additionalInfo: claimFormData.additionalInfo || undefined,
        });
      } else {
        await submitPetServiceClaim({
          petServiceId: claimFormData.serviceId as Id<"petServices">,
          claimerRole: claimFormData.claimerRole,
          claimerEmail: claimFormData.claimerEmail,
          claimerPhone: claimFormData.claimerPhone || undefined,
          additionalInfo: claimFormData.additionalInfo || undefined,
        });
      }

      await completeOnboarding({ enhancedUserType: 'business' });
      setClaimSuccess(true);

      setTimeout(() => navigate('/'), 2000);
    } catch (error) {
      console.error('Failed to submit claim:', error);
      setIsSubmitting(false);
    }
  };

  const handleRegisterNew = async () => {
    if (!selectedType || !registerFormData.name || !registerFormData.city || !registerFormData.phone) return;

    setIsSubmitting(true);

    try {
      await registerPetService({
        name: registerFormData.name,
        type: selectedType,
        city: registerFormData.city,
        address: registerFormData.address,
        phone: registerFormData.phone,
        email: registerFormData.email || undefined,
        website: registerFormData.website || undefined,
        description: registerFormData.description || undefined,
        services: registerFormData.services.length > 0 ? registerFormData.services : [selectedType],
      });

      await completeOnboarding({ enhancedUserType: 'business' });
      setRegisterSuccess(true);

      setTimeout(() => navigate('/'), 2000);
    } catch (error) {
      console.error('Failed to register business:', error);
      setIsSubmitting(false);
    }
  };

  const handleSkip = async () => {
    setIsSubmitting(true);
    try {
      await completeOnboarding({ enhancedUserType: 'business' });
      navigate('/');
    } catch (error) {
      console.error('Failed to complete onboarding:', error);
      setIsSubmitting(false);
    }
  };

  const getTypeInfo = (type: BusinessType) => {
    return BUSINESS_TYPES.find(t => t.value === type);
  };

  // ============================================
  // RENDER: Step 1 - Select Business Type
  // ============================================

  if (step === 'select-type') {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        {/* Header */}
        <div className="relative px-4 pt-6 pb-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/onboarding')}
            className="absolute left-2 top-6 h-10 w-10"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>

          <div className="text-center pt-10">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-primary/10 mb-3">
              <Building2 className="w-7 h-7 text-primary" />
            </div>
            <h1 className="text-xl font-bold text-foreground mb-1">
              {t('onboarding.business.typeTitle', 'What type of business?')}
            </h1>
            <p className="text-sm text-muted-foreground">
              {t('onboarding.business.typeSubtitle', 'Select your business category')}
            </p>
          </div>
        </div>

        {/* Business type grid */}
        <div className="flex-1 px-4 py-4 max-w-lg mx-auto w-full">
          <div className="grid grid-cols-2 gap-3">
            {BUSINESS_TYPES.map((type) => {
              const Icon = type.icon;
              return (
                <button
                  key={type.value}
                  onClick={() => handleTypeSelect(type.value)}
                  className={cn(
                    "flex flex-col items-center p-4 rounded-xl border transition-all",
                    "bg-card hover:border-primary/50 hover:bg-muted/30 active:opacity-90",
                    "border-border/50"
                  )}
                >
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center mb-2",
                    "bg-muted"
                  )}>
                    <Icon className={cn("w-6 h-6", type.color)} />
                  </div>
                  <span className="text-sm font-medium text-foreground text-center">
                    {type.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Skip button */}
        <div className="sticky bottom-0 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] bg-background/95 backdrop-blur-sm border-t border-border/40">
          <div className="max-w-lg mx-auto flex justify-between items-center">
            <Button
              variant="ghost"
              onClick={() => navigate('/onboarding')}
              className="gap-1"
            >
              <ArrowLeft className="w-4 h-4" />
              {t('actions.back', 'Back')}
            </Button>
            <Button
              variant="ghost"
              onClick={handleSkip}
              disabled={isSubmitting}
            >
              {t('onboarding.claim.skipButton', 'Skip for now')}
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ============================================
  // RENDER: Step 2 - Search & Claim
  // ============================================

  if (step === 'search-claim') {
    const typeInfo = getTypeInfo(selectedType!);

    return (
      <div className="min-h-screen bg-background flex flex-col">
        {/* Header */}
        <div className="relative px-4 pt-6 pb-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setStep('select-type')}
            className="absolute left-2 top-6 h-10 w-10"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>

          <div className="text-center pt-10">
            <div className={cn(
              "inline-flex items-center justify-center w-12 h-12 rounded-xl mb-3",
              "bg-muted"
            )}>
              {typeInfo && <typeInfo.icon className={cn("w-6 h-6", typeInfo.color)} />}
            </div>
            <h1 className="text-lg font-bold text-foreground mb-1">
              {t('onboarding.claim.title', 'Find Your Business')}
            </h1>
            <p className="text-sm text-muted-foreground">
              {t('onboarding.claim.subtitle', 'Search to claim an existing listing or register new')}
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="px-4 py-3 max-w-lg mx-auto w-full">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder={t('onboarding.claim.searchPlaceholder', 'Search by name or city...')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-11 rounded-xl bg-card border-border/50"
            />
            {isSearching && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground animate-spin" />
            )}
          </div>
        </div>

        {/* Results */}
        <div className="flex-1 px-4 pb-4 max-w-lg mx-auto w-full overflow-y-auto">
          {searchQuery.length < 2 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              <Search className="w-10 h-10 mx-auto mb-3 opacity-20" />
              <p>{t('onboarding.claim.searchHint', 'Enter at least 2 characters to search')}</p>
            </div>
          ) : searchResults && searchResults.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-muted-foreground text-sm mb-4">
                {t('onboarding.claim.noResults', 'No businesses found matching your search')}
              </div>
              <Button
                variant="outline"
                onClick={() => setStep('register-new')}
                className="gap-2"
              >
                <Plus className="w-4 h-4" />
                {t('onboarding.claim.registerNew', 'Register New Business')}
              </Button>
            </div>
          ) : searchResults ? (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground mb-3">
                {t('onboarding.claim.resultsCount', '{{count}} results found', { count: searchResults.length })}
              </p>
              {searchResults.map((item) => (
                <div
                  key={item._id}
                  className="bg-card border border-border/50 rounded-xl p-3.5"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm truncate">{item.name}</span>
                        {item.isClaimed && (
                          <Badge variant="secondary" className="bg-success/15 text-success border border-success/30 text-xs px-1.5 py-0">
                            <BadgeCheck className="w-3 h-3 mr-0.5" />
                            {t('onboarding.claim.claimed', 'Claimed')}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="w-3 h-3" />
                        <span className="truncate">{item.city}, {item.address}</span>
                      </div>
                    </div>
                    {!item.isClaimed && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleClaimClick(item)}
                        className="shrink-0 h-9 text-sm gap-1"
                      >
                        {t('onboarding.claim.claimButton', 'Claim')}
                        <ChevronRight className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}

              {/* Register new */}
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
                  onClick={() => setStep('register-new')}
                  className="w-full gap-2"
                >
                  <Plus className="w-4 h-4" />
                  {t('onboarding.claim.registerNew', 'Register New Business')}
                </Button>
              </div>
            </div>
          ) : null}
        </div>

        {/* Bottom actions */}
        <div className="sticky bottom-0 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] bg-background/95 backdrop-blur-sm border-t border-border/40">
          <div className="max-w-lg mx-auto flex justify-between items-center">
            <Button
              variant="ghost"
              onClick={() => setStep('select-type')}
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              {t('actions.back', 'Back')}
            </Button>
            <Button
              variant="ghost"
              onClick={handleSkip}
              disabled={isSubmitting}
            >
              {t('onboarding.claim.skipButton', 'Skip for now')}
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>

        {/* Claim Dialog */}
        <Dialog open={showClaimDialog} onOpenChange={setShowClaimDialog}>
          <DialogContent className="sm:max-w-md mx-4 rounded-xl">
            {claimSuccess ? (
              <div className="text-center py-6">
                <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-success/15 flex items-center justify-center">
                  <Check className="w-7 h-7 text-success" />
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
                    {t('onboarding.claim.claimTitle', 'Claim')} {claimFormData.serviceName}
                  </DialogTitle>
                  <DialogDescription className="text-sm">
                    {t('onboarding.claim.claimDescription', 'Please provide your details to verify ownership.')}
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-3 py-3">
                  <div className="space-y-1.5">
                    <Label className="flex items-center gap-1.5 text-sm">
                      <User className="w-3.5 h-3.5" />
                      {t('onboarding.claim.yourRole', 'Your Role')} *
                    </Label>
                    <Select
                      value={claimFormData.claimerRole}
                      onValueChange={(value) => setClaimFormData(prev => ({ ...prev, claimerRole: value }))}
                    >
                      <SelectTrigger className="h-10 rounded-lg">
                        <SelectValue placeholder={t('onboarding.claim.selectRole', 'Select your role')} />
                      </SelectTrigger>
                      <SelectContent>
                        {ROLES.map((role) => (
                          <SelectItem key={role.value} value={role.value}>
                            {role.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="flex items-center gap-1.5 text-sm">
                      <Mail className="w-3.5 h-3.5" />
                      {t('onboarding.claim.contactEmail', 'Contact Email')} *
                    </Label>
                    <Input
                      type="email"
                      value={claimFormData.claimerEmail}
                      onChange={(e) => setClaimFormData(prev => ({ ...prev, claimerEmail: e.target.value }))}
                      placeholder="you@business.com"
                      className="h-10 rounded-lg"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="flex items-center gap-1.5 text-sm">
                      <Phone className="w-3.5 h-3.5" />
                      {t('onboarding.claim.phone', 'Phone')} ({t('common.optional', 'Optional')})
                    </Label>
                    <Input
                      type="tel"
                      value={claimFormData.claimerPhone}
                      onChange={(e) => setClaimFormData(prev => ({ ...prev, claimerPhone: e.target.value }))}
                      placeholder="+359 ..."
                      className="h-10 rounded-lg"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-sm">
                      {t('onboarding.claim.additionalInfo', 'Additional Information')} ({t('common.optional', 'Optional')})
                    </Label>
                    <Textarea
                      value={claimFormData.additionalInfo}
                      onChange={(e) => setClaimFormData(prev => ({ ...prev, additionalInfo: e.target.value }))}
                      placeholder={t('onboarding.claim.additionalInfoPlaceholder', 'Any additional details...')}
                      className="rounded-lg resize-none"
                      rows={2}
                    />
                  </div>
                </div>

                <div className="flex gap-2.5 pt-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowClaimDialog(false)}
                    className="flex-1 h-10 rounded-lg"
                  >
                    {t('actions.cancel', 'Cancel')}
                  </Button>
                  <Button
                    onClick={handleSubmitClaim}
                    disabled={!claimFormData.claimerRole || !claimFormData.claimerEmail || isSubmitting}
                    className="flex-1 h-10 rounded-lg gap-2"
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

  // ============================================
  // RENDER: Step 3 - Register New Business
  // ============================================

  if (step === 'register-new') {
    const typeInfo = getTypeInfo(selectedType!);

    return (
      <div className="min-h-screen bg-background flex flex-col">
        {/* Header */}
        <div className="relative px-4 pt-6 pb-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setStep('search-claim')}
            className="absolute left-2 top-6 h-10 w-10"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>

          <div className="text-center pt-10">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-muted mb-3">
              {typeInfo && <typeInfo.icon className={cn("w-6 h-6", typeInfo.color)} />}
            </div>
            <h1 className="text-lg font-bold text-foreground mb-1">
              {t('onboarding.register.title', 'Register Your Business')}
            </h1>
            <p className="text-sm text-muted-foreground">
              {typeInfo?.label}
            </p>
          </div>
        </div>

        {/* Success state */}
        {registerSuccess ? (
          <div className="flex-1 flex items-center justify-center px-4">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-success/15 flex items-center justify-center">
                <Check className="w-8 h-8 text-success" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                {t('onboarding.register.successTitle', 'Business Registered!')}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {t('onboarding.register.successMessage', 'Your business is now listed. We\'ll verify it soon.')}
              </p>
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>{t('onboarding.claim.redirecting', 'Redirecting...')}</span>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Form */}
            <div className="flex-1 px-4 py-4 max-w-lg mx-auto w-full overflow-y-auto">
              <div className="space-y-4">
                {/* Business Name */}
                <div className="space-y-1.5">
                  <Label className="flex items-center gap-1.5 text-sm">
                    <Building2 className="w-3.5 h-3.5" />
                    {t('onboarding.register.businessName', 'Business Name')} *
                  </Label>
                  <Input
                    value={registerFormData.name}
                    onChange={(e) => setRegisterFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder={t('onboarding.register.namePlaceholder', 'Your business name')}
                    className="h-11 rounded-xl"
                  />
                </div>

                {/* City */}
                <div className="space-y-1.5">
                  <Label className="flex items-center gap-1.5 text-sm">
                    <MapPin className="w-3.5 h-3.5" />
                    {t('onboarding.register.city', 'City')} *
                  </Label>
                  <Input
                    value={registerFormData.city}
                    onChange={(e) => setRegisterFormData(prev => ({ ...prev, city: e.target.value }))}
                    placeholder={t('onboarding.register.cityPlaceholder', 'e.g., Sofia')}
                    className="h-11 rounded-xl"
                  />
                </div>

                {/* Address */}
                <div className="space-y-1.5">
                  <Label className="flex items-center gap-1.5 text-sm">
                    <MapPin className="w-3.5 h-3.5" />
                    {t('onboarding.register.address', 'Address')} *
                  </Label>
                  <Input
                    value={registerFormData.address}
                    onChange={(e) => setRegisterFormData(prev => ({ ...prev, address: e.target.value }))}
                    placeholder={t('onboarding.register.addressPlaceholder', 'Street address')}
                    className="h-11 rounded-xl"
                  />
                </div>

                {/* Phone */}
                <div className="space-y-1.5">
                  <Label className="flex items-center gap-1.5 text-sm">
                    <Phone className="w-3.5 h-3.5" />
                    {t('onboarding.register.phone', 'Phone')} *
                  </Label>
                  <Input
                    type="tel"
                    value={registerFormData.phone}
                    onChange={(e) => setRegisterFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+359 ..."
                    className="h-11 rounded-xl"
                  />
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <Label className="flex items-center gap-1.5 text-sm">
                    <Mail className="w-3.5 h-3.5" />
                    {t('onboarding.register.email', 'Email')} ({t('common.optional', 'Optional')})
                  </Label>
                  <Input
                    type="email"
                    value={registerFormData.email}
                    onChange={(e) => setRegisterFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="contact@business.com"
                    className="h-11 rounded-xl"
                  />
                </div>

                {/* Website */}
                <div className="space-y-1.5">
                  <Label className="flex items-center gap-1.5 text-sm">
                    <Globe className="w-3.5 h-3.5" />
                    {t('onboarding.register.website', 'Website')} ({t('common.optional', 'Optional')})
                  </Label>
                  <Input
                    type="url"
                    value={registerFormData.website}
                    onChange={(e) => setRegisterFormData(prev => ({ ...prev, website: e.target.value }))}
                    placeholder="https://..."
                    className="h-11 rounded-xl"
                  />
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <Label className="flex items-center gap-1.5 text-sm">
                    <FileText className="w-3.5 h-3.5" />
                    {t('onboarding.register.description', 'Description')} ({t('common.optional', 'Optional')})
                  </Label>
                  <Textarea
                    value={registerFormData.description}
                    onChange={(e) => setRegisterFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder={t('onboarding.register.descriptionPlaceholder', 'Tell customers about your services...')}
                    className="rounded-xl resize-none"
                    rows={3}
                  />
                </div>

                {/* Verification note */}
                <div className="p-4 rounded-xl bg-warning/10 border border-warning/30">
                  <p className="text-sm text-warning">
                    ⚡ {t('onboarding.register.verificationNote', 'Your listing will be reviewed and verified within 24-48 hours.')}
                  </p>
                </div>
              </div>
            </div>

            {/* Submit button */}
            <div className="sticky bottom-0 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] bg-background/95 backdrop-blur-sm border-t border-border/40">
              <div className="max-w-lg mx-auto">
                <Button
                  onClick={handleRegisterNew}
                  disabled={!registerFormData.name || !registerFormData.city || !registerFormData.phone || isSubmitting}
                  className="w-full h-12 rounded-xl text-base font-semibold gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      {t('onboarding.register.registering', 'Registering...')}
                    </>
                  ) : (
                    <>
                      <Check className="w-5 h-5" />
                      {t('onboarding.register.submit', 'Register Business')}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  return null;
}
