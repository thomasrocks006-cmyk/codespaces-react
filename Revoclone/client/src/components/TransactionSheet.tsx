import React, { useState } from 'react';
import type { Transaction } from '@/types/transaction';
import TransactionIcon from '@/components/TransactionIcon';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import MapWidget from '@/components/MapWidget';

// Static exchange rates from requirements
const RATES_AUD_TO: Record<string, number> = {
  EUR: 0.55,
  GBP: 0.48,
};

const currencySymbol = (cur?: string) =>
  cur === 'EUR' ? '€' : cur === 'USD' ? '$' : cur === 'GBP' ? '£' : '$';

const formatSigned = (value: number, cur?: string) => {
  const symbol = currencySymbol(cur);
  const sign = value < 0 ? '-' : '+';
  return `${sign}${symbol}${Math.abs(value).toFixed(2)}`;
};

const formatAbs = (value: number, cur?: string) => {
  const symbol = currencySymbol(cur);
  return `${symbol}${Math.abs(value).toFixed(2)}`;
};

export default function TransactionSheet({ tx, onClose }: { tx: Transaction; onClose: () => void }) {
  if (!tx) return null;

  const [feeInfoOpen, setFeeInfoOpen] = useState(false);

  const amount = parseFloat(tx.amount || '0');
  const amountText = formatSigned(amount, tx.currency);

  // Exchange details (visible when we know original currency or can infer a supported rate)
  const hasOriginal = !!tx.originalCurrency || !!tx.originalAmount;
  const origCur = tx.originalCurrency;
  const origAmt = tx.originalAmount ? parseFloat(tx.originalAmount) : undefined;
  const audAmtAbs = Math.abs(amount);
  const rate = origCur && RATES_AUD_TO[origCur];
  const merchantCharge = (() => {
    if (origAmt !== undefined && origCur) return formatAbs(origAmt, origCur);
    if (origCur && rate) return formatAbs(audAmtAbs * rate, origCur);
    return null;
  })();
  const exchangeRateText = rate ? `$1 = ${currencySymbol(origCur)}${rate.toFixed(4)}` : null;
  const exchangedAmountText = formatAbs(audAmtAbs, 'AUD');
  // Weekend fee: 1% of exchanged AUD amount on Saturdays(6) and Sundays(0)
  const day = new Date(tx.date).getDay();
  const isWeekend = day === 0 || day === 6;
  const feeAmountAud = isWeekend ? audAmtAbs * 0.01 : 0;
  const feesNode = feeAmountAud > 0
    ? (
        <span className="inline-flex items-center text-[#60A5FA] font-medium">
          <button type="button" className="inline-flex items-center hover:underline" onClick={() => setFeeInfoOpen(true)} aria-label="Fee info">
            <svg width="16" height="16" viewBox="0 0 24 24" className="mr-1" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4" />
              <path d="M12 8h.01" />
            </svg>
            {formatAbs(feeAmountAud, 'AUD')}
          </button>
        </span>
      )
    : 'No fee';
  const yourTotalText = formatAbs(audAmtAbs + feeAmountAud, 'AUD');

  const time24 = (iso: string) => new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });
  const dateLong = (iso: string) => new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });

  const displayStatus = (status?: string) => {
    if (!status) return 'Completed';
    const map: Record<string, string> = {
      completed: 'Completed',
      failed: 'Failed',
      reverted: 'Reverted',
      insufficient_balance: 'Insufficient balance',
      card_verification: 'Card verification',
      delayed_transaction: 'Delayed transaction',
    };
    return map[status] ?? status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <>
    <div className="fixed inset-0 z-50" aria-modal="true" role="dialog">
      <div className="absolute inset-0 bg-black" onClick={onClose} />
      <div className="absolute inset-0 flex items-end">
        <div className="w-full max-w-[430px] mx-auto bg-[#1C1C1E] rounded-t-3xl text-white h-[95vh] overflow-y-auto" onClick={(e) => e.stopPropagation()} style={{ boxShadow: '0 -10px 40px rgba(0,0,0,1)' }}>
          <div className="pt-3 pb-2 sticky top-0 bg-[#1C1C1E] z-10">
            <div className="flex items-center justify-between px-2">
              <button onClick={onClose} className="w-8 h-8 grid place-items-center rounded-full text-white hover:bg-white/10" aria-label="Close">
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
              <div className="w-12 h-1.5 rounded-full bg-white/30" />
              <div className="w-8" />
            </div>
          </div>

          <div className="px-6 pt-2 pb-6 relative">
            <button onClick={onClose} className="hidden" aria-label="Close">
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>

            <div className="absolute right-6 top-4">
              <div className="w-12 h-12">
                <TransactionIcon transaction={tx} size="lg" />
              </div>
            </div>

            <div className="text-[34px] font-extrabold leading-none pr-20 mb-2 text-white" style={{ fontVariantNumeric: 'tabular-nums' }}>
              {amountText}
            </div>

            <div className="mb-1">
              <span className="text-[#60A5FA] text-[18px]">{tx.merchant}</span>
            </div>

            <div className="text-white/60 mb-4 text-[15px]">{dateLong(tx.date)}, {time24(tx.date)}</div>

            <button className="inline-flex items-center gap-3 rounded-full bg-white/10 px-5 h-12 hover:bg-white/15 transition-colors" aria-label="Split bill">
              <svg width="20" height="20" viewBox="0 0 24 24" className="text-white/80">
                <path d="M8 12h8M12 8v8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <span className="text-[16px] text-white">Split bill</span>
            </button>
          </div>

          <div className="px-4 mb-6">
            <MapWidget lat={tx.location?.lat} lon={tx.location?.lon} address={tx.location?.address} merchant={tx.merchant} />
          </div>

          <div className="px-4 space-y-4 pb-20">
            <Block>
              <Row label="Status" value={displayStatus(tx.status)} />
              <Row label="Card" value={<span className="text-[#60A5FA] text-[16px] font-medium hover:underline cursor-pointer">Mastercard ••4103</span>} valueClass="" />
              <Row label="Statement" value={<span className="text-[#60A5FA] text-[16px] font-medium hover:underline cursor-pointer">Download</span>} valueClass="" />
            </Block>

      {(merchantCharge || isWeekend) && (
              <Block>
                <Row label="Merchant's charge" value={merchantCharge} />
                {exchangeRateText && <Row label="Exchange rate" value={exchangeRateText} />}
                <Row label="Exchanged amount" value={exchangedAmountText} />
        <Row label="Fees" value={feesNode} />
                <Row label="Your total" value={yourTotalText} />
              </Block>
            )}

            <Block>
              <Row label="Exclude from analytics" customRight={<Toggle />} />
              <Row label="Category" value={<span className="text-[#60A5FA] text-[16px] font-medium hover:underline cursor-pointer">Restaurants</span>} valueClass="" />
              <Row label="Adjust for analytics" value={<span className="text-[#60A5FA] text-[16px] font-medium hover:underline cursor-pointer">$2.50</span>} valueClass="" />
            </Block>

            <Block>
              <Row label={`Spent at ${tx.merchant}`} value="$80.26" />
              <Row label="Number of transactions" value="9" />
              <Row label="See all" chevron />
            </Block>

            <Block>
              <Row label="Receipt" value={<span className="inline-flex items-center text-[#60A5FA] text-[16px] font-medium hover:underline cursor-pointer"><svg width="18" height="18" viewBox="0 0 24 24" className="mr-1 text-[#60A5FA]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="6" width="18" height="12" rx="2" /><circle cx="12" cy="12" r="3" /><path d="M7 6V4a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2" /></svg>Upload</span>} valueClass="" />
            </Block>

            <Block>
              <Row label="Note" value={<span className="inline-flex items-center text-[#60A5FA] text-[16px] font-medium hover:underline cursor-pointer"><svg width="18" height="18" viewBox="0 0 24 24" className="mr-1 text-[#60A5FA]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14" /><path d="M5 12h14" /></svg>Add note</span>} valueClass="" />
            </Block>

            <Block>
              <Row label="Get help" chevron />
            </Block>
          </div>
        </div>
      </div>
  </div>
  <Sheet open={feeInfoOpen} onOpenChange={setFeeInfoOpen}>
      <SheetContent side="bottom" className="bg-[#1C1C1E] text-white border-t border-white/10">
        <SheetHeader>
          <SheetTitle className="text-white">Weekend fee</SheetTitle>
          <SheetDescription className="text-white/70">
            A 1% fee applies to transactions made on weekends. This fee is calculated on the exchanged amount in AUD and added to your total.
          </SheetDescription>
        </SheetHeader>
        <div className="mt-4 flex items-center justify-between text-[16px]">
          <div className="text-white/70">Fee</div>
          <div className="text-[#60A5FA] font-medium">{formatAbs(feeAmountAud, 'AUD')}</div>
        </div>
      </SheetContent>
    </Sheet>
    </>
  );
}


