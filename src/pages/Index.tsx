import { useState } from 'react';
import { PawPrint, Search, Sparkles, AlertTriangle, Heart, Activity } from 'lucide-react';
import { CaseCard } from '@/components/CaseCard';
import { FilterPills } from '@/components/FilterPills';
import { mockCases } from '@/data/mockData';

const statusFilters = [
  { id: 'all', label: 'All' },
  { id: 'critical', label: 'Critical', icon: <AlertTriangle className="w-3.5 h-3.5" /> },
  { id: 'urgent', label: 'Urgent', icon: <Activity className="w-3.5 h-3.5" /> },
  { id: 'recovering', label: 'Recovering', icon: <Heart className="w-3.5 h-3.5" /> },
  { id: 'adopted', label: 'Adopted', icon: <Sparkles className="w-3.5 h-3.5" /> },
];

const Index = () => {
  const [statusFilter, setStatusFilter] = useState('all');

  // Filter cases based on selected status
  const filteredCases = mockCases.filter((c) => {
    return statusFilter === 'all' || c.status === statusFilter;
  });

  const urgentCases = filteredCases.filter(c => c.status === 'urgent' || c.status === 'critical');
  const otherCases = filteredCases.filter(c => c.status !== 'urgent' && c.status !== 'critical');

  return (
    <div className="min-h-screen pb-24 md:pb-8 md:pt-16">
      {/* Hero */}
      <section className="pt-2">
        <div className="container mx-auto px-4 space-y-2">
          <div className="flex items-center justify-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <PawPrint className="w-4 h-4 text-primary-foreground" />
            </div>
            <h1 className="text-lg md:text-xl font-bold text-foreground">
              Rescue Cases
            </h1>
          </div>
          <p className="text-center text-muted-foreground text-xs max-w-md mx-auto">
            Help rescue and protect stray animals across Bulgaria
          </p>
        </div>
      </section>

      {/* Search + Filters */}
      <div className="sticky top-0 md:top-14 bg-background z-30 py-3 border-b border-border">
        <div className="container mx-auto px-4 space-y-2">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search rescue cases..."
              className="w-full pl-10 pr-4 py-2 rounded-full bg-muted border-0 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors"
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
            <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
  );
};

export default Index;
