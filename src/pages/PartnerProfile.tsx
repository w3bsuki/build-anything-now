import { useParams, Link } from 'react-router-dom';
import { mockPartners } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Globe, Mail, Phone, MapPin, Handshake, ExternalLink } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';

const PartnerProfile = () => {
    const { id } = useParams();
    const partner = mockPartners.find((p) => p.id === id);

    if (!partner) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-foreground mb-2">Partner not found</h1>
                    <Link to="/partners" className="text-primary hover:underline">
                        Go back to partners
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pb-12 md:pb-8 md:pt-16">
            <div className="sticky top-0 z-40 bg-card/95 backdrop-blur-md border-b border-border md:hidden">
                <div className="flex items-center gap-3 px-4 py-2.5">
                    <Link
                        to="/partners"
                        className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center"
                    >
                        <ArrowLeft className="w-4 h-4 text-foreground" />
                    </Link>
                    <h1 className="font-medium text-sm text-foreground truncate flex-1">
                        {partner.name}
                    </h1>
                </div>
            </div>

            <div className="container mx-auto px-4 py-5">
                <div className="max-w-2xl mx-auto">
                    {/* Desktop Back Button */}
                    <Link
                        to="/partners"
                        className="hidden md:inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-5 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to partners
                    </Link>

                    {/* Profile Header */}
                    <div className="bg-card rounded-2xl border border-border p-6 md:p-8 mb-6 text-center relative overflow-hidden">
                        <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-primary/5 to-transparent -z-10" />

                        <div className="w-24 h-24 rounded-2xl overflow-hidden mx-auto mb-4 bg-white shadow-lg border-2 border-white">
                            <img
                                src={partner.logo}
                                alt={partner.name}
                                className="w-full h-full object-cover"
                            />
                        </div>

                        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                            {partner.name}
                        </h1>

                        <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                            {partner.type === 'pet-shop' ? 'Pet Shop' :
                                partner.type === 'food-brand' ? 'Food Brand' :
                                    partner.type === 'veterinary' ? 'Veterinary Clinic' : 'Sponsor'}
                        </div>

                        <p className="text-muted-foreground max-w-md mx-auto mb-6">
                            Proud partner of PawsSafe since 2023, helping us save lives every day.
                        </p>

                        <div className="flex items-center justify-center gap-3">
                            <Button size="sm" variant="outline" className="gap-2">
                                <Globe className="w-4 h-4" />
                                Website
                            </Button>
                            <Button size="sm" variant="outline" className="gap-2">
                                <Mail className="w-4 h-4" />
                                Contact
                            </Button>
                        </div>
                    </div>

                    {/* Contribution Card */}
                    <div className="bg-primary/5 rounded-2xl p-6 mb-6 border border-primary/10">
                        <h2 className="font-semibold text-lg text-foreground mb-4 flex items-center gap-2">
                            <Handshake className="w-5 h-5 text-primary" />
                            Their Contribution
                        </h2>
                        <p className="text-foreground/80 leading-relaxed">
                            {partner.contribution}
                        </p>
                        <div className="mt-4 pt-4 border-t border-primary/10 grid grid-cols-2 gap-4">
                            <div>
                                <div className="text-2xl font-bold text-primary">12</div>
                                <div className="text-xs text-muted-foreground">Campaigns Supported</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-primary">5,000+</div>
                                <div className="text-xs text-muted-foreground">BGN Donated</div>
                            </div>
                        </div>
                    </div>

                    {/* Contact Info (Mock) */}
                    <div className="bg-card rounded-2xl border border-border p-6">
                        <h2 className="font-semibold text-lg text-foreground mb-4">Contact Information</h2>
                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <MapPin className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                                <div>
                                    <div className="font-medium text-sm text-foreground">Location</div>
                                    <div className="text-sm text-muted-foreground">Sofia, Bulgaria</div>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Phone className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                                <div>
                                    <div className="font-medium text-sm text-foreground">Phone</div>
                                    <div className="text-sm text-muted-foreground">+359 888 123 456</div>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <ExternalLink className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                                <div>
                                    <div className="font-medium text-sm text-foreground">Social Media</div>
                                    <div className="flex gap-2 mt-1">
                                        <a href="#" className="text-primary hover:underline text-sm">Facebook</a>
                                        <span className="text-muted-foreground">•</span>
                                        <a href="#" className="text-primary hover:underline text-sm">Instagram</a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PartnerProfile;
