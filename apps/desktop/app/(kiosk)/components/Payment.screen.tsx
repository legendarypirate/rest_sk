'use client';

import { useState } from 'react';
import { CreditCard, QrCode } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@packages/ui/components/button';
import { MInput } from '@packages/ui/main/MFields';
import { cn } from '@packages/ui/lib/utils';

import { validateEbarimtOptions } from '@/lib/ebarimt/preview';
import type { ReceiptType } from '@/types';

import { money } from '../lib/labels';
import { KioskCheckout } from './Kiosk.checkout';

type PayMethod = 'qpay' | 'card';

type PaymentScreenProps = {
  total: number;
  orderNo: number;
  receiptType: ReceiptType;
  tin: string;
  submitting?: boolean;
  backHref: string;
  onReceiptTypeChange: (type: ReceiptType) => void;
  onTinChange: (tin: string) => void;
  onConfirm: () => Promise<void> | void;
};

const TYPE_OPTIONS: { value: ReceiptType; label: string }[] = [
  { value: 'individual', label: 'Хувь хүн' },
  { value: 'company', label: 'Байгууллага' },
];

export function PaymentScreen({
  total,
  orderNo,
  receiptType,
  tin,
  submitting = false,
  backHref,
  onReceiptTypeChange,
  onTinChange,
  onConfirm,
}: PaymentScreenProps) {
  const [method, setMethod] = useState<PayMethod | null>(null);
  const [error, setError] = useState<string | null>(null);
  const qpayValue = `qpay://khongor/pay?order=${orderNo}&amount=${total}`;

  async function checkPayment() {
    const validationError = validateEbarimtOptions({
      receiptType,
      consumerTin: receiptType === 'company' ? tin.trim() : undefined,
    });
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    await onConfirm();
  }

  return (
    <KioskCheckout
      step={2}
      title="Төлбөр төлөх"
      hint="Баримтын төрөл болон төлбөрийн хэрэгслээ сонгоно уу."
      backHref={backHref}
      backLabel="Цэс рүү"
    >
      <div className="flex flex-col gap-6 pb-4">
        <div className="rounded-[28px] bg-[#102A43] px-8 py-7 text-white">
          <p className="text-sm tracking-[0.2em] text-white/55 uppercase">Нийт төлөх</p>
          <p className="mt-2 text-6xl font-semibold tracking-tight tabular-nums">{money(total)}</p>
        </div>

        <div>
          <p className="mb-3 text-sm font-medium tracking-[0.16em] text-slate-400 uppercase">
            Баримт хэнд олгох вэ?
          </p>
          <div className="grid grid-cols-2 gap-4">
            {TYPE_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                className={cn(
                  'h-20 rounded-2xl text-2xl font-semibold transition',
                  receiptType === option.value
                    ? 'bg-[#102A43] text-white'
                    : 'bg-white text-[#102A43] ring-1 ring-slate-200',
                )}
                onClick={() => {
                  onReceiptTypeChange(option.value);
                  setError(null);
                }}
              >
                {option.label}
              </button>
            ))}
          </div>
          {receiptType === 'company' ? (
            <MInput
              value={tin}
              onChange={(event) => onTinChange(event.target.value.replace(/\D/g, '').slice(0, 10))}
              inputMode="numeric"
              placeholder="Байгууллагын ТТД"
              className="mt-4 h-16 bg-white text-xl"
            />
          ) : null}
        </div>

        <div>
          <p className="mb-3 text-sm font-medium tracking-[0.16em] text-slate-400 uppercase">
            Төлбөрийн хэрэгсэл
          </p>
          <div className="grid grid-cols-2 gap-4">
            <MethodButton
              active={method === 'qpay'}
              icon={<QrCode className="size-10" />}
              label="QPAY"
              onClick={() => setMethod('qpay')}
            />
            <MethodButton
              active={method === 'card'}
              icon={<CreditCard className="size-10" />}
              label="Карт"
              onClick={() => setMethod('card')}
            />
          </div>
        </div>

        {method === 'qpay' ? (
          <div className="flex flex-col items-center rounded-[28px] bg-white px-8 py-8 ring-1 ring-slate-200">
            <p className="text-2xl font-semibold">QPAY QR</p>
            <p className="mt-2 text-lg text-slate-500">Утсаараа уншуулаад төлбөрөө шалгана уу.</p>
            <div className="mt-6 rounded-3xl bg-white p-4 ring-1 ring-slate-200">
              <QRCodeSVG value={qpayValue} size={280} level="M" includeMargin />
            </div>
            <Button
              type="button"
              className="mt-8 h-20 w-full bg-[#102A43] text-2xl font-semibold hover:bg-[#102A43]/90"
              disabled={submitting}
              onClick={() => void checkPayment()}
            >
              {submitting ? 'Шалгаж байна…' : 'Төлбөр шалгах'}
            </Button>
          </div>
        ) : null}

        {method === 'card' ? (
          <div className="flex flex-col items-center rounded-[28px] bg-white px-8 py-10 text-center ring-1 ring-slate-200">
            <span className="grid size-24 place-items-center rounded-3xl bg-[#102A43]/10 text-[#102A43]">
              <CreditCard className="size-12" />
            </span>
            <p className="mt-6 text-3xl font-semibold">Картаа уншуулна уу</p>
            <p className="mt-2 text-lg text-slate-500">Терминал дээр төлсний дараа шалгана.</p>
            <Button
              type="button"
              className="mt-8 h-20 w-full bg-[#102A43] text-2xl font-semibold hover:bg-[#102A43]/90"
              disabled={submitting}
              onClick={() => void checkPayment()}
            >
              {submitting ? 'Шалгаж байна…' : 'Төлбөр шалгах'}
            </Button>
          </div>
        ) : null}

        {error ? (
          <p className="rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-lg text-red-700">
            {error}
          </p>
        ) : null}
      </div>
    </KioskCheckout>
  );
}

function MethodButton({
  active,
  icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex h-36 flex-col items-center justify-center gap-3 rounded-[28px] text-2xl font-semibold transition',
        active
          ? 'bg-[#102A43] text-white'
          : 'bg-white text-[#102A43] ring-1 ring-slate-200',
      )}
    >
      {icon}
      {label}
    </button>
  );
}
