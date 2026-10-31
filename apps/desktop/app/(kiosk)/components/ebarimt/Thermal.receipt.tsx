'use client';

import { QRCodeSVG } from 'qrcode.react';
import type { EbarimtPreview } from '@packages/types';
import type { ReceiptData } from '@/electron/types/config.types';

import {
  buildEbarimtReceiptLines,
  formatEbarimtDate,
  formatMoney,
  MERCHANT_ADDRESS,
  orderTypeLabel,
  padLine,
  receiptTypeLabel,
} from '@/lib/ebarimt/layout';

type ThermalEbarimtReceiptProps = {
  preview: EbarimtPreview;
  orderType?: ReceiptData['orderType'];
  className?: string;
  showSimulateBadge?: boolean;
};

function ReceiptHr({ double }: { double?: boolean }) {
  return (
    <div className="my-2 overflow-hidden text-center text-[10px] text-gray-500">
      {double ? '================================' : '--------------------------------'}
    </div>
  );
}

export function ThermalEbarimtReceipt({
  preview,
  orderType,
  className,
  showSimulateBadge = true,
}: ThermalEbarimtReceiptProps) {
  const textLines = buildEbarimtReceiptLines(preview, orderType);

  return (
    <div className={className}>
      <div className="mx-auto w-[80mm] max-w-full shadow-2xl">
        <div className="h-3 rounded-t-sm bg-linear-to-b from-gray-300 to-gray-100" />
        <div
          className="relative bg-[#fffef8] px-3 py-4 text-black"
          style={{
            fontFamily: '"Courier New", Courier, monospace',
            fontSize: '11px',
            lineHeight: '1.35',
            boxShadow: 'inset 0 0 20px rgba(0,0,0,0.03)',
          }}
        >
          {showSimulateBadge && preview.simulate ? (
            <div className="mb-2 border border-dashed border-amber-400 bg-amber-50 px-2 py-1 text-center text-[10px] text-amber-700">
              PREVIEW — хэвлэгдэх баримтын загвар
            </div>
          ) : null}

          <div className="text-center">
            <p className="text-[13px] font-bold tracking-wide">И-БАРИМТ</p>
            <p className="text-[10px] text-gray-600">e-barimt</p>
          </div>

          <ReceiptHr />

          <div className="text-center">
            <p className="font-bold">{preview.merchantName}</p>
            <p className="text-[10px] text-gray-700">{MERCHANT_ADDRESS}</p>
            <p className="text-[10px]">ТТД: {preview.merchantTin}</p>
          </div>

          <ReceiptHr />

          <ReceiptLine label="Баримтын төрөл" value={receiptTypeLabel(preview.receiptType)} />
          {preview.receiptType === 'company' && preview.consumerTin ? (
            <ReceiptLine label="Худалдан авагч" value={preview.consumerTin} />
          ) : null}
          <ReceiptLine label="Огноо" value={formatEbarimtDate(preview.date)} />
          <ReceiptLine label="ДДТД" value={preview.billId} mono />
          {orderType ? <ReceiptLine label="Захиалга" value={orderTypeLabel(orderType)} /> : null}

          <ReceiptHr />

          {preview.items.map((item, index) => (
            <div key={`${item.name}-${index}`} className="mb-2">
              <p className="font-bold">{item.name}</p>
              <p className="flex justify-between pl-2">
                <span>
                  {item.qty} x {formatMoney(item.unitPrice)}
                </span>
                <span>{formatMoney(item.total)}</span>
              </p>
              <p className="flex justify-between pl-2 text-[10px] text-gray-600">
                <span>НХАТ:</span>
                <span>{formatMoney(item.vat)}</span>
              </p>
            </div>
          ))}

          <ReceiptHr />

          <TotalLine label="Бүтээгдэхүүн:" value={formatMoney(preview.subtotal)} />
          <TotalLine label="НХАТ (10%):" value={formatMoney(preview.vat)} />
          <p className="my-1 flex justify-between text-[13px] font-bold">
            <span>НИЙТ ДҮН:</span>
            <span>{formatMoney(preview.total)}</span>
          </p>

          <ReceiptHr double />

          <div className="flex flex-col items-center py-2">
            <QRCodeSVG value={preview.qrData} size={120} level="M" includeMargin />
            <p className="mt-2 text-[10px] text-gray-600">ebarimt.mn-ээр шалгах</p>
            <div className="mt-3 w-full border border-dashed border-gray-400 py-2 text-center">
              <p className="text-[10px] text-gray-600">Сугалааны дугаар</p>
              <p className="text-xl font-bold tracking-[0.2em]">{preview.lottery}</p>
            </div>
          </div>

          <ReceiptHr />

          <div className="text-center text-[10px]">
            <p>www.ebarimt.mn</p>
            <p className="mt-1 font-bold">Баярлалаа!</p>
          </div>

          <ReceiptHr double />
          <pre className="sr-only">{textLines.join('\n')}</pre>
        </div>
        <div
          className="h-4 bg-[#fffef8]"
          style={{
            clipPath:
              'polygon(0% 0%, 5% 100%, 10% 0%, 15% 100%, 20% 0%, 25% 100%, 30% 0%, 35% 100%, 40% 0%, 45% 100%, 50% 0%, 55% 100%, 60% 0%, 65% 100%, 70% 0%, 75% 100%, 80% 0%, 85% 100%, 90% 0%, 95% 100%, 100% 0%)',
          }}
        />
      </div>
    </div>
  );
}

