import { useState } from 'react';
import { mockCases, mockCampaigns, mockPartners } from '@/data/mockData';
import { CaseCard } from '@/components/CaseCard';
import { CampaignCard } from '@/components/CampaignCard';
import { PartnerCard } from '@/components/PartnerCard';
import { ContentTabs } from '@/components/ContentTabs';
import { FilterPills } from '@/components/FilterPills';
import { PawPrint, Search, Handshake, Heart, AlertTriangle, Clock, HeartHandshake, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

const statusFilters = [
  { id: 'all', label: 'All Cases' },
  { id: 'critical', label: 'Critical', icon: <AlertTriangle className="w-3.5 h-3.5" /> },
  { id: 'urgent', label: 'Urgent', icon: <Clock className="w-3.5 h-3.5" /> },
  { id: 'recovering', label: 'Recovering', icon: <HeartHandshake className="w-3.5 h-3.5" /> },
  { id: 'adopted', label: 'Adopted', icon: <Sparkles className="w-3.5 h-3.5" /> },
];

const Index = () => {
  const [activeTab, setActiveTab] = useState<'cases' | 'campaigns' | 'partners'>('cases');
  const [statusFilter, setStatusFilter] = useState('all');

  // Filter cases based on selected status
  const filteredCases = mockCases.filter((c) => {
    return statusFilter === 'all' || c.status === statusFilter;
  });

  const urgentCases = filteredCases.filter(c => c.status === 'urgent' || c.status === 'critical');
  const otherCases = filteredCases.filter(c => c.status !== 'urgent' && c.status !== 'critical');

  return (
    <div className="min-h-screen pb-24 md:pb-8 md:pt-20">
      {/* Header */}
      <section className="bg-gradient-to-b from-primary/5 to-transparent pt-6 pb-4">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <PawPrint className="w-5 h-5 text-primary-foreground" />
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-foreground">
              Paws<span className="text-primary">Safe</span>
            </h1>
          </div>
          <p className="text-center text-muted-foreground text-xs max-w-xs mx-auto">
            Help rescue and protect stray animals across Bulgaria
          </p>
        </div>
      </section>

      {/* Content Tabs */}
      <div className="sticky top-0 md:top-16 bg-background z-40">
        <div className="container mx-auto px-4">
          <ContentTabs activeTab={activeTab} onTabChange={setActiveTab} />
        </div>
      </div>

      {/* Cases Tab */}
      {activeTab === 'cases' && (
        <div>
          {/* Search + Filters */}
          <div className="sticky top-10 md:top-[104px] bg-background z-30 py-3 border-b border-border">
            <div className="container mx-auto px-4 space-y-3">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search rescue cases..."
                  className="w-full pl-10 pr-4 py-2 rounded-full bg-muted border-0 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-colors"
                />
              </div>

              {/* Status Filter Pills */}
              <FilterPills
                options={statusFilters}
                selected={statusFilter}
                onSelect={setStatusFilter}
              />
            </div>
          </div>

          {/* Urgent Cases - Horizontal Scroll */}
          {urgentCases.length > 0 && (
            <section className="py-4">
              <div className="container mx-auto px-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-urgent" />
                  <h2 className="text-sm font-semibold text-foreground">Urgent Cases</h2>
                  <span className="text-xs text-muted-foreground">({urgentCases.length})</span>
                </div>
              </div>
              <div className="overflow-x-auto scrollbar-hide">
                <div className="flex gap-3 px-4 pb-2" style={{ width: 'max-content' }}>
                  {urgentCases.map((caseData) => (
                    <div key={caseData.id} className="w-[280px] flex-shrink-0">
                      <CaseCard caseData={caseData} />
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* All Cases */}
          <section className="py-4">
            <div className="container mx-auto px-4">
              <div className="flex items-center gap-2 mb-3">
                <h2 className="text-sm font-semibold text-foreground">
                  {urgentCases.length > 0 ? 'Other Cases' : 'All Cases'}
                </h2>
                <span className="text-xs text-muted-foreground">({otherCases.length})</span>
              </div>
              {otherCases.length > 0 ? (
                <div className="grid gap-3 grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {otherCases.map((caseData) => (
                    <CaseCard key={caseData.id} caseData={caseData} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground text-sm">
                  No cases match your filters
                </div>
              )}
            </div>
          </section>
        </div>
      )}

      {/* Campaigns Tab */}
      {activeTab === 'campaigns' && (
        <section className="py-4">
          <div className="container mx-auto px-4">
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {mockCampaigns.map((campaign) => (
                <CampaignCard key={campaign.id} campaign={campaign} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Partners Tab */}
      {activeTab === 'partners' && (
        <div>
          {/* Stats */}
          <section className="py-4 border-b border-border">
            <div className="container mx-auto px-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-xl font-bold text-primary">{mockPartners.length}</p>
                  <p className="text-xs text-muted-foreground">Partners</p>
                </div>
                <div>
                  <p className="text-xl font-bold text-primary">1,200+</p>
                  <p className="text-xs text-muted-foreground">Animals Helped</p>
                </div>
                <div>
                  <p className="text-xl font-bold text-primary">50,000+</p>
                  <p className="text-xs text-muted-foreground">BGN Contributed</p>
                </div>
              </div>
            </div>
          </section>

          {/* Partners Grid */}
          <section className="py-4">
            <div className="container mx-auto px-4">
              <div className="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {mockPartners.map((partner) => (
                  <PartnerCard key={partner.id} partner={partner} />
                ))}
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="py-4">
            <div className="container mx-auto px-4">
              <div className="bg-muted/50 rounded-xl p-5 text-center">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-2">
                  <Heart className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-base font-bold text-foreground mb-1">
                  Want to make a difference?
                </h2>
                <p className="text-xs text-muted-foreground max-w-xs mx-auto mb-3">
                  Partner with PawsSafe and help us save more lives
                </p>
                <Button className="btn-donate text-sm">
                  <Handshake className="w-4 h-4 mr-1.5" />
                  Become a Partner
                </Button>
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
};

export default Index;
