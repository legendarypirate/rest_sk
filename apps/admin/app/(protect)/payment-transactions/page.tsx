'use client';

import { PageWrapper } from '@/layouts/page.wrapper';
import { PlatformPermission } from '@/types/routes';

import { TransactionsScreen } from './components';

export default function PaymentTransactionsPage() {
  return (
    <PageWrapper title="Төлбөр" permission={PlatformPermission.PaymentTransactionsRead}>
      <TransactionsScreen />
    </PageWrapper>
  );
}
