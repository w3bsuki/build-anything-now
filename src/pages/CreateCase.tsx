import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Camera, MapPin, Building2, AlertTriangle, Heart, DollarSign, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

const steps = [
    { id: 1, label: 'Type', icon: AlertTriangle },
    { id: 2, label: 'Location', icon: MapPin },
    { id: 3, label: 'Details', icon: Building2 },
    { id: 4, label: 'Images', icon: Camera },
    { id: 5, label: 'Funding', icon: DollarSign },
];

const urgencyTypes = [
    { id: 'critical', label: 'Critical', description: 'Life-threatening, needs immediate help', color: 'bg-destructive' },
    { id: 'urgent', label: 'Urgent', description: 'Needs help soon but stable', color: 'bg-urgent' },
    { id: 'recovering', label: 'Recovering', description: 'Getting treatment, needs funding', color: 'bg-recovering' },
];

const categories = [
    { id: 'surgery', label: 'Surgery' },
    { id: 'medical', label: 'Medical Treatment' },
    { id: 'rescue', label: 'Rescue Operation' },
    { id: 'shelter', label: 'Shelter/Housing' },
    { id: 'food', label: 'Food/Supplies' },
];

const CreateCase = () => {
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
        currency: 'BGN',
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
                <div className="flex items-center gap-3 px-4 py-3 container mx-auto">
                    <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center">
                        <ArrowLeft className="w-4 h-4" />
                    </button>
                    <h1 className="font-semibold text-foreground">Report Animal</h1>
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
                                <Label className="text-base font-semibold mb-3 block">Urgency Level</Label>
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
                                <Label className="text-base font-semibold mb-3 block">What do they need?</Label>
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
                                <Label htmlFor="city">City</Label>
                                <Input
                                    id="city"
                                    placeholder="e.g., Sofia"
                                    value={formData.city}
                                    onChange={(e) => updateForm('city', e.target.value)}
                                />
                            </div>
                            <div>
                                <Label htmlFor="neighborhood">Neighborhood / Area</Label>
                                <Input
                                    id="neighborhood"
                                    placeholder="e.g., Lozenets"
                                    value={formData.neighborhood}
                                    onChange={(e) => updateForm('neighborhood', e.target.value)}
                                />
                            </div>
                            <div>
                                <Label htmlFor="foundAt">When was the animal found?</Label>
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
                                <Label htmlFor="title">Title</Label>
                                <Input
                                    id="title"
                                    placeholder="e.g., Injured dog needs surgery"
                                    value={formData.title}
                                    onChange={(e) => updateForm('title', e.target.value)}
                                />
                            </div>
                            <div>
                                <Label htmlFor="description">Short Description</Label>
                                <textarea
                                    id="description"
                                    className="w-full min-h-[80px] px-3 py-2 rounded-lg border border-input bg-background text-sm"
                                    placeholder="Brief description of the situation..."
                                    value={formData.description}
                                    onChange={(e) => updateForm('description', e.target.value)}
                                />
                            </div>
                            <div>
                                <Label htmlFor="story">Full Story (optional)</Label>
                                <textarea
                                    id="story"
                                    className="w-full min-h-[120px] px-3 py-2 rounded-lg border border-input bg-background text-sm"
                                    placeholder="Tell the full story of how the animal was found..."
                                    value={formData.story}
                                    onChange={(e) => updateForm('story', e.target.value)}
                                />
                            </div>
                        </div>
                    )}

                    {/* Step 4: Images */}
                    {currentStep === 4 && (
                        <div className="space-y-4">
                            <Label className="text-base font-semibold block">Add Photos</Label>
                            <div className="border-2 border-dashed border-border rounded-xl p-8 text-center">
                                <Camera className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                                <p className="text-sm text-muted-foreground mb-3">
                                    Tap to take a photo or select from gallery
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
                                        <span>Choose Images</span>
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
                                <Label htmlFor="goal">Fundraising Goal</Label>
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
                                        <option value="BGN">BGN</option>
                                        <option value="EUR">EUR</option>
                                        <option value="USD">USD</option>
                                    </select>
                                </div>
                            </div>

                            <div className="bg-muted/50 rounded-lg p-4 mt-6">
                                <h3 className="font-semibold text-sm mb-2">Summary</h3>
                                <div className="text-sm text-muted-foreground space-y-1">
                                    <p><strong>Type:</strong> {formData.type || 'Not selected'}</p>
                                    <p><strong>Category:</strong> {formData.category || 'Not selected'}</p>
                                    <p><strong>Location:</strong> {formData.city}, {formData.neighborhood}</p>
                                    <p><strong>Title:</strong> {formData.title || 'Not set'}</p>
                                    <p><strong>Goal:</strong> {formData.fundraisingGoal || '0'} {formData.currency}</p>
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
                            Back
                        </Button>
                    )}
                    {currentStep < steps.length ? (
                        <Button onClick={nextStep} className="flex-1 btn-donate">
                            Next
                            <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    ) : (
                        <Button onClick={handleSubmit} className="flex-1 btn-donate">
                            <Heart className="w-4 h-4 mr-2" />
                            Submit Report
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CreateCase;
