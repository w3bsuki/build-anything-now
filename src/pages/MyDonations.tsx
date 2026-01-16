import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  ArrowLeft, 
  Heart, 
  PawPrint, 
  ChevronRight,
  Clock,
  CheckCircle,
  ExternalLink,
  ListFilter,
  CircleCheck,
  Hourglass,
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Mock data - will be replaced with Convex data
const mockDonations = [
  {
    id: '1',
    caseName: 'Luna - Emergency Surgery',
    caseImage: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=200&h=200&fit=crop',
    amount: 50,
    currency: 'EUR',
    status: 'completed' as const,
    createdAt: Date.now() - 2 * 24 * 60 * 60 * 1000,
    caseStatus: 'recovering' as const,
    caseProgress: 78,
    caseGoal: 1500,
  },
  {
    id: '2',
    caseName: 'Max - Street Rescue',
    caseImage: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=200&h=200&fit=crop',
    amount: 30,
    currency: 'EUR',
    status: 'completed' as const,
    createdAt: Date.now() - 7 * 24 * 60 * 60 * 1000,
    caseStatus: 'adopted' as const,
    caseProgress: 100,
    caseGoal: 800,
  },
  {
    id: '3',
    caseName: 'Bella - Medical Treatment',
    caseImage: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=200&h=200&fit=crop',
    amount: 25,
    currency: 'EUR',
    status: 'completed' as const,
    createdAt: Date.now() - 14 * 24 * 60 * 60 * 1000,
    caseStatus: 'urgent' as const,
    caseProgress: 45,
    caseGoal: 2000,
  },
  {
    id: '4',
    caseName: 'Charlie - Leg Surgery',
    caseImage: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=200&h=200&fit=crop',
    amount: 75,
    currency: 'EUR',
    status: 'pending' as const,
    createdAt: Date.now() - 1 * 24 * 60 * 60 * 1000,
    caseStatus: 'critical' as const,
    caseProgress: 32,
    caseGoal: 3500,
  },
];

type DonationFilter = 'all' | 'completed' | 'pending';

