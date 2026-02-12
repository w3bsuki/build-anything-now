import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import {
  ArrowLeft,
  Heart,
  PawPrint,
  Clock,
  ExternalLink,
  ListFilter,
  CircleCheck,
  Hourglass,
} from 'lucide-react';
import { useState } from 'react';
import { useQuery } from 'convex/react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { api } from '../../convex/_generated/api';

type DonationFilter = 'all' | 'completed' | 'pending';

type DonationStatus = 'pending' | 'completed' | 'failed' | 'refunded';

type DonationRow = {
  _id: string;
  caseId?: string | null;
  campaignRefId?: string | null;
  caseName?: string | null;
  caseImage?: string | null;
  amount: number;
  currency: string;
  status: DonationStatus;
  receiptId?: string | null;
  receiptUrl?: string | null;
  createdAt: number;
};

function formatMoney(amount: number, currency: string) {
  const safeCurrency = currency || 'EUR';
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: safeCurrency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${amount} ${safeCurrency}`;
  }
}

function statusLabel(
  status: DonationStatus,
  t: TFunction<'translation'>,
) {
  switch (status) {
    case 'completed':
      return t('status.completed', 'Completed');
    case 'pending':
      return t('donationHistory.pending', 'Pending');
    case 'failed':
      return t('status.failed', 'Failed');
    case 'refunded':
      return t('status.refunded', 'Refunded');
    default:
      return status;
  }
}

function statusBadgeClass(status: DonationStatus) {
  switch (status) {
    case 'completed':
      return 'bg-success/10 text-success border-success/20';
    case 'pending':
      return 'bg-warning/10 text-warning border-warning/20';
    case 'failed':
      return 'bg-destructive/10 text-destructive border-destructive/20';
    case 'refunded':
      return 'bg-muted text-muted-foreground border-border/40';
    default:
      return 'bg-muted text-muted-foreground border-border/40';
  }
}

function statusDotClass(status: DonationStatus) {
  switch (status) {
    case 'completed':
      return 'bg-success';
    case 'failed':
      return 'bg-destructive';
    case 'refunded':
      return 'bg-muted-foreground';
    case 'pending':
      return 'bg-warning';
    default:
      return 'bg-warning';
  }
}

const MyDonations = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<DonationFilter>('all');

  const allDonationsRaw = useQuery(api.donations.getMyDonations);
  const isLoading = allDonationsRaw === undefined;
  const allDonations = (allDonationsRaw ?? []) as DonationRow[];

  const donations = allDonations.filter((donation) =>
    filter === 'all' ? true : donation.status === filter,
  );

  const completedDonations = allDonations.filter((donation) => donation.status === 'completed');
  const completedCurrencies = new Set(completedDonations.map((donation) => donation.currency).filter(Boolean));
  const totalAmount = completedDonations.reduce((sum, donation) => sum + donation.amount, 0);
  const totalCurrency = completedCurrencies.size === 1 ? Array.from(completedCurrencies)[0] : null;
  const animalsHelped = new Set(completedDonations.map((donation) => donation.caseId).filter(Boolean)).size;

  const formatDate = (timestamp: number) =>
    new Date(timestamp).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

  return (
    <div className="min-h-screen pb-24 md:pb-8 md:pt-16 bg-background">
      <div className="sticky top-0 md:top-14 z-40 bg-nav-surface/95 backdrop-blur-md border-b border-nav-border/70">
        <div className="flex items-center gap-3 px-4 py-3">
          <Link
            to="/account"
            className="w-9 h-9 flex items-center justify-center rounded-full bg-surface-sunken hover:bg-surface-sunken/90 transition-colors"
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
            className="h-9 px-3 flex items-center gap-1.5 rounded-full bg-surface-sunken hover:bg-surface-sunken/90 transition-colors text-sm font-medium text-foreground"
          >
            <Clock className="w-4 h-4" />
            <span className="hidden sm:inline">{t('common.history')}</span>
          </Link>
        </div>
      </div>

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
                <span className="hidden sm:inline">{t('donationHistory.pending', 'Pending')}</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </section>

      <section className="pb-3">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-surface-elevated rounded-2xl border border-border/60 shadow-xs p-3">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Heart className="h-4 w-4 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-lg font-bold text-foreground leading-none">
                    {isLoading ? '—' : totalCurrency ? formatMoney(totalAmount, totalCurrency) : '—'}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {isLoading
                      ? t('common.loading', 'Loading…')
                      : totalCurrency
                        ? t('myDonations.contributed', 'contributed')
                        : t('myDonations.multipleCurrencies', 'Multiple currencies')}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-surface-elevated rounded-2xl border border-border/60 shadow-xs p-3">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                  <PawPrint className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="min-w-0">
                  <p className="text-lg font-bold text-foreground leading-none">{isLoading ? '—' : animalsHelped}</p>
                  <p className="text-[10px] text-muted-foreground">{t('myDonations.animalsHelped', 'animals helped')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="pb-2">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="text-sm text-muted-foreground">{t('common.loading', 'Loading…')}</div>
          ) : donations.length > 0 ? (
            <div className="space-y-2">
              {donations.map((donation) => {
                const targetHref = donation.caseId
                  ? `/case/${donation.caseId}`
                  : donation.campaignRefId
                    ? `/campaigns/${donation.campaignRefId}`
                    : null;

                const title =
                  donation.caseName ??
                  (donation.campaignRefId
                    ? t('myDonations.campaignDonation', 'Campaign donation')
                    : t('myDonations.donation', 'Donation'));

                const status = statusLabel(donation.status, t);

                const card = (
                  <div className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="relative shrink-0">
                        {donation.caseImage ? (
                          <img
                            src={donation.caseImage}
                            alt={title}
                            className="w-14 h-14 rounded-xl object-cover"
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-xl bg-muted flex items-center justify-center">
                            <PawPrint className="w-6 h-6 text-muted-foreground" />
                          </div>
                        )}

                        <div
                          className={cn(
                            'absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-card',
                            statusDotClass(donation.status),
                          )}
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="font-semibold text-sm text-foreground truncate">{title}</p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <Badge
                                variant="secondary"
                                className={cn(
                                  'text-[10px] px-1.5 py-0.5 h-5 font-medium border',
                                  statusBadgeClass(donation.status),
                                )}
                              >
                                {status}
                              </Badge>
                              <span className="text-[10px] text-muted-foreground">{formatDate(donation.createdAt)}</span>
                            </div>
                            {donation.receiptId ? (
                              <p className="mt-1 text-[11px] text-muted-foreground">
                                {t('donationHistory.receipt', 'Receipt')}: <span className="font-mono">{donation.receiptId}</span>
                              </p>
                            ) : null}
                            {donation.receiptUrl ? (
                              <button
                                type="button"
                                className="mt-1 inline-flex items-center gap-1 text-[11px] text-primary hover:underline"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  if (!donation.receiptUrl) return;
                                  window.open(donation.receiptUrl, '_blank', 'noopener,noreferrer');
                                }}
                              >
                                <ExternalLink className="w-3 h-3" />
                                {t('donations.openReceipt', 'Open receipt')}
                              </button>
                            ) : null}
                          </div>

                          <div className="text-right shrink-0">
                            <p className="text-base font-bold text-foreground leading-none">
                              {formatMoney(donation.amount, donation.currency)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );

                if (!targetHref) {
                  return (
                    <div
                      key={donation._id}
                      className="bg-surface-elevated rounded-2xl border border-border/60 shadow-xs"
                    >
                      {card}
                    </div>
                  );
                }

                return (
                  <div
                    key={donation._id}
                    role="link"
                    tabIndex={0}
                    onClick={() => navigate(targetHref)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        navigate(targetHref);
                      }
                    }}
                    className="bg-surface-elevated rounded-2xl border border-border/60 shadow-xs hover:border-primary/30 active:bg-surface-sunken/90 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring-strong focus-visible:ring-offset-2 ring-offset-background"
                  >
                    {card}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                <Heart className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-1">
                {filter !== 'all'
                  ? t('myDonations.noFilteredDonations', 'No {{filter}} donations', { filter })
                  : t('myDonations.noDonations', 'No donations yet')}
              </h3>
              <p className="text-muted-foreground text-sm max-w-xs mx-auto mb-6">
                {filter !== 'all'
                  ? t('myDonations.tryDifferentFilter', 'Try a different filter or make a new donation')
                  : t('myDonations.donationsWillAppear', 'Your donations will appear here once you start helping animals in need')}
              </p>
              <Button asChild className="rounded-xl">
                <Link to="/">
                  <Heart className="w-4 h-4 mr-2" />
                  {t('myDonations.startHelping', 'Start helping')}
                </Link>
              </Button>
            </div>
          )}

          {donations.length > 0 && !isLoading ? (
            <div className="mt-6">
              <Button variant="outline" asChild className="w-full h-12 rounded-xl border-border hover:bg-muted">
                <Link to="/history">
                  <Clock className="w-4 h-4 mr-2" />
                  {t('myDonations.viewFullHistory', 'View full transaction history')}
                  <ExternalLink className="w-4 h-4 ml-auto" />
                </Link>
              </Button>
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
};

export default MyDonations;



