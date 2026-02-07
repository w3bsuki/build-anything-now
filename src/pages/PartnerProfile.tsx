import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Globe, Mail, Phone, MapPin, Handshake, ExternalLink } from 'lucide-react';
import type { Id } from '../../convex/_generated/dataModel';

const PartnerProfile = () => {
    const { t } = useTranslation();
    const { id } = useParams();

    // Fetch partner from Convex
    const rawPartner = useQuery(
        api.partners.get,
        id ? { id: id as Id<"partners"> } : "skip"
    );

    const isLoading = rawPartner === undefined;

    // Transform to match expected shape
    const partner = rawPartner ? {
        id: rawPartner._id,
        name: rawPartner.name,
        logo: rawPartner.logo,
        contribution: rawPartner.contribution,
        description: rawPartner.description,
        type: rawPartner.type,
        website: rawPartner.website,
        since: rawPartner.since,
        animalsHelped: rawPartner.animalsHelped,
        totalContributed: rawPartner.totalContributed,
        featured: rawPartner.featured,
    } : null;

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-pulse text-muted-foreground">{t('common.loading')}</div>
            </div>
        );
    }

    if (!partner) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-foreground mb-2">{t('common.partnerNotFound')}</h1>
                    <Link to="/partners" className="text-primary hover:underline">
                        {t('common.goBackPartners')}
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pb-12 md:pb-8 md:pt-16">
            <div className="sticky top-0 z-40 bg-card/95 backdrop-blur-md md:hidden">
                <div className="flex items-center gap-3 h-14 px-3">
                    <Link
                        to="/partners"
                        className="w-9 h-9 rounded-xl bg-muted/80 flex items-center justify-center active:bg-muted transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-foreground" />
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
                        {t('common.backToPartners')}
                    </Link>

                    {/* Profile Header */}
                    <div className="bg-card rounded-2xl border border-border p-6 md:p-8 mb-6 text-center relative overflow-hidden">
                        <div className="absolute top-0 left-0 right-0 h-24 bg-surface-sunken/60 -z-10" />

                        <div className="w-24 h-24 rounded-2xl overflow-hidden mx-auto mb-4 bg-background shadow-lg border-2 border-background">
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
                            {partner.type === 'pet-shop' ? t('partners.types.petShop') :
                                partner.type === 'food-brand' ? t('partners.types.foodBrand') :
                                    partner.type === 'veterinary' ? t('partners.types.veterinary') : t('partners.types.sponsor')}
                        </div>

                        <p className="text-muted-foreground max-w-md mx-auto mb-6">
                            {t('partnerProfile.proudPartner')}
                        </p>

                        <div className="flex items-center justify-center gap-3">
                            <Button size="sm" variant="outline" className="gap-2">
                                <Globe className="w-4 h-4" />
                                {t('clinicProfile.website')}
                            </Button>
                            <Button size="sm" variant="outline" className="gap-2">
                                <Mail className="w-4 h-4" />
                                {t('partnerProfile.contact')}
                            </Button>
                        </div>
                    </div>

                    {/* Contribution Card */}
                    <div className="bg-primary/5 rounded-2xl p-6 mb-6 border border-primary/10">
                        <h2 className="font-semibold text-lg text-foreground mb-4 flex items-center gap-2">
                            <Handshake className="w-5 h-5 text-primary" />
                            {t('partnerProfile.theirContribution')}
                        </h2>
                        <p className="text-foreground/80 leading-relaxed">
                            {partner.contribution}
                        </p>
                        <div className="mt-4 pt-4 border-t border-primary/10 grid grid-cols-2 gap-4">
                            <div>
                                <div className="text-2xl font-bold text-primary">12</div>
                                <div className="text-xs text-muted-foreground">{t('partnerProfile.campaignsSupported')}</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-primary">5,000+</div>
                                <div className="text-xs text-muted-foreground">{t('partnerProfile.eurDonated')}</div>
                            </div>
                        </div>
                    </div>

                    {/* Contact Info (Mock) */}
                    <div className="bg-card rounded-2xl border border-border p-6">
                        <h2 className="font-semibold text-lg text-foreground mb-4">{t('clinicProfile.contactInformation')}</h2>
                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <MapPin className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                                <div>
                                    <div className="font-medium text-sm text-foreground">{t('partnerProfile.location')}</div>
                                    <div className="text-sm text-muted-foreground">Sofia, Bulgaria</div>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Phone className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                                <div>
                                    <div className="font-medium text-sm text-foreground">{t('clinicProfile.phone')}</div>
                                    <div className="text-sm text-muted-foreground">+359 888 123 456</div>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <ExternalLink className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                                <div>
                                    <div className="font-medium text-sm text-foreground">{t('partnerProfile.socialMedia')}</div>
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
