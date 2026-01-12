import { Link } from 'react-router-dom';
import { ArrowLeft, Heart, Calendar, PawPrint } from 'lucide-react';
import { cn } from '@/lib/utils';

// Mock data - will be replaced with Convex data
const mockDonations = [
  {
    id: '1',
    caseName: 'Luna - Emergency Surgery',
    caseImage: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=200&h=200&fit=crop',
    amount: 50,
    currency: 'BGN',
    status: 'completed' as const,
    createdAt: Date.now() - 2 * 24 * 60 * 60 * 1000,
  },
  {
    id: '2',
    caseName: 'Max - Street Rescue',
    caseImage: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=200&h=200&fit=crop',
    amount: 30,
    currency: 'BGN',
    status: 'completed' as const,
    createdAt: Date.now() - 7 * 24 * 60 * 60 * 1000,
  },
  {
    id: '3',
    caseName: 'Bella - Medical Treatment',
    caseImage: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=200&h=200&fit=crop',
    amount: 25,
    currency: 'BGN',
    status: 'completed' as const,
    createdAt: Date.now() - 14 * 24 * 60 * 60 * 1000,
  },
];

const formatDate = (timestamp: number) => {
  return new Date(timestamp).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const MyDonations = () => {
  // TODO: Replace with useQuery(api.donations.getMyDonations)
  const donations = mockDonations;
  const totalAmount = donations.reduce((sum, d) => sum + d.amount, 0);

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
            <h1 className="text-lg font-semibold text-foreground">My Donations</h1>
            <p className="text-xs text-muted-foreground">{donations.length} donations • {totalAmount} BGN total</p>
          </div>
        </div>
      </div>

      {/* Summary Card */}
      <section className="py-4">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-to-br from-primary/10 via-card to-accent/5 rounded-2xl p-6 border border-border">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-primary/20 flex items-center justify-center">
                  <Heart className="w-5 h-5 text-primary" />
                </div>
                <p className="text-2xl font-bold text-foreground">{donations.length}</p>
                <p className="text-xs text-muted-foreground">Donations</p>
              </div>
              <div>
                <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-success/20 flex items-center justify-center">
                  <span className="text-success font-bold text-sm">BGN</span>
                </div>
                <p className="text-2xl font-bold text-foreground">{totalAmount}</p>
                <p className="text-xs text-muted-foreground">Contributed</p>
              </div>
              <div>
                <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-accent/20 flex items-center justify-center">
                  <PawPrint className="w-5 h-5 text-accent-foreground" />
                </div>
                <p className="text-2xl font-bold text-foreground">{donations.length}</p>
                <p className="text-xs text-muted-foreground">Animals</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Donations List */}
      <section className="py-2">
        <div className="container mx-auto px-4">
          <h2 className="text-sm font-semibold text-foreground mb-3">Recent Donations</h2>
          
          {donations.length > 0 ? (
            <div className="space-y-3">
              {donations.map((donation) => (
                <div
                  key={donation.id}
                  className="bg-card rounded-xl border border-border p-4 flex items-center gap-4"
                >
                  <img
                    src={donation.caseImage}
                    alt={donation.caseName}
                    className="w-14 h-14 rounded-xl object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{donation.caseName}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{formatDate(donation.createdAt)}</span>
                    </div>
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
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                <Heart className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground text-sm">No donations yet</p>
              <p className="text-muted-foreground text-xs mt-1">Your donations will appear here</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default MyDonations;
