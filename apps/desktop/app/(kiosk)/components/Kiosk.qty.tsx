'use client';

type KioskQtyProps = {
  value: number;
  onDecrease: () => void;
  onIncrease: () => void;
};

export function KioskQty({ value, onDecrease, onIncrease }: KioskQtyProps) {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        className="grid size-14 place-items-center rounded-2xl border border-slate-200 bg-white text-2xl font-medium text-[#102A43]"
        onClick={onDecrease}
        aria-label="Хасах"
      >
        −
      </button>
      <span className="min-w-10 text-center text-xl font-semibold tabular-nums">
        {value}
      </span>
      <button
        type="button"
        className="grid size-14 place-items-center rounded-2xl border border-slate-200 bg-white text-2xl font-medium text-[#102A43]"
        onClick={onIncrease}
        aria-label="Нэмэх"
      >
        +
      </button>
    </div>
  );
}
