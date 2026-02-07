import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, ArrowRight, Camera, MapPin, Building2, AlertTriangle, Heart, DollarSign, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { toast } from '@/components/ui/use-toast';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import type { Id } from '../../convex/_generated/dataModel';

const CreateCase = () => {
    const { t, i18n } = useTranslation();
    const createCase = useMutation(api.cases.create);
    const generateUploadUrl = useMutation(api.storage.generateUploadUrl);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const steps = [
        { id: 1, label: t('createCase.type'), icon: AlertTriangle },
        { id: 2, label: t('createCase.location'), icon: MapPin },
        { id: 3, label: t('createCase.details'), icon: Building2 },
        { id: 4, label: t('createCase.images'), icon: Camera },
        { id: 5, label: t('createCase.funding'), icon: DollarSign },
    ];

    const urgencyTypes = [
        { id: 'critical', label: t('createCase.critical'), description: t('createCase.criticalDescription'), color: 'bg-destructive' },
        { id: 'urgent', label: t('createCase.urgent'), description: t('createCase.urgentDescription'), color: 'bg-urgent' },
        { id: 'recovering', label: t('createCase.recovering'), description: t('createCase.recoveringDescription'), color: 'bg-recovering' },
    ];

    const categories = [
        { id: 'surgery', label: t('createCase.surgery') },
        { id: 'medical', label: t('createCase.medicalTreatment') },
        { id: 'rescue', label: t('createCase.rescueOperation') },
        { id: 'shelter', label: t('createCase.shelterHousing') },
        { id: 'food', label: t('createCase.foodSupplies') },
    ];
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [hasSeenPhotoTip, setHasSeenPhotoTip] = useState(false);
    const [createdCaseId, setCreatedCaseId] = useState<Id<"cases"> | null>(null);
    const [formData, setFormData] = useState({
        type: '',
        category: '',
        title: '',
        description: '',
        story: '',
        city: '',
        neighborhood: '',
        clinicId: '',
        foundAt: '',
        broughtToClinicAt: '',
        images: [] as File[],
        fundraisingGoal: '',
        currency: 'EUR',
    });

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [currentStep, isSubmitted]);

    const updateForm = (field: string, value: string | File[]) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const validateStep = (step: number) => {
        switch (step) {
            case 1:
                if (!formData.type) return t('createCase.validation.urgency', 'Select an urgency level to continue.');
                if (!formData.category) return t('createCase.validation.category', 'Select what help is needed to continue.');
                return null;
            case 2:
                if (!formData.city.trim()) return t('createCase.validation.city', 'Add a city to continue.');
                if (!formData.neighborhood.trim()) return t('createCase.validation.neighborhood', 'Add an area/neighborhood to continue.');
                return null;
            case 3:
                if (!formData.title.trim()) return t('createCase.validation.title', 'Add a title to continue.');
                if (!formData.description.trim()) return t('createCase.validation.description', 'Add a short description to continue.');
                return null;
            case 4:
                return null;
            case 5:
                if (!formData.fundraisingGoal.trim() || Number(formData.fundraisingGoal) <= 0) {
                    return t('createCase.validation.goal', 'Set a fundraising goal to continue.');
                }
                return null;
            default:
                return null;
        }
    };

    const nextStep = () => {
        if (currentStep === 4 && formData.images.length === 0 && !hasSeenPhotoTip) {
            setHasSeenPhotoTip(true);
            toast({
                title: t('createCase.photosTipTitle', 'Photos recommended'),
                description: t(
                    'createCase.photosTipBody',
                    'Photos help verification and build donor trust. You can continue now and add photos later.'
                ),
            });
        }
        const error = validateStep(currentStep);
        if (error) {
            toast({
                title: t('common.missingInfo', 'Missing info'),
                description: error,
                variant: 'destructive',
            });
            return;
        }
        if (currentStep < steps.length) {
            setCurrentStep(currentStep + 1);
        }
    };

    const prevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const uploadImages = async (files: File[]): Promise<Id<"_storage">[]> => {
        const uploadedIds: Id<"_storage">[] = [];
        for (const file of files) {
            const uploadUrl = await generateUploadUrl();
            const response = await fetch(uploadUrl, {
                method: 'POST',
                headers: { 'Content-Type': file.type },
                body: file,
            });
            if (!response.ok) {
                throw new Error(`Failed to upload image: ${response.statusText}`);
            }
            const { storageId } = await response.json();
            uploadedIds.push(storageId as Id<"_storage">);
        }
        return uploadedIds;
    };

    const handleSubmit = async () => {
        const error = validateStep(steps.length);
        if (error) {
            toast({
                title: t('common.missingInfo', 'Missing info'),
                description: error,
                variant: 'destructive',
            });
            return;
        }

        setIsSubmitting(true);

        try {
            // Upload images first
            let imageIds: Id<"_storage">[] = [];
            if (formData.images.length > 0) {
                imageIds = await uploadImages(formData.images);
            }

            // Parse foundAt to timestamp (or use now)
            const foundAtTimestamp = formData.foundAt
                ? new Date(formData.foundAt).getTime()
                : Date.now();

            // Parse broughtToClinicAt if provided
            const broughtToClinicAtTimestamp = formData.broughtToClinicAt
                ? new Date(formData.broughtToClinicAt).getTime()
                : undefined;

            // Create the case
            const caseId = await createCase({
                type: formData.type as "critical" | "urgent" | "recovering" | "adopted",
                category: formData.category as "surgery" | "shelter" | "food" | "medical" | "rescue",
                language: i18n.language,
                title: formData.title,
                description: formData.description,
                story: formData.story || undefined,
                images: imageIds,
                location: {
                    city: formData.city,
                    neighborhood: formData.neighborhood,
                },
                foundAt: foundAtTimestamp,
                broughtToClinicAt: broughtToClinicAtTimestamp,
                fundraisingGoal: Number(formData.fundraisingGoal),
                currency: formData.currency,
            });

            setCreatedCaseId(caseId);
            setIsSubmitted(true);

            toast({
                title: t('createCase.successTitle', 'Case created!'),
                description: t('createCase.successBody', 'Your case has been published and is now live.'),
            });
        } catch (err) {
            console.error('Failed to create case:', err);
            toast({
                title: t('createCase.errorTitle', 'Something went wrong'),
                description: t('createCase.errorBody', 'Failed to create case. Please try again.'),
                variant: 'destructive',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-background pb-24 md:pb-8 md:pt-16">
            {/* Header */}
            <div className="sticky top-0 z-40 bg-card/95 backdrop-blur-md border-b border-border">
                <div className="flex items-center gap-3 h-14 px-3 container mx-auto">
                    <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center active:bg-muted/80 transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h1 className="font-semibold text-foreground">{t('createCase.reportAnimal')}</h1>
                </div>
            </div>

            {/* Progress Steps */}
            {isSubmitted ? (
                <div className="container mx-auto px-4 py-6">
                    <div className="max-w-lg mx-auto space-y-4">
                        <div className="rounded-2xl border border-border bg-card p-4">
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                                    <Check className="w-5 h-5 text-primary" />
                                </div>
                                <div className="min-w-0">
                                    <p className="font-semibold text-foreground">
                                        {t('createCase.readyTitle', 'Your case is ready')}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {t(
                                            'createCase.publishedBody',
                                            'Your case is now live and visible to donors. Share it to get more support!'
                                        )}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-border bg-card p-4">
                            <p className="font-semibold text-foreground mb-2">{t('createCase.summary', 'Summary')}</p>
                            <div className="text-sm text-muted-foreground space-y-1">
                                <p><strong>{t('createCase.type', 'Type')}:</strong> {formData.type || t('createCase.notSelected', 'Not selected')}</p>
                                <p><strong>{t('createCase.category', 'Category')}:</strong> {formData.category || t('createCase.notSelected', 'Not selected')}</p>
                                <p><strong>{t('createCase.location', 'Location')}:</strong> {formData.city}, {formData.neighborhood}</p>
                                <p><strong>{t('createCase.title', 'Title')}:</strong> {formData.title || t('createCase.notSet', 'Not set')}</p>
                                <p><strong>{t('createCase.goal', 'Goal')}:</strong> {formData.fundraisingGoal || '0'} {formData.currency}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            {createdCaseId ? (
                                <>
                                    <Button variant="outline" className="h-11 rounded-xl" onClick={() => navigate('/')}>
                                        {t('createCase.backToFeed', 'Back to feed')}
                                    </Button>
                                    <Button className="h-11 rounded-xl font-semibold" onClick={() => navigate(`/case/${createdCaseId}`)}>
                                        {t('createCase.viewCase', 'View case')}
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <Button variant="outline" className="h-11 rounded-xl" onClick={() => setIsSubmitted(false)}>
                                        {t('createCase.editDraft', 'Edit draft')}
                                    </Button>
                                    <Button className="h-11 rounded-xl font-semibold" onClick={() => navigate('/')}>
                                        {t('createCase.backToFeed', 'Back to feed')}
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            ) : (
            <div className="container mx-auto px-4 py-4">
                <div className="flex items-center justify-between mb-6">
                    {steps.map((step, index) => {
                        const Icon = step.icon;
                        const isActive = currentStep === step.id;
                        const isCompleted = currentStep > step.id;

                        return (
                            <div key={step.id} className="flex items-center">
                                <div className={cn(
                                    "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
                                    isCompleted ? "bg-primary text-primary-foreground" :
                                        isActive ? "bg-primary text-primary-foreground" :
                                            "bg-muted text-muted-foreground"
                                )}>
                                    {isCompleted ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                                </div>
                                {index < steps.length - 1 && (
                                    <div className={cn(
                                        "w-8 h-0.5 mx-1",
                                        isCompleted ? "bg-primary" : "bg-muted"
                                    )} />
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Step Content */}
                <div className="bg-card rounded-xl border border-border p-5">
                    {/* Step 1: Type & Category */}
                    {currentStep === 1 && (
                        <div className="space-y-6">
                            <div>
                                <Label className="text-base font-semibold mb-3 block">{t('createCase.urgencyLevel')}</Label>
                                <div className="space-y-2">
                                    {urgencyTypes.map((type) => (
                                        <button
                                            key={type.id}
                                            onClick={() => updateForm('type', type.id)}
                                            className={cn(
                                                "w-full flex items-center gap-3 p-3 rounded-lg border transition-colors text-left",
                                                formData.type === type.id
                                                    ? "border-primary bg-primary/5"
                                                    : "border-border hover:bg-muted"
                                            )}
                                        >
                                            <div className={cn("w-3 h-3 rounded-full", type.color)} />
                                            <div>
                                                <div className="font-medium text-sm">{type.label}</div>
                                                <div className="text-xs text-muted-foreground">{type.description}</div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <Label className="text-base font-semibold mb-3 block">{t('createCase.whatDoTheyNeed')}</Label>
                                <div className="flex flex-wrap gap-2">
                                    {categories.map((cat) => (
                                        <button
                                            key={cat.id}
                                            onClick={() => updateForm('category', cat.id)}
                                            className={cn(
                                                "px-4 py-2 rounded-full text-sm font-medium transition-colors",
                                                formData.category === cat.id
                                                    ? "bg-primary text-primary-foreground"
                                                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                                            )}
                                        >
                                            {cat.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Location */}
                    {currentStep === 2 && (
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="city">{t('createCase.city')}</Label>
                                <Input
                                    id="city"
                                    placeholder={t('createCase.cityPlaceholder', 'e.g., Sofia')}
                                    value={formData.city}
                                    onChange={(e) => updateForm('city', e.target.value)}
                                />
                            </div>
                            <div>
                                <Label htmlFor="neighborhood">{t('createCase.neighborhood')}</Label>
                                <Input
                                    id="neighborhood"
                                    placeholder={t('createCase.neighborhoodPlaceholder', 'e.g., Lozenets')}
                                    value={formData.neighborhood}
                                    onChange={(e) => updateForm('neighborhood', e.target.value)}
                                />
                            </div>
                            <div>
                                <Label htmlFor="foundAt">{t('createCase.whenFound')}</Label>
                                <Input
                                    id="foundAt"
                                    type="datetime-local"
                                    value={formData.foundAt}
                                    onChange={(e) => updateForm('foundAt', e.target.value)}
                                />
                            </div>
                        </div>
                    )}

                    {/* Step 3: Details */}
                    {currentStep === 3 && (
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="title">{t('createCase.title')}</Label>
                                <Input
                                    id="title"
                                    placeholder={t('createCase.titlePlaceholder')}
                                    value={formData.title}
                                    onChange={(e) => updateForm('title', e.target.value)}
                                />
                            </div>
                            <div>
                                <Label htmlFor="description">{t('createCase.shortDescription')}</Label>
                                <textarea
                                    id="description"
                                    className="w-full min-h-20 px-3 py-2 rounded-lg border border-input bg-background text-base md:text-sm"
                                    placeholder={t('createCase.shortDescPlaceholder', 'Brief description of the situation...')}
                                    value={formData.description}
                                    onChange={(e) => updateForm('description', e.target.value)}
                                />
                            </div>
                            <div>
                                <Label htmlFor="story">{t('createCase.fullStory')}</Label>
                                <textarea
                                    id="story"
                                    className="w-full min-h-32 px-3 py-2 rounded-lg border border-input bg-background text-base md:text-sm"
                                    placeholder={t('createCase.storyPlaceholder', 'Tell the full story of how the animal was found...')}
                                    value={formData.story}
                                    onChange={(e) => updateForm('story', e.target.value)}
                                />
                            </div>
                        </div>
                    )}

                    {/* Step 4: Images */}
                    {currentStep === 4 && (
                        <div className="space-y-4">
                            <Label className="text-base font-semibold block">{t('createCase.addPhotos')}</Label>
                            <div className="border-2 border-dashed border-border rounded-xl p-8 text-center">
                                <Camera className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                                <p className="text-sm text-muted-foreground mb-3">
                                    {t('createCase.tapToPhoto', 'Tap to take a photo or select from gallery')}
                                </p>
                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    className="hidden"
                                    id="image-upload"
                                    onChange={(e) => {
                                        const files = Array.from(e.target.files || []);
                                        updateForm('images', [...formData.images, ...files]);
                                    }}
                                />
                                <label htmlFor="image-upload">
                                    <Button variant="outline" className="cursor-pointer" asChild>
                                        <span>{t('createCase.chooseImages')}</span>
                                    </Button>
                                </label>
                            </div>
                            {formData.images.length > 0 && (
                                <div className="flex gap-2 flex-wrap">
                                    {formData.images.map((file, idx) => (
                                        <div key={idx} className="w-20 h-20 rounded-lg bg-muted overflow-hidden">
                                            <img
                                                src={URL.createObjectURL(file)}
                                                alt=""
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Step 5: Funding */}
                    {currentStep === 5 && (
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="goal">{t('createCase.fundraisingGoal')}</Label>
                                <div className="flex gap-2">
                                    <Input
                                        id="goal"
                                        type="number"
                                        placeholder="500"
                                        value={formData.fundraisingGoal}
                                        onChange={(e) => updateForm('fundraisingGoal', e.target.value)}
                                        className="flex-1"
                                    />
                                    <select
                                        value={formData.currency}
                                        onChange={(e) => updateForm('currency', e.target.value)}
                                        className="px-3 py-2 rounded-lg border border-input bg-background text-base md:text-sm"
                                    >
                                        <option value="EUR">EUR</option>
                                        <option value="BGN">BGN</option>
                                        <option value="USD">USD</option>
                                    </select>
                                </div>
                            </div>

                            <div className="bg-muted/50 rounded-lg p-4 mt-6">
                                <h3 className="font-semibold text-sm mb-2">{t('createCase.summary')}</h3>
                                <div className="text-sm text-muted-foreground space-y-1">
                                    <p><strong>{t('createCase.type')}:</strong> {formData.type || t('createCase.notSelected')}</p>
                                    <p><strong>{t('createCase.category')}:</strong> {formData.category || t('createCase.notSelected')}</p>
                                    <p><strong>{t('createCase.location')}:</strong> {formData.city}, {formData.neighborhood}</p>
                                    <p><strong>{t('createCase.title')}:</strong> {formData.title || t('createCase.notSet')}</p>
                                    <p><strong>{t('createCase.goal')}:</strong> {formData.fundraisingGoal || '0'} {formData.currency}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Navigation Buttons */}
                <div className="flex gap-3 mt-6">
                    {currentStep > 1 && (
                        <Button variant="outline" onClick={prevStep} className="flex-1" disabled={isSubmitting}>
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            {t('createCase.back')}
                        </Button>
                    )}
                    {currentStep < steps.length ? (
                        <Button onClick={nextStep} variant="donate" className="flex-1">
                            {t('createCase.next')}
                            <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    ) : (
                        <Button onClick={handleSubmit} variant="donate" className="flex-1" disabled={isSubmitting}>
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    {t('createCase.publishing', 'Publishing...')}
                                </>
                            ) : (
                                <>
                                    <Heart className="w-4 h-4 mr-2" />
                                    {t('createCase.submitReport')}
                                </>
                            )}
                        </Button>
                    )}
                </div>
            </div>
            )}
        </div>
    );
};

export default CreateCase;