function Block({ children }: { children: React.ReactNode }) {
  return <div className="rounded-2xl bg-[#2C2C2E] px-5 py-4 space-y-4">{children}</div>;
}

function Row({ label, value, valueClass, chevron, icon, customRight }: { label: string; value?: React.ReactNode; valueClass?: string; chevron?: boolean; icon?: 'card' | 'download' | 'fork' | 'bars' | 'camera' | 'plus'; customRight?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        {icon && <RowIcon kind={icon} />}
        <div className="text-white/70 text-[16px]">{label}</div>
      </div>
      {customRight ? (
        customRight
      ) : (
        <div className="flex items-center gap-2">
          {value && <div className={`text-white text-[16px] ${valueClass ?? ''}`}>{value}</div>}
          {chevron && (
            <svg width="18" height="18" viewBox="0 0 24 24" className="text-white/40">
              <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
            </svg>
          )}
        </div>
      )}
    </div>
  );
}

function RowIcon({ kind }: { kind: string }) {
  const paths: Record<string, React.ReactNode> = {
    card: <rect x="3" y="6" width="18" height="12" rx="2" />,
    download: (
      <>
        <path d="M12 3v10" />
        <path d="M8 9l4 4 4-4" />
        <path d="M5 21h14" />
      </>
    ),
    fork: (
      <>
        <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
        <path d="M7 2v20" />
        <path d="M21 15V2" />
        <path d="M15 5v4a2 2 0 0 0 2 2h4" />
      </>
    ),
    bars: (
      <>
        <rect x="3" y="6" width="18" height="3" rx="1" />
        <rect x="3" y="11" width="18" height="3" rx="1" />
        <rect x="3" y="16" width="18" height="3" rx="1" />
      </>
    ),
    camera: (
      <>
        <rect x="3" y="6" width="18" height="12" rx="2" />
        <circle cx="12" cy="12" r="3" />
        <path d="M7 6V4a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2" />
      </>
    ),
    plus: (
      <>
        <path d="M12 5v14" />
        <path d="M5 12h14" />
      </>
    ),
  };

  return (
    <svg width="20" height="20" viewBox="0 0 24 24" className="text-white/50" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      {paths[kind] ?? null}
    </svg>
  );
}

function Toggle() {
  return (
    <button type="button" className="relative inline-flex h-8 w-14 items-center rounded-full bg-[#3A3A3C] transition-colors" onClick={(e) => e.preventDefault()}>
      <span className="inline-block h-7 w-7 transform rounded-full bg-white translate-x-0.5 transition-transform will-change-transform shadow-sm" />
    </button>
  );
}
