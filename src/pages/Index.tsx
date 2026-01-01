import { mockCases } from '@/data/mockData';
import { CaseCard } from '@/components/CaseCard';
import { PawPrint, Search } from 'lucide-react';

const Index = () => {
  const urgentCases = mockCases.filter(c => c.status === 'urgent' || c.status === 'critical');
  const otherCases = mockCases.filter(c => c.status !== 'urgent' && c.status !== 'critical');

  return (
    <div className="min-h-screen pb-24 md:pb-8 md:pt-20">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary/5 to-transparent py-8 md:py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="w-11 h-11 rounded-xl bg-primary flex items-center justify-center">
              <PawPrint className="w-6 h-6 text-primary-foreground" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              Paws<span className="text-primary">Safe</span>
            </h1>
          </div>
          <p className="text-center text-muted-foreground text-sm max-w-sm mx-auto mb-6">
            Help rescue and protect stray animals across Bulgaria
          </p>
          
          {/* Search Bar */}
          <div className="max-w-md mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search rescue cases..."
              className="w-full pl-11 pr-4 py-2.5 rounded-full bg-card border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-colors"
            />
          </div>
        </div>
      </section>

      {/* Urgent Cases */}
      {urgentCases.length > 0 && (
        <section className="py-5">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-urgent" />
              <h2 className="text-base font-semibold text-foreground">Urgent Cases</h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {urgentCases.map((caseData) => (
                <CaseCard key={caseData.id} caseData={caseData} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* All Cases */}
      <section className="py-5">
        <div className="container mx-auto px-4">
          <h2 className="text-base font-semibold text-foreground mb-4">All Cases</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {otherCases.map((caseData) => (
              <CaseCard key={caseData.id} caseData={caseData} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
