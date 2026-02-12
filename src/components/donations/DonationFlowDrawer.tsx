import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation } from 'convex/react';
import { ArrowLeft, CheckCircle2, CreditCard, Loader2, Plus, Share2, X } from 'lucide-react';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { getCaseShareUrl } from '@/lib/shareUrls';
import { toast } from '@/components/ui/use-toast';
import { api } from '../../../convex/_generated/api';
import type { Id } from '../../../convex/_generated/dataModel';

type DonationStep = 'amount' | 'method' | 'confirm' | 'processing' | 'success';

type PaymentMethod = {
  id: string;
  label: string;
  subtitle: string;
  isDefault?: boolean;
};

const DEMO_METHODS: PaymentMethod[] = [
  { id: 'pm_visa_4242', label: 'Visa •••• 4242', subtitle: 'Exp 12/27', isDefault: true },
  { id: 'pm_mc_8888', label: 'Mastercard •••• 8888', subtitle: 'Exp 06/26' },
  { id: 'pm_new', label: 'Add new card', subtitle: 'Enter card details' },
];

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

function makeReceiptId() {
  const token = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `PT-${token}`;
}

export function DonationFlowDrawer({
  open,
  onOpenChange,
  caseId,
  caseTitle,
  caseCoverImage,
  currency,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  caseId: string;
  caseTitle: string;
  caseCoverImage?: string | null;
  currency: string;
}) {
  const { t, i18n } = useTranslation();

  const presets = useMemo(() => [10, 25, 50, 100], []);

  const [step, setStep] = useState<DonationStep>('amount');
  const [amount, setAmount] = useState<number>(presets[1]);
  const [customAmount, setCustomAmount] = useState('');
  const [selectedMethodId, setSelectedMethodId] = useState<string>(
    DEMO_METHODS.find((m) => m.isDefault)?.id ?? DEMO_METHODS[0].id
  );
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [cardName, setCardName] = useState('');
  const [receiptId, setReceiptId] = useState<string | null>(null);
  const hasStripePublishableKey = Boolean(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

  const createCheckoutSession = useMutation(api.donations.createCheckoutSession);
  const confirmPreviewDonation = useMutation(api.donations.confirmPreviewDonation);

  const selectedMethod = useMemo(
    () => DEMO_METHODS.find((m) => m.id === selectedMethodId) ?? DEMO_METHODS[0],
    [selectedMethodId]
  );

  const handleDrawerOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setStep('amount');
      setAmount(presets[1]);
      setCustomAmount('');
      setSelectedMethodId(DEMO_METHODS.find((m) => m.isDefault)?.id ?? DEMO_METHODS[0].id);
      setCardNumber('');
      setCardExpiry('');
      setCardCvc('');
      setCardName('');
      setReceiptId(null);
    }
    onOpenChange(nextOpen);
  };

  const effectiveAmount = useMemo(() => {
    const parsed = Number(customAmount.replace(/[^\d.]/g, ''));
    if (customAmount.trim().length > 0 && Number.isFinite(parsed)) {
      return parsed;
    }
    return amount;
  }, [amount, customAmount]);

  const canContinueAmount = effectiveAmount > 0;

  const validateNewCard = () => {
    const digits = cardNumber.replace(/\s+/g, '');
    if (digits.length < 12) return false;
    if (!/^\d{2}\/\d{2}$/.test(cardExpiry.trim())) return false;
    if (cardCvc.trim().length < 3) return false;
    if (cardName.trim().length < 2) return false;
    return true;
  };

  const canContinueMethod = selectedMethodId !== 'pm_new' || validateNewCard();

  const goBack = () => {
    setStep((s) => {
      if (s === 'method') return 'amount';
      if (s === 'confirm') return 'method';
      return s;
    });
  };

  const handleShare = async () => {
    const shareUrl = getCaseShareUrl({ caseId, locale: i18n.language }) ?? `${window.location.origin}/case/${caseId}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: caseTitle,
          text: t('donationFlow.shareText', 'Help this animal in need on Pawtreon.'),
          url: shareUrl,
        });
      } catch {
        // User cancelled
      }
      return;
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      toast({ title: t('common.copied', 'Copied'), description: t('common.linkCopied', 'Link copied to clipboard') });
    } catch {
      toast({ title: t('common.error', 'Error'), description: t('common.unknownError', 'Something went wrong'), variant: 'destructive' });
    }
  };

  const startProcessing = async () => {
    setStep('processing');
    const localReceipt = makeReceiptId();
    setReceiptId(localReceipt);

    try {
      const payment = await createCheckoutSession({
        caseId: caseId as Id<'cases'>,
        amount: effectiveAmount,
        currency,
        anonymous: false,
        successUrl: `${window.location.origin}/case/${caseId}?donation=success`,
        cancelUrl: `${window.location.origin}/case/${caseId}?donation=cancelled`,
      });

      if (payment.mode === 'preview') {
        await confirmPreviewDonation({ donationId: payment.donationId });
        setStep('success');
        return;
      }

      if (!payment.checkoutUrl) {
        throw new Error('Missing Stripe checkout URL');
      }

      window.location.assign(payment.checkoutUrl);
    } catch (error) {
      console.error(error);
      toast({
        title: t('common.error', 'Error'),
        description: t('donationFlow.createIntentFailed', 'Failed to start donation. Please try again.'),
        variant: 'destructive',
      });
      setStep('confirm');
    }
  };

  return (
    <Drawer open={open} onOpenChange={handleDrawerOpenChange}>
      <DrawerContent className="max-h-[88vh]">
        <div className="mx-auto w-full max-w-md">
          <DrawerHeader className="border-b border-border/50 pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {step !== 'amount' && step !== 'processing' && step !== 'success' && (
                  <button
                    onClick={goBack}
                    className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
                    aria-label={t('common.back', 'Back')}
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                )}
                <DrawerTitle className="text-base font-semibold">
                  {t('donationFlow.title', 'Donate')}
                </DrawerTitle>
              </div>

              <DrawerClose asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <X className="h-4 w-4" />
                </Button>
              </DrawerClose>
            </div>

            <p className="text-xs text-muted-foreground line-clamp-1 text-left">
              {caseTitle}
            </p>
          </DrawerHeader>

          {/* Body */}
          <div className="p-4 space-y-4">
            {/* Step: Amount */}
            {step === 'amount' && (
              <div className="space-y-4">
                {caseCoverImage ? (
                  <div className="flex items-center gap-3 rounded-xl border border-border/50 p-3">
                    <img
                      src={caseCoverImage}
                      alt=""
                      className="h-12 w-12 rounded-lg object-cover bg-muted"
                      loading="lazy"
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground line-clamp-1">
                        {t('donationFlow.helping', 'Helping')}
                      </p>
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {caseTitle}
                      </p>
                    </div>
                  </div>
                ) : null}

                <div>
                  <p className="text-sm font-semibold text-foreground mb-2">
                    {t('donationFlow.chooseAmount', 'Choose an amount')}
                  </p>
                  <div className="grid grid-cols-4 gap-2">
                    {presets.map((p) => (
                      <button
                        key={p}
                        onClick={() => {
                          setAmount(p);
                          setCustomAmount('');
                        }}
                        className={cn(
                          'h-10 rounded-xl border text-sm font-semibold transition-colors',
                          customAmount.trim().length === 0 && amount === p
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border bg-card hover:bg-surface-sunken/70 text-foreground'
                        )}
                      >
                        {formatMoney(p, currency)}
                      </button>
                    ))}
                  </div>

                  <div className="mt-3">
                    <Input
                      inputMode="decimal"
                      value={customAmount}
                      onChange={(e) => setCustomAmount(e.target.value)}
                      placeholder={t('donationFlow.customAmount', 'Custom amount')}
                      className="h-10"
                    />
                    <p className="mt-1 text-xs text-muted-foreground">
                      {hasStripePublishableKey
                        ? t('donationFlow.checkoutRedirectHint', 'You will be redirected to secure Stripe checkout.')
                        : t('donationFlow.previewNote', 'Preview checkout — payments are not processed yet.')}
                    </p>
                  </div>
                </div>

                <Button
                  className="w-full h-11 rounded-xl font-semibold"
                  onClick={() => setStep('method')}
                  disabled={!canContinueAmount}
                >
                  {t('actions.continue', 'Continue')}
                </Button>
              </div>
            )}

            {/* Step: Payment method */}
            {step === 'method' && (
              <div className="space-y-3">
                <p className="text-sm font-semibold text-foreground">
                  {t('donationFlow.chooseMethod', 'Payment method')}
                </p>

                <div className="space-y-2">
                  {DEMO_METHODS.map((method) => (
                    <button
                      key={method.id}
                      onClick={() => setSelectedMethodId(method.id)}
                      className={cn(
                        'w-full rounded-xl border p-3 flex items-center gap-3 text-left transition-colors',
                        selectedMethodId === method.id
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:bg-muted/40'
                      )}
                    >
                      <div className={cn(
                        'w-10 h-10 rounded-xl flex items-center justify-center',
                        method.id === 'pm_new' ? 'bg-muted' : 'bg-primary/10'
                      )}>
                        {method.id === 'pm_new' ? (
                          <Plus className="w-5 h-5 text-muted-foreground" />
                        ) : (
                          <CreditCard className="w-5 h-5 text-primary" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-foreground truncate">{method.label}</p>
                          {method.isDefault && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-semibold">
                              {t('paymentMethods.default', 'Default')}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{method.subtitle}</p>
                      </div>
                      <div className={cn(
                        'h-4 w-4 rounded-full border flex items-center justify-center',
                        selectedMethodId === method.id ? 'border-primary' : 'border-border'
                      )}>
                        {selectedMethodId === method.id ? (
                          <div className="h-2 w-2 rounded-full bg-primary" />
                        ) : null}
                      </div>
                    </button>
                  ))}
                </div>

                {selectedMethodId === 'pm_new' && (
                  <div className="rounded-xl border border-border/50 p-3 space-y-2">
                    <Input
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      placeholder={t('donationFlow.cardNumber', 'Card number')}
                      inputMode="numeric"
                      className="h-10"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        placeholder={t('donationFlow.expiry', 'MM/YY')}
                        inputMode="numeric"
                        className="h-10"
                      />
                      <Input
                        value={cardCvc}
                        onChange={(e) => setCardCvc(e.target.value)}
                        placeholder={t('donationFlow.cvc', 'CVC')}
                        inputMode="numeric"
                        className="h-10"
                      />
                    </div>
                    <Input
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      placeholder={t('donationFlow.nameOnCard', 'Name on card')}
                      className="h-10"
                    />
                    {!validateNewCard() && (
                      <p className="text-xs text-muted-foreground">
                        {t('donationFlow.cardHint', 'Enter a valid demo card to continue.')}
                      </p>
                    )}
                  </div>
                )}

                <Button
                  className="w-full h-11 rounded-xl font-semibold"
                  onClick={() => setStep('confirm')}
                  disabled={!canContinueMethod}
                >
                  {t('actions.continue', 'Continue')}
                </Button>
              </div>
            )}

            {/* Step: Confirm */}
            {step === 'confirm' && (
              <div className="space-y-4">
                <div className="rounded-xl border border-border/50 p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">{t('donationFlow.amount', 'Amount')}</p>
                    <p className="text-sm font-semibold text-foreground">{formatMoney(effectiveAmount, currency)}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">{t('donationFlow.method', 'Method')}</p>
                    <p className="text-sm font-semibold text-foreground">{selectedMethod.label}</p>
                  </div>
                </div>

                <Button className="w-full h-11 rounded-xl font-semibold" onClick={startProcessing}>
                  {t('actions.donateNow', 'Donate Now')}
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  {hasStripePublishableKey
                    ? t('donationFlow.disclaimerLive', 'Secure checkout is processed by Stripe.')
                    : t('donationFlow.disclaimer', 'Payments are in preview for the pitch — real checkout ships in MVP.')}
                </p>
              </div>
            )}

            {/* Step: Processing */}
            {step === 'processing' && (
              <div className="py-10 flex flex-col items-center justify-center text-center">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                  <Loader2 className="w-6 h-6 text-primary animate-spin" />
                </div>
                <p className="font-semibold text-foreground">{t('donationFlow.processing', 'Processing donation…')}</p>
                <p className="text-sm text-muted-foreground mt-1">{t('donationFlow.holdOn', 'This takes a moment.')}</p>
              </div>
            )}

            {/* Step: Success */}
            {step === 'success' && (
              <div className="space-y-4">
                <div className="pt-2 flex flex-col items-center text-center">
                  <div className="w-14 h-14 rounded-full bg-success/10 flex items-center justify-center mb-3">
                    <CheckCircle2 className="w-7 h-7 text-success" />
                  </div>
                  <p className="text-lg font-bold text-foreground">{t('donationFlow.thankYou', 'Thank you!')}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {t('donationFlow.successBody', 'Your support helps animals get urgent care.')}
                </p>
              </div>

                <div className="rounded-xl border border-border/50 p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">{t('donationFlow.amount', 'Amount')}</p>
                    <p className="text-sm font-semibold text-foreground">{formatMoney(effectiveAmount, currency)}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">{t('donationFlow.receipt', 'Receipt')}</p>
                    <p className="text-sm font-mono text-foreground">{receiptId ?? '—'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" className="h-11 rounded-xl" onClick={handleShare}>
                    <Share2 className="w-4 h-4 mr-2" />
                    {t('actions.share', 'Share')}
                  </Button>
                  <DrawerClose asChild>
                    <Button className="h-11 rounded-xl font-semibold">
                      {t('common.close', 'Close')}
                    </Button>
                  </DrawerClose>
                </div>
              </div>
            )}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
