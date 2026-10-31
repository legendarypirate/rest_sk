'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { toast } from '@packages/ui/components/sonner';

import type { CheckoutResult } from '@/electron/types/config.types';
import { getApiErrorMessage } from '@/lib/api-error';
import { toReceiptData } from '@/lib/receipt';
import { completeCheckout } from '@/services/kiosk/checkout.service';
import type {
  KioskCartLine,
  KioskProduct,
  KioskServiceType,
  ReceiptMode,
  ReceiptType,
} from '@/types';

import { ALL_CATEGORY } from '../lib/labels';
import { KIOSK_ROUTES } from '../lib/routes';
import { useKioskCatalog } from './use.kiosk-catalog';

const IDLE_RECEIPT_MS = 90_000;
const SERVICE_STORAGE_KEY = 'kiosk:serviceType';
const CART_STORAGE_KEY = 'kiosk:cart';
const SERVICE_CHANGE = 'kiosk:service-change';
const CART_CHANGE = 'kiosk:cart-change';
const EMPTY_CART: KioskCartLine[] = [];

function isKioskPath(pathname: string, route: string) {
  return pathname === route || pathname === route.replace(/\/$/, '');
}

function subscribeService(onChange: () => void) {
  window.addEventListener(SERVICE_CHANGE, onChange);
  return () => window.removeEventListener(SERVICE_CHANGE, onChange);
}

function getServiceSnapshot(): KioskServiceType | null {
  const value = window.sessionStorage.getItem(SERVICE_STORAGE_KEY);
  return value === 'DINE_IN' || value === 'TAKEAWAY' ? value : null;
}

function getServerServiceSnapshot(): KioskServiceType | null {
  return null;
}

function writeService(next: KioskServiceType | null) {
  if (next) {
    window.sessionStorage.setItem(SERVICE_STORAGE_KEY, next);
  } else {
    window.sessionStorage.removeItem(SERVICE_STORAGE_KEY);
  }
  window.dispatchEvent(new Event(SERVICE_CHANGE));
}

let cartRaw: string | null | undefined;
let cartSnapshot: KioskCartLine[] = EMPTY_CART;

function parseCart(raw: string | null): KioskCartLine[] {
  if (!raw) {
    return EMPTY_CART;
  }

  try {
    const parsed = JSON.parse(raw) as KioskCartLine[];
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : EMPTY_CART;
  } catch {
    return EMPTY_CART;
  }
}

function subscribeCart(onChange: () => void) {
  window.addEventListener(CART_CHANGE, onChange);
  return () => window.removeEventListener(CART_CHANGE, onChange);
}

function getCartSnapshot(): KioskCartLine[] {
  const raw = window.sessionStorage.getItem(CART_STORAGE_KEY);
  if (raw === cartRaw) {
    return cartSnapshot;
  }

  cartRaw = raw;
  cartSnapshot = parseCart(raw);
  return cartSnapshot;
}

function getServerCartSnapshot(): KioskCartLine[] {
  return EMPTY_CART;
}

function writeCart(next: KioskCartLine[]) {
  if (next.length === 0) {
    window.sessionStorage.removeItem(CART_STORAGE_KEY);
  } else {
    window.sessionStorage.setItem(CART_STORAGE_KEY, JSON.stringify(next));
  }
  cartRaw = undefined;
  window.dispatchEvent(new Event(CART_CHANGE));
}

export function useKioskOrder() {
  const router = useRouter();
  const pathname = usePathname();
  const catalogQuery = useKioskCatalog();
  const serviceType = useSyncExternalStore(
    subscribeService,
    getServiceSnapshot,
    getServerServiceSnapshot,
  );
  const cart = useSyncExternalStore(
    subscribeCart,
    getCartSnapshot,
    getServerCartSnapshot,
  );

  const [category, setCategory] = useState(ALL_CATEGORY);
  const [query, setQuery] = useState('');
  const [receiptMode, setReceiptMode] = useState<ReceiptMode>('digital');
  const [receiptType, setReceiptType] = useState<ReceiptType>('individual');
  const [tin, setTin] = useState('');
  const [orderNo, setOrderNo] = useState(48);
  const [submitting, setSubmitting] = useState(false);
  const [checkoutResult, setCheckoutResult] = useState<CheckoutResult | null>(null);

  const categories = useMemo(
    () => catalogQuery.data?.categories ?? [ALL_CATEGORY],
    [catalogQuery.data?.categories],
  );

  const visible = useMemo(() => {
    const products = catalogQuery.data?.products ?? [];
    return products.filter((product) => {
      const matchesCategory =
        category === ALL_CATEGORY || product.category === category;
      const haystack = `${product.name} ${product.description}`.toLowerCase();
      return matchesCategory && haystack.includes(query.toLowerCase());
    });
  }, [catalogQuery.data?.products, category, query]);

  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  const total = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  const setServiceType = useCallback((next: KioskServiceType) => {
    writeService(next);
  }, []);

  const reset = useCallback(() => {
    writeCart(EMPTY_CART);
    writeService(null);
    setCategory(ALL_CATEGORY);
    setQuery('');
    setTin('');
    setReceiptMode('digital');
    setReceiptType('individual');
    setSubmitting(false);
    setCheckoutResult(null);
    setOrderNo((value) => value + 1);
    router.push(KIOSK_ROUTES.welcome);
  }, [router]);

  const add = useCallback((product: KioskProduct) => {
    const current = getCartSnapshot();
    const next = current.some((line) => line.id === product.id)
      ? current.map((line) =>
          line.id === product.id
            ? { ...line, quantity: line.quantity + 1 }
            : line,
        )
      : [...current, { ...product, quantity: 1 }];
    writeCart(next);
    toast.success(`${product.name} сагсанд нэмэгдлээ`);
  }, []);

  const adjust = useCallback((id: string, delta: number) => {
    const next = getCartSnapshot()
      .map((line) =>
        line.id === id ? { ...line, quantity: line.quantity + delta } : line,
      )
      .filter((line) => line.quantity > 0);
    writeCart(next);
  }, []);

  async function submitCheckout() {
    if (receiptType === 'company' && tin.length < 7) {
      return;
    }

    setSubmitting(true);
    try {
      const result = await completeCheckout(
        toReceiptData({
          orderNo,
          cart,
          receiptType,
          tin,
          serviceType: serviceType ?? 'DINE_IN',
        }),
      );
      if (!result.success) {
        toast.error(result.message);
        return;
      }
      setCheckoutResult(result);
      toast.success('Төлбөр амжилттай');
      router.push(KIOSK_ROUTES.receipt);
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  useEffect(() => {
    const onReceipt = isKioskPath(pathname, KIOSK_ROUTES.receipt);
    if (!onReceipt) {
      return;
    }

    const delay = IDLE_RECEIPT_MS;
    const timer = window.setTimeout(reset, delay);
    return () => window.clearTimeout(timer);
  }, [pathname, reset]);

  return {
    catalogQuery,
    categories,
    serviceType,
    setServiceType,
    category,
    setCategory,
    query,
    setQuery,
    cart,
    add,
    adjust,
    receiptMode,
    setReceiptMode,
    receiptType,
    setReceiptType,
    tin,
    setTin,
    orderNo,
    visible,
    count,
    total,
    submitting,
    checkoutResult,
    submitCheckout,
    reset,
  };
}
