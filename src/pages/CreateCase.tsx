import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, ArrowRight, Camera, MapPin, Building2, AlertTriangle, Heart, DollarSign, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

const CreateCase = () => {
    const { t } = useTranslation();

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

    const updateForm = (field: string, value: string | File[]) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const nextStep = () => {
        if (currentStep < steps.length) {
            setCurrentStep(currentStep + 1);
        }
    };

    const prevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleSubmit = async () => {
        // TODO: Implement Convex mutation with image upload
        console.log('Submitting:', formData);
        navigate('/');
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
                                    placeholder={t('createCase.cityPlaceholder')}
                                    value={formData.city}
                                    onChange={(e) => updateForm('city', e.target.value)}
                                />
                            </div>
                            <div>
                                <Label htmlFor="neighborhood">{t('createCase.neighborhood')}</Label>
                                <Input
                                    id="neighborhood"
                                    placeholder={t('createCase.neighborhoodPlaceholder')}
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
                                    className="w-full min-h-[80px] px-3 py-2 rounded-lg border border-input bg-background text-sm"
                                    placeholder={t('createCase.shortDescriptionPlaceholder')}
                                    value={formData.description}
                                    onChange={(e) => updateForm('description', e.target.value)}
                                />
                            </div>
                            <div>
                                <Label htmlFor="story">{t('createCase.fullStory')}</Label>
                                <textarea
                                    id="story"
                                    className="w-full min-h-[120px] px-3 py-2 rounded-lg border border-input bg-background text-sm"
                                    placeholder={t('createCase.fullStoryPlaceholder')}
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
                                    {t('createCase.photoInstructions')}
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
                                        className="px-3 py-2 rounded-lg border border-input bg-background text-sm"
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
                        <Button variant="outline" onClick={prevStep} className="flex-1">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            {t('createCase.back')}
                        </Button>
                    )}
                    {currentStep < steps.length ? (
                        <Button onClick={nextStep} className="flex-1 btn-donate">
                            {t('createCase.next')}
                            <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    ) : (
                        <Button onClick={handleSubmit} className="flex-1 btn-donate">
                            <Heart className="w-4 h-4 mr-2" />
                            {t('createCase.submitReport')}
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CreateCase;
