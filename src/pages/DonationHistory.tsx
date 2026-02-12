import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ExternalLink, History } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import { useQuery } from 'convex/react';
import { FilterPills } from '@/components/FilterPills';
import { cn } from '@/lib/utils';
import { api } from '../../convex/_generated/api';

type DonationStatus = 'pending' | 'completed' | 'failed' | 'refunded';

type DonationRow = {
  _id: string;
  caseId?: string | null;
  campaignRefId?: string | null;
  caseName?: string | null;
  amount: number;
  currency: string;
  status: DonationStatus;
  receiptId?: string | null;
  receiptUrl?: string | null;
  transactionId?: string | null;
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

function formatDate(timestamp: number) {
  return new Date(timestamp).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatTime(timestamp: number) {
  return new Date(timestamp).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
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

function statusChipClass(status: DonationStatus) {
  switch (status) {
    case 'completed':
      return 'bg-success/10 text-success';
    case 'pending':
      return 'bg-warning/10 text-warning';
    case 'failed':
      return 'bg-destructive/10 text-destructive';
    case 'refunded':
      return 'bg-muted text-muted-foreground';
    default:
      return 'bg-muted text-muted-foreground';
  }
}

function groupByMonth(donations: DonationRow[]) {
  const groups: Record<string, DonationRow[]> = {};

  for (const donation of donations) {
    const date = new Date(donation.createdAt);
    const key = `${date.getFullYear()}-${date.getMonth()}`;

    if (!groups[key]) groups[key] = [];
    groups[key].push(donation);
  }

  return Object.entries(groups)
    .map(([key, items]) => {
      const label = new Date(items[0].createdAt).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
      });

      const currencies = new Set(items.map((d) => d.currency).filter(Boolean));
      const currency = currencies.size === 1 ? Array.from(currencies)[0] : null;
      const total = items.reduce((sum, d) => sum + d.amount, 0);

      return {
        key,
        label,
        items,
        total,
        currency,
      };
    })
    .sort((a, b) => {
      // key is YYYY-M; safe lex sort if month is 0-based? Keep numeric sort.
      const [ay, am] = a.key.split('-').map(Number);
      const [by, bm] = b.key.split('-').map(Number);
      if (ay !== by) return by - ay;
      return bm - am;
    });
}

const DonationHistory = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<'all' | DonationStatus>('all');

  const donationsRaw = useQuery(api.donations.getMyDonations);
  const isLoading = donationsRaw === undefined;
  const allDonations = (donationsRaw ?? []) as DonationRow[];

  const statusFilters = [
    { id: 'all', label: t('status.all', 'All') },
    { id: 'completed', label: t('status.completed', 'Completed') },
    { id: 'pending', label: t('donationHistory.pending', 'Pending') },
    { id: 'failed', label: t('status.failed', 'Failed') },
    { id: 'refunded', label: t('status.refunded', 'Refunded') },
  ];

  const filteredDonations = allDonations.filter((donation) =>
    statusFilter === 'all' ? true : donation.status === statusFilter,
  );

  const groupedDonations = groupByMonth(filteredDonations);

  return (
    <div className="min-h-screen pb-20 md:pb-8 md:pt-16">
      <div className="sticky top-0 md:top-14 z-40 bg-nav-surface/95 backdrop-blur-md border-b border-nav-border/70">
        <div className="flex items-center gap-3 px-4 py-3">
          <Link
            to="/account"
            className="w-9 h-9 flex items-center justify-center rounded-full bg-surface-sunken hover:bg-surface-sunken/90 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </Link>
          <div className="flex-1">
            <h1 className="text-lg font-semibold text-foreground">{t('donationHistory.title')}</h1>
            <p className="text-xs text-muted-foreground">{t('donationHistory.subtitle')}</p>
          </div>
        </div>

        <div className="px-4 pb-3">
          <FilterPills
            options={statusFilters}
            selected={statusFilter}
            onSelect={(value) => setStatusFilter(value as typeof statusFilter)}
          />
        </div>
      </div>

      <section className="py-4">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="text-sm text-muted-foreground">{t('common.loading', 'Loading…')}</div>
          ) : groupedDonations.length > 0 ? (
            <div className="space-y-6">
              {groupedDonations.map((group) => (
                <div key={group.key}>
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-sm font-semibold text-foreground">{group.label}</h2>
                    <span className="text-xs text-muted-foreground">
                      {group.currency ? formatMoney(group.total, group.currency) : '—'}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {group.items.map((donation) => {
                      const targetHref = donation.caseId
                        ? `/case/${donation.caseId}`
                        : donation.campaignRefId
                          ? `/campaigns/${donation.campaignRefId}`
                          : null;
                      const hasReceiptUrl = donation.status === 'completed' && Boolean(donation.receiptUrl);
                      const showReceiptReference =
                        donation.status === 'completed' && !donation.receiptUrl && Boolean(donation.receiptId);

                      const title =
                        donation.caseName ??
                        (donation.campaignRefId
                          ? t('myDonations.campaignDonation', 'Campaign donation')
                          : t('myDonations.donation', 'Donation'));

                      const content = (
                        <div className="bg-surface-elevated rounded-2xl border border-border/60 shadow-xs p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-foreground truncate">{title}</p>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {formatDate(donation.createdAt)} {t('common.at', 'at')} {formatTime(donation.createdAt)}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-foreground">
                                {formatMoney(donation.amount, donation.currency)}
                              </p>
                              <span
                                className={cn(
                                  'text-xs px-2 py-0.5 rounded-full',
                                  statusChipClass(donation.status),
                                )}
                              >
                                {statusLabel(donation.status, t)}
                              </span>
                            </div>
                          </div>

                          {(donation.transactionId || showReceiptReference || hasReceiptUrl) ? (
                            <div className="flex flex-col gap-1 text-xs text-muted-foreground pt-2 border-t border-border">
                              {showReceiptReference ? (
                                <div>
                                  <span>{t('donations.receiptId', 'Receipt ID')}:</span>{' '}
                                  <code className="bg-muted px-1.5 py-0.5 rounded">{donation.receiptId}</code>
                                </div>
                              ) : null}
                              {donation.transactionId ? (
                                <div>
                                  <span>{t('donationHistory.transactionId', 'Transaction ID')}:</span>{' '}
                                  <code className="bg-muted px-1.5 py-0.5 rounded">{donation.transactionId}</code>
                                </div>
                              ) : null}
                              {hasReceiptUrl ? (
                                <div>
                                  <button
                                    type="button"
                                    className="inline-flex items-center gap-1 text-primary hover:underline"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      if (!donation.receiptUrl) return;
                                      window.open(donation.receiptUrl, '_blank', 'noopener,noreferrer');
                                    }}
                                  >
                                    <ExternalLink className="w-3.5 h-3.5" />
                                    {t('donations.viewReceipt', 'View Receipt')}
                                  </button>
                                </div>
                              ) : null}
                            </div>
                          ) : null}
                        </div>
                      );

                      if (!targetHref) {
                        return <div key={donation._id}>{content}</div>;
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
                          className="cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring-strong focus-visible:ring-offset-2 ring-offset-background"
                        >
                          {content}
                        </div>
                      );
                    })}
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


