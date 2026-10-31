'use client';

import { useEffect } from 'react';

import { getApiErrorMessage } from '@/lib/api-error';

import { MenuScreen } from '../components/Menu.screen';
import { CATALOG_LOADING } from '../lib/labels';
import { KIOSK_ROUTES } from '../lib/routes';
import { useKioskOrderContext } from '../providers/kiosk.order.provider';

export default function MenuPage() {
  const { setServiceType, catalogQuery, ...order } = useKioskOrderContext();

  useEffect(() => {
    const service = new URLSearchParams(window.location.search).get('service');
    if (service === 'DINE_IN' || service === 'TAKEAWAY') {
      setServiceType(service);
    }
  }, [setServiceType]);

  if (catalogQuery.isLoading && !catalogQuery.data) {
    return (
      <p className="text-muted-foreground flex flex-1 items-center justify-center text-base">
        {CATALOG_LOADING}
      </p>
    );
  }

  if (catalogQuery.isError) {
    return (
      <p className="text-destructive flex flex-1 items-center justify-center text-base">
        {getApiErrorMessage(catalogQuery.error)}
      </p>
    );
  }

  return (
    <MenuScreen
      category={order.category}
      categories={order.categories}
      visible={order.visible}
      cart={order.cart}
      total={order.total}
      checkoutHref={KIOSK_ROUTES.payment}
      onCategoryChange={order.setCategory}
      onAdd={order.add}
      onAdjust={order.adjust}
    />
  );
}
