import { Link } from 'react-router-dom';
import { ArrowLeft, CreditCard, Plus, Trash2, Building2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useMutation, useQuery } from 'convex/react';
import type { Id } from '../../convex/_generated/dataModel';
import { cn } from '@/lib/utils';
import { api } from '../../convex/_generated/api';
import { Button } from '@/components/ui/button';

const PaymentMethods = () => {
  const { t } = useTranslation();

  const methods = useQuery(api.paymentMethods.getMyPaymentMethods);
  const remove = useMutation(api.paymentMethods.remove);
  const setDefault = useMutation(api.paymentMethods.setDefault);

  const isLoading = methods === undefined;

  const handleRemove = async (id: Id<'paymentMethods'>) => {
    await remove({ id });
  };

  const handleSetDefault = async (id: Id<'paymentMethods'>) => {
    await setDefault({ id });
  };

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
            <h1 className="text-lg font-semibold text-foreground">{t('paymentMethods.title')}</h1>
            <p className="text-xs text-muted-foreground">{t('paymentMethods.subtitle')}</p>
          </div>
        </div>
      </div>

      <section className="py-4">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="text-sm text-muted-foreground">{t('common.loading', 'Loading…')}</div>
          ) : (methods?.length ?? 0) > 0 ? (
            <div className="space-y-3">
              {methods!.map((method) => (
                <div
                  key={method._id}
                  className={cn(
                    'bg-card rounded-xl border p-4 flex items-center gap-4',
                    method.isDefault ? 'border-primary' : 'border-border',
                  )}
                >
                  <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
                    <CreditCard className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-foreground">{method.name}</p>
                      {method.isDefault && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                          {t('paymentMethods.default')}
                        </span>
                      )}
                    </div>
                    {method.expiryMonth && method.expiryYear ? (
                      <p className="text-xs text-muted-foreground">
                        {t('paymentMethods.expires')} {String(method.expiryMonth).padStart(2, '0')}/{method.expiryYear}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex items-center gap-2">
                    {!method.isDefault && (
                      <Button
                        type="button"
                        variant="ghost"
                        className="h-9 px-2 text-xs"
                        onClick={() => void handleSetDefault(method._id)}
                      >
                        {t('paymentMethods.setDefault')}
                      </Button>
                    )}
                    <Button
                      type="button"
                      variant="ghost"
                      className="h-9 w-9 p-0 text-muted-foreground hover:text-destructive"
                      onClick={() => void handleRemove(method._id)}
                      aria-label={t('actions.remove', 'Remove')}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-border/60 bg-surface-elevated p-4 shadow-xs">
              <p className="text-sm font-semibold text-foreground">
                {t('paymentMethods.noMethods', 'No saved payment methods yet')}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {t(
                  'paymentMethods.noMethodsBody',
                  'For now, payment details are entered securely during Stripe checkout. Saved methods are coming later.',
                )}
              </p>
            </div>
          )}

          <button
            type="button"
            disabled
            aria-disabled="true"
            className="w-full mt-4 bg-card rounded-xl border border-dashed border-border p-4 flex items-center justify-center gap-3 opacity-70 cursor-not-allowed"
          >
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Plus className="w-5 h-5 text-primary" />
            </div>
            <span className="font-medium text-foreground">
              {t('paymentMethods.addNewCard', 'Add new card')} ({t('common.comingSoon', 'Coming soon')})
            </span>
          </button>
        </div>
      </section>

      <section className="py-4">
        <div className="container mx-auto px-4">
          <h2 className="text-sm font-semibold text-foreground mb-3">{t('paymentMethods.otherOptions')}</h2>

          <div className="space-y-3">
            <div className="bg-surface-elevated rounded-2xl border border-border/60 shadow-xs p-4 flex items-center gap-4 opacity-60">
              <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
                <Building2 className="w-6 h-6 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground">{t('paymentMethods.bankTransfer')}</p>
                <p className="text-xs text-muted-foreground">{t('common.comingSoon')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-4">
        <div className="container mx-auto px-4">
          <div className="bg-muted/50 rounded-xl p-4 text-center">
            <p className="text-xs text-muted-foreground">
              🔒 {t('paymentMethods.securityNote')}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PaymentMethods;
