import { Link } from 'react-router-dom';
import { ArrowLeft, History } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FilterPills } from '@/components/FilterPills';
import { cn } from '@/lib/utils';

// Mock data - will be replaced with Convex data
const mockHistory = [
  {
    id: '1',
    caseName: 'Luna - Emergency Surgery',
    amount: 50,
    currency: 'EUR',
    status: 'completed' as const,
    createdAt: Date.now() - 2 * 24 * 60 * 60 * 1000,
    transactionId: 'TXN-001234',
  },
  {
    id: '2',
    caseName: 'Max - Street Rescue',
    amount: 30,
    currency: 'EUR',
    status: 'completed' as const,
    createdAt: Date.now() - 7 * 24 * 60 * 60 * 1000,
    transactionId: 'TXN-001233',
  },
  {
    id: '3',
    caseName: 'Bella - Medical Treatment',
    amount: 25,
    currency: 'EUR',
    status: 'completed' as const,
    createdAt: Date.now() - 14 * 24 * 60 * 60 * 1000,
    transactionId: 'TXN-001232',
  },
  {
    id: '4',
    caseName: 'Winter Campaign 2025',
    amount: 100,
    currency: 'EUR',
    status: 'completed' as const,
    createdAt: Date.now() - 30 * 24 * 60 * 60 * 1000,
    transactionId: 'TXN-001231',
  },
];

const formatDate = (timestamp: number) => {
  return new Date(timestamp).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const formatTime = (timestamp: number) => {
  return new Date(timestamp).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Group donations by month
const groupByMonth = (donations: typeof mockHistory) => {
  const groups: Record<string, typeof mockHistory> = {};
  
  donations.forEach((donation) => {
    const date = new Date(donation.createdAt);
    const key = `${date.getFullYear()}-${date.getMonth()}`;
    
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(donation);
  });
  
  return Object.entries(groups).map(([key, items]) => ({
    key,
    label: new Date(items[0].createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    items,
    total: items.reduce((sum, d) => sum + d.amount, 0),
  }));
};

const DonationHistory = () => {
  const { t } = useTranslation();
  const [statusFilter, setStatusFilter] = useState('all');

  const statusFilters = [
    { id: 'all', label: t('status.all') },
    { id: 'completed', label: t('status.completed') },
    { id: 'pending', label: t('donationHistory.pending') },
  ];
  
  // TODO: Replace with useQuery(api.donations.getMyDonations)
  const allDonations = mockHistory;
  const filteredDonations = allDonations.filter(
    (d) => statusFilter === 'all' || d.status === statusFilter
  );
  const groupedDonations = groupByMonth(filteredDonations);

  return (
    <div className="min-h-screen pb-20 md:pb-8 md:pt-16">
      {/* Header */}
      <div className="sticky top-0 md:top-14 z-40 bg-card/95 backdrop-blur-md border-b border-border">
        <div className="flex items-center gap-3 px-4 py-3">
          <Link
            to="/profile"
            className="w-9 h-9 flex items-center justify-center rounded-full bg-muted hover:bg-muted/80 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </Link>
          <div className="flex-1">
            <h1 className="text-lg font-semibold text-foreground">{t('donationHistory.title')}</h1>
            <p className="text-xs text-muted-foreground">{t('donationHistory.subtitle')}</p>
          </div>
        </div>
        
        {/* Filter Pills */}
        <div className="px-4 pb-3">
          <FilterPills
            options={statusFilters}
            selected={statusFilter}
            onSelect={setStatusFilter}
          />
        </div>
      </div>

      {/* History List */}
      <section className="py-4">
        <div className="container mx-auto px-4">
          {groupedDonations.length > 0 ? (
            <div className="space-y-6">
              {groupedDonations.map((group) => (
                <div key={group.key}>
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-sm font-semibold text-foreground">{group.label}</h2>
                    <span className="text-xs text-muted-foreground">{group.total} EUR</span>
                  </div>
                  
                  <div className="space-y-2">
                    {group.items.map((donation) => (
                      <div
                        key={donation.id}
                        className="bg-card rounded-xl border border-border p-4"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-foreground truncate">{donation.caseName}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {formatDate(donation.createdAt)} at {formatTime(donation.createdAt)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-foreground">{donation.amount} {donation.currency}</p>
                            <span className={cn(
                              "text-xs px-2 py-0.5 rounded-full",
                              donation.status === 'completed' ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"
                            )}>
                              {donation.status}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t border-border">
                          <span>{t('donationHistory.transactionId')}:</span>
                          <code className="bg-muted px-1.5 py-0.5 rounded">{donation.transactionId}</code>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                <History className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground text-sm">{t('donationHistory.noTransactions')}</p>
              <p className="text-muted-foreground text-xs mt-1">{t('donationHistory.historyWillAppear')}</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default DonationHistory;