const MyDonations = () => {
  const { t } = useTranslation();
  const [filter, setFilter] = useState<DonationFilter>('all');
  
  // TODO: Replace with useQuery(api.donations.getMyDonations)
  const allDonations = mockDonations;
  
  // Filter donations
  const donations = allDonations.filter(d => 
    filter === 'all' || d.status === filter
  );
  
  // Stats
  const totalAmount = allDonations.reduce((sum, d) => sum + d.amount, 0);
  const completedCount = allDonations.filter(d => d.status === 'completed').length;
  const animalsHelped = new Set(allDonations.map(d => d.caseName)).size;
  const successStories = allDonations.filter(d => d.caseStatus === 'adopted').length;

  const formatDate = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return t('time.today');
    if (days === 1) return t('time.yesterday');
    if (days < 7) return t('time.daysAgo', { count: days });
    
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critical': return 'bg-destructive text-destructive-foreground';
      case 'urgent': return 'bg-urgent text-urgent-foreground';
      case 'recovering': return 'bg-recovering text-recovering-foreground';
      case 'adopted': return 'bg-adopted text-adopted-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="min-h-screen pb-24 md:pb-8 md:pt-16 bg-background">
      {/* Header */}
      <div className="sticky top-0 md:top-14 z-40 bg-card/95 backdrop-blur-md border-b border-border">
        <div className="flex items-center gap-3 px-4 py-3">
          <Link
            to="/account"
            className="w-9 h-9 flex items-center justify-center rounded-full bg-muted hover:bg-muted/80 transition-colors"
            aria-label={t('common.back')}
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </Link>
          <div className="flex-1">
            <h1 className="text-lg font-semibold text-foreground">{t('myDonations.title')}</h1>
            <p className="text-xs text-muted-foreground">
              {t('myDonations.trackImpact', 'Track your impact on animal lives')}
            </p>
          </div>
          <Link
            to="/history"
            className="h-9 px-3 flex items-center gap-1.5 rounded-full bg-muted hover:bg-muted/80 transition-colors text-sm font-medium text-foreground"
          >
            <Clock className="w-4 h-4" />
            <span className="hidden sm:inline">{t('common.history')}</span>
          </Link>
        </div>
      </div>

      {/* Filter Tabs - Top */}
      <section className="py-3">
        <div className="container mx-auto px-4">
          <Tabs value={filter} onValueChange={(v) => setFilter(v as DonationFilter)} className="w-full">
            <TabsList className="w-full h-10 p-1 bg-muted grid grid-cols-3">
              <TabsTrigger value="all" className="h-8 gap-1.5 text-xs font-medium data-[state=active]:bg-card">
                <ListFilter className="w-4 h-4" />
                <span className="hidden sm:inline">{t('status.all')}</span>
              </TabsTrigger>
              <TabsTrigger value="completed" className="h-8 gap-1.5 text-xs font-medium data-[state=active]:bg-card">
                <CircleCheck className="w-4 h-4" />
                <span className="hidden sm:inline">{t('status.completed')}</span>
              </TabsTrigger>
              <TabsTrigger value="pending" className="h-8 gap-1.5 text-xs font-medium data-[state=active]:bg-card">
                <Hourglass className="w-4 h-4" />
                <span className="hidden sm:inline">{t('donationHistory.pending')}</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </section>

      {/* Compact Stats - Two columns on mobile */}
      <section className="pb-3">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 gap-2">
            {/* Total Amount - Primary */}
            <div className="bg-card rounded-xl border border-border p-3">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Heart className="h-4 w-4 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-lg font-bold text-foreground leading-none">
                    {totalAmount.toLocaleString()}
                  </p>
                  <p className="text-[10px] text-muted-foreground">EUR {t('myDonations.contributed', 'contributed')}</p>
                </div>
              </div>
            </div>
            
            {/* Donations Count */}
            <div className="bg-card rounded-xl border border-border p-3">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                  <PawPrint className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="min-w-0">
                  <p className="text-lg font-bold text-foreground leading-none">
                    {animalsHelped}
                  </p>
                  <p className="text-[10px] text-muted-foreground">{t('myDonations.animalsHelped', 'animals helped')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Donations List */}
      <section className="pb-2">
        <div className="container mx-auto px-4">
          
          {donations.length > 0 ? (
            <div className="space-y-2">
              {donations.map((donation) => (
                <Link
                  key={donation.id}
                  to={`/case/${donation.id}`}
                  className="block bg-card rounded-xl border border-border hover:border-primary/30 active:bg-muted/50 transition-all"
                >
                  <div className="p-3">
                    {/* Main row: Image, info, amount */}
                    <div className="flex items-center gap-3">
                      {/* Case image with payment status indicator */}
                      <div className="relative shrink-0">
                        <img
                          src={donation.caseImage}
                          alt={donation.caseName}
                          className="w-14 h-14 rounded-xl object-cover"
                        />
                        {/* Payment status dot */}
                        <div className={cn(
                          "absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-card",
                          donation.status === 'completed' ? "bg-success" : "bg-warning"
                        )} />
                      </div>
                      
                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="font-semibold text-sm text-foreground truncate">
                              {donation.caseName}
                            </p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <Badge 
                                variant="secondary" 
                                className={cn(
                                  "text-[10px] px-1.5 py-0 h-4 font-medium",
                                  getStatusColor(donation.caseStatus)
                                )}
                              >
                                {donation.caseStatus}
                              </Badge>
                              <span className="text-[10px] text-muted-foreground">
                                {formatDate(donation.createdAt)}
                              </span>
                            </div>
                          </div>
                          
                          {/* Amount with currency */}
                          <div className="text-right shrink-0">
                            <p className="text-base font-bold text-foreground leading-none">
                              {donation.amount} <span className="text-xs font-normal text-muted-foreground">{donation.currency}</span>
                            </p>
                            <p className={cn(
                              "text-[10px] mt-0.5",
                              donation.status === 'completed' ? "text-success" : "text-warning"
                            )}>
                              {donation.status === 'completed' ? '✓ Paid' : '⏳ Pending'}
                            </p>
                          </div>
                        </div>
                        
                        {/* Progress bar - minimal */}
                        <div className="mt-2 flex items-center gap-2">
                          <Progress 
                            value={donation.caseProgress} 
                            className="h-1.5 flex-1"
                          />
                          <span className="text-[10px] font-medium text-muted-foreground shrink-0">
                            {donation.caseProgress}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            /* Empty State */
            <div className="text-center py-16">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                <Heart className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-1">
                {filter !== 'all' 
                  ? t('myDonations.noFilteredDonations', 'No {{filter}} donations', { filter })
                  : t('myDonations.noDonations', 'No donations yet')
                }
              </h3>
              <p className="text-muted-foreground text-sm max-w-xs mx-auto mb-6">
                {filter !== 'all'
                  ? t('myDonations.tryDifferentFilter', 'Try a different filter or make a new donation')
                  : t('myDonations.donationsWillAppear', 'Your donations will appear here once you start helping animals in need')
                }
              </p>
              <Button asChild className="rounded-xl">
                <Link to="/">
                  <Heart className="w-4 h-4 mr-2" />
                  {t('myDonations.startHelping', 'Start helping')}
                </Link>
              </Button>
            </div>
          )}
          
          {/* View Full History CTA */}
          {donations.length > 0 && (
            <div className="mt-6">
              <Button
                variant="outline"
                asChild
                className="w-full h-12 rounded-xl border-border hover:bg-muted"
              >
                <Link to="/history">
                  <Clock className="w-4 h-4 mr-2" />
                  {t('myDonations.viewFullHistory', 'View full transaction history')}
                  <ExternalLink className="w-4 h-4 ml-auto" />
                </Link>
              </Button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default MyDonations;