function ReceiptLine({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <p className="flex justify-between gap-1 text-[10px]">
      <span className="shrink-0 text-gray-600">{label}:</span>
      <span className={`text-right ${mono ? 'font-bold break-all' : ''}`}>{value}</span>
    </p>
  );
}

function TotalLine({ label, value }: { label: string; value: string }) {
  return (
    <p className="flex justify-between text-[11px]">
      <span>{label}</span>
      <span>{value}</span>
    </p>
  );
}

export function ThermalOrderReceipt({
  orderId,
  orderType,
  lines,
  subtotal,
  tax,
  total,
  createdAt,
}: {
  orderId: string;
  orderType: ReceiptData['orderType'];
  lines: ReceiptData['lines'];
  subtotal: number;
  tax: number;
  total: number;
  createdAt: string;
}) {
  return (
    <div className="mx-auto w-[80mm] max-w-full shadow-lg">
      <div className="h-2 bg-gray-200" />
      <div
        className="bg-[#fffef8] px-3 py-3 text-black"
        style={{ fontFamily: '"Courier New", Courier, monospace', fontSize: '11px' }}
      >
        <p className="text-center font-bold">KHONGOR</p>
        <p className="text-center text-[10px] text-gray-600">Захиалгын баримт</p>
        <ReceiptHr />
        <ReceiptLine label="Захиалга" value={orderId} mono />
        <ReceiptLine label="Огноо" value={formatEbarimtDate(createdAt)} />
        <ReceiptLine label="Төрөл" value={orderTypeLabel(orderType)} />
        <ReceiptHr />
        {lines.map((line, index) => (
          <div key={`${line.name}-${index}`} className="mb-1">
            <p>{line.name}</p>
            <p className="pl-2">
              {padLine(`${line.qty} x ${formatMoney(line.unitPrice)}`, formatMoney(line.lineTotal))}
            </p>
          </div>
        ))}
        <ReceiptHr />
        <TotalLine label="Дэд дүн:" value={formatMoney(subtotal)} />
        <TotalLine label="НӨАТ:" value={formatMoney(tax)} />
        <p className="flex justify-between font-bold">
          <span>НИЙТ:</span>
          <span>{formatMoney(total)}</span>
        </p>
        <ReceiptHr />
        <p className="text-center text-[10px]">Баярлалаа!</p>
      </div>
      <div className="h-3 bg-gray-100" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 80%)' }} />
    </div>
  );
}
