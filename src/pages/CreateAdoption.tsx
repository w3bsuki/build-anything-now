import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, Heart, PawPrint, Cat } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

const animalTypes = [
    { id: 'dog', label: 'Dog', icon: PawPrint },
    { id: 'cat', label: 'Cat', icon: Cat },
    { id: 'other', label: 'Other', icon: Heart },
];

const CreateAdoption = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        animalType: '',
        name: '',
        age: '',
        description: '',
        city: '',
        neighborhood: '',
        vaccinated: false,
        neutered: false,
        images: [] as File[],
    });

    const updateForm = (field: string, value: string | boolean | File[]) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async () => {
        // TODO: Implement Convex mutation
        console.log('Submitting adoption:', formData);
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
                    <h1 className="font-semibold text-foreground">List for Adoption</h1>
                </div>
            </div>

            <div className="container mx-auto px-4 py-6">
                <div className="bg-card rounded-xl border border-border p-5 space-y-6">
                    {/* Animal Type */}
                    <div>
                        <Label className="text-base font-semibold mb-3 block">Animal Type</Label>
                        <div className="flex gap-2">
                            {animalTypes.map((type) => {
                                const Icon = type.icon;
                                return (
                                    <button
                                        key={type.id}
                                        onClick={() => updateForm('animalType', type.id)}
                                        className={cn(
                                            "flex-1 flex flex-col items-center gap-2 p-4 rounded-lg border transition-colors",
                                            formData.animalType === type.id
                                                ? "border-primary bg-primary/5"
                                                : "border-border hover:bg-muted"
                                        )}
                                    >
                                        <Icon className="w-6 h-6" />
                                        <span className="text-sm font-medium">{type.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Basic Info */}
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                placeholder="e.g., Max"
                                value={formData.name}
                                onChange={(e) => updateForm('name', e.target.value)}
                            />
                        </div>
                        <div>
                            <Label htmlFor="age">Age</Label>
                            <Input
                                id="age"
                                placeholder="e.g., 2 years"
                                value={formData.age}
                                onChange={(e) => updateForm('age', e.target.value)}
                            />
                        </div>
                        <div>
                            <Label htmlFor="description">Description</Label>
                            <textarea
                                id="description"
                                className="w-full min-h-[100px] px-3 py-2 rounded-lg border border-input bg-background text-sm"
                                placeholder="Tell us about this animal's personality..."
                                value={formData.description}
                                onChange={(e) => updateForm('description', e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Location */}
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
                            <Label htmlFor="neighborhood">Neighborhood</Label>
                            <Input
                                id="neighborhood"
                                placeholder="e.g., Lozenets"
                                value={formData.neighborhood}
                                onChange={(e) => updateForm('neighborhood', e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Health Info */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="vaccinated">Vaccinated</Label>
                            <Switch
                                id="vaccinated"
                                checked={formData.vaccinated}
                                onCheckedChange={(checked) => updateForm('vaccinated', checked)}
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <Label htmlFor="neutered">Neutered / Spayed</Label>
                            <Switch
                                id="neutered"
                                checked={formData.neutered}
                                onCheckedChange={(checked) => updateForm('neutered', checked)}
                            />
                        </div>
                    </div>

                    {/* Images */}
                    <div>
                        <Label className="text-base font-semibold block mb-3">Photos</Label>
                        <div className="border-2 border-dashed border-border rounded-xl p-6 text-center">
                            <Camera className="w-10 h-10 mx-auto mb-2 text-muted-foreground" />
                            <p className="text-sm text-muted-foreground mb-3">Add photos of the animal</p>
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                className="hidden"
                                id="adoption-image-upload"
                                onChange={(e) => {
                                    const files = Array.from(e.target.files || []);
                                    updateForm('images', [...formData.images, ...files]);
                                }}
                            />
                            <label htmlFor="adoption-image-upload">
                                <Button variant="outline" className="cursor-pointer" asChild>
                                    <span>Choose Images</span>
                                </Button>
                            </label>
                        </div>
                        {formData.images.length > 0 && (
                            <div className="flex gap-2 flex-wrap mt-3">
                                {formData.images.map((file, idx) => (
                                    <div key={idx} className="w-16 h-16 rounded-lg bg-muted overflow-hidden">
                                        <img src={URL.createObjectURL(file)} alt="" className="w-full h-full object-cover" />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Submit Button */}
                <Button onClick={handleSubmit} className="w-full mt-6 btn-donate">
                    <Heart className="w-4 h-4 mr-2" />
                    List for Adoption
                </Button>
            </div>
        </div>
    );
};

export default CreateAdoption;
