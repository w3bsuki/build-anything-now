import { Link } from 'react-router-dom';
import { ArrowLeft, CreditCard, Plus, Trash2, Building2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

// Mock data - will be replaced with Convex data
const mockPaymentMethods = [
  {
    id: '1',
    type: 'card' as const,
    name: 'Visa ending in 4242',
    lastFour: '4242',
    expiryMonth: 12,
    expiryYear: 2027,
    isDefault: true,
  },
  {
    id: '2',
    type: 'card' as const,
    name: 'Mastercard ending in 8888',
    lastFour: '8888',
    expiryMonth: 6,
    expiryYear: 2026,
    isDefault: false,
  },
];

const PaymentMethods = () => {
  const { t } = useTranslation();
  // TODO: Replace with useQuery(api.paymentMethods.getMyPaymentMethods)
  const paymentMethods = mockPaymentMethods;

  const handleAddCard = () => {
    // TODO: Implement add card flow (Stripe, etc.)
    console.log('Add card');
  };

  const handleRemove = (id: string) => {
    // TODO: Implement with useMutation(api.paymentMethods.remove)
    console.log('Remove', id);
  };

  const handleSetDefault = (id: string) => {
    // TODO: Implement with useMutation(api.paymentMethods.setDefault)
    console.log('Set default', id);
  };

  return (
    <div className="min-h-screen pb-20 md:pb-8 md:pt-16">
      {/* Header */}
      <div className="sticky top-0 md:top-14 z-40 bg-card/95 backdrop-blur-md border-b border-border">
        <div className="flex items-center gap-3 px-4 py-3">
          <Link
            to="/account"
            className="w-9 h-9 flex items-center justify-center rounded-full bg-muted hover:bg-muted/80 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </Link>
          <div className="flex-1">
            <h1 className="text-lg font-semibold text-foreground">{t('paymentMethods.title')}</h1>
            <p className="text-xs text-muted-foreground">{t('paymentMethods.subtitle')}</p>
          </div>
        </div>
      </div>

      {/* Payment Methods List */}
      <section className="py-4">
        <div className="container mx-auto px-4">
          <div className="space-y-3">
            {paymentMethods.map((method) => (
              <div
                key={method.id}
                className={cn(
                  "bg-card rounded-xl border p-4 flex items-center gap-4",
                  method.isDefault ? "border-primary" : "border-border"
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
                  <p className="text-xs text-muted-foreground">
                    {t('paymentMethods.expires')} {method.expiryMonth?.toString().padStart(2, '0')}/{method.expiryYear}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {!method.isDefault && (
                    <button
                      onClick={() => handleSetDefault(method.id)}
                      className="p-2 rounded-lg hover:bg-muted transition-colors text-xs text-muted-foreground hover:text-foreground"
                    >
                      {t('paymentMethods.setDefault')}
                    </button>
                  )}
                  <button
                    onClick={() => handleRemove(method.id)}
                    className="p-2 rounded-lg hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Add New Card Button */}
          <button
            onClick={handleAddCard}
            className="w-full mt-4 bg-card rounded-xl border border-dashed border-border p-4 flex items-center justify-center gap-3 hover:bg-muted/50 transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Plus className="w-5 h-5 text-primary" />
            </div>
            <span className="font-medium text-foreground">{t('paymentMethods.addNewCard')}</span>
          </button>
        </div>
      </section>

      {/* Other Payment Options */}
      <section className="py-4">
        <div className="container mx-auto px-4">
          <h2 className="text-sm font-semibold text-foreground mb-3">{t('paymentMethods.otherOptions')}</h2>
          
          <div className="space-y-3">
            <div className="bg-card rounded-xl border border-border p-4 flex items-center gap-4 opacity-60">
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

      {/* Security Note */}
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
